"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter } from "lucide-react"

// Mock data
const products = [
  {
    id: 1,
    barcode: "1234567890123",
    name: "iPhone 15 Pro",
    unit: "pcs",
    sellingPrice: 999.99,
    archived: false,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    barcode: "2345678901234",
    name: "Samsung Galaxy S24",
    unit: "pcs",
    sellingPrice: 899.99,
    archived: false,
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    barcode: "3456789012345",
    name: 'MacBook Pro 14"',
    unit: "pcs",
    sellingPrice: 1999.99,
    archived: false,
    createdAt: "2024-01-13",
  },
  {
    id: 4,
    barcode: "4567890123456",
    name: "Dell XPS 13",
    unit: "pcs",
    sellingPrice: 1299.99,
    archived: true,
    createdAt: "2024-01-12",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [unitFilter, setUnitFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm)
      const matchesUnit = unitFilter === "all" || product.unit === unitFilter
      return matchesSearch && matchesUnit
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price":
          return b.sellingPrice - a.sellingPrice
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            <SelectItem value="pcs">Pieces</SelectItem>
            <SelectItem value="kg">Kilograms</SelectItem>
            <SelectItem value="lbs">Pounds</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="date">Date Created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barcode</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>${product.sellingPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={product.archived ? "secondary" : "default"}>
                    {product.archived ? "Archived" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/products/${product.id}`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
