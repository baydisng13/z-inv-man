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

// Mock data
const inventory = [
  {
    id: 1,
    productName: "iPhone 15 Pro",
    quantity: 45,
    lowStockThreshold: 10,
    lastUpdated: "2024-01-15T10:30:00Z",
    status: "in_stock",
  },
  {
    id: 2,
    productName: "Samsung Galaxy S24",
    quantity: 8,
    lowStockThreshold: 10,
    lastUpdated: "2024-01-14T15:45:00Z",
    status: "low_stock",
  },
  {
    id: 3,
    productName: 'MacBook Pro 14"',
    quantity: 0,
    lowStockThreshold: 5,
    lastUpdated: "2024-01-13T09:15:00Z",
    status: "out_of_stock",
  },
  {
    id: 4,
    productName: "Dell XPS 13",
    quantity: 23,
    lowStockThreshold: 15,
    lastUpdated: "2024-01-12T14:20:00Z",
    status: "in_stock",
  },
]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string, quantity: number, threshold: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (quantity <= threshold) {
      return <Badge variant="secondary">Low Stock</Badge>
    } else {
      return <Badge variant="default">In Stock</Badge>
    }
  }

  const stats = [
    {
      title: "Total Items",
      value: inventory.length.toString(),
      icon: "📦",
    },
    {
      title: "Low Stock",
      value: inventory.filter((item) => item.quantity <= item.lowStockThreshold && item.quantity > 0).length.toString(),
      icon: "⚠️",
    },
    {
      title: "Out of Stock",
      value: inventory.filter((item) => item.quantity === 0).length.toString(),
      icon: "🚫",
    },
    {
      title: "Well Stocked",
      value: inventory.filter((item) => item.quantity > item.lowStockThreshold).length.toString(),
      icon: "✅",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor your stock levels and movements</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/movements">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              View Movements
            </Button>
          </Link>
          <Link href="/inventory/adjust">
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
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.quantity}
                    {item.quantity <= item.lowStockThreshold && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  </div>
                </TableCell>
                <TableCell>{item.lowStockThreshold}</TableCell>
                <TableCell>{getStatusBadge(item.status, item.quantity, item.lowStockThreshold)}</TableCell>
                <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
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
  )
}
