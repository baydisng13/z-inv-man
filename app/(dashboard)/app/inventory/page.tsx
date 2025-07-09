"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, AlertTriangle, Plus, History } from "lucide-react"
import Link from "next/link"

import api from "@/apis";
import { Skeleton } from "@/components/ui/skeleton"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: inventoryData,
    isLoading,
    isError,
    error,
  } = api.Inventory.GetAllStock.useQuery();

  const getStatusBadge = (quantity: number, threshold: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity <= threshold) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  const filteredInventory = inventoryData
    ? inventoryData.filter((item) => {
        const productName = item.products?.name || "";
        const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const status = item.quantity === 0 ? "out_of_stock" : (item.quantity <= 10 ? "low_stock" : "in_stock"); // Using a default threshold of 10
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  const stats = [
    {
      title: "Total Items",
      value: inventoryData?.length.toString() || "0",
      icon: "📦",
    },
    {
      title: "Low Stock",
      value: inventoryData?.filter((item) => item.quantity <= 10 && item.quantity > 0).length.toString() || "0",
      icon: "⚠️",
    },
    {
      title: "Out of Stock",
      value: inventoryData?.filter((item) => item.quantity === 0).length.toString() || "0",
      icon: "🚫",
    },
    {
      title: "Well Stocked",
      value: inventoryData?.filter((item) => item.quantity > 10).length.toString() || "0",
      icon: "✅",
    },
  ];

  if (isLoading) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor your stock levels and movements</p>
        </div>
        {/* <div className="flex gap-2">
          <Button variant="outline" disabled>
            <History className="h-4 w-4 mr-2" />
            View Movements
          </Button>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
        </div> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Low Stock Alert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  if (isError) return <div>Error loading inventory: {error?.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor your stock levels and movements</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/inventory/movements">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              View Movements
            </Button>
          </Link>
          <Link href="/app/inventory/adjust">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Low Stock Alert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.productId}>
                <TableCell className="font-medium">{item.products?.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.quantity}
                    {item.quantity <= 10 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  </div>
                </TableCell>
                <TableCell>10</TableCell> {/* Placeholder for low stock threshold */}
                <TableCell>{getStatusBadge(item.quantity, 10)}</TableCell>
                <TableCell>{new Date(item.lastUpdatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
