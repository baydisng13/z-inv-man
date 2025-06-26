"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Filter } from "lucide-react"

// Mock data
const sales = [
  {
    id: 1,
    customer: "John Smith",
    subtotal: 2500.0,
    discount: 100.0,
    total: 2400.0,
    paidAmount: 2400.0,
    paymentStatus: "PAID",
    status: "RECEIVED",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    customer: "Sarah Johnson",
    subtotal: 1800.0,
    discount: 0.0,
    total: 1800.0,
    paidAmount: 900.0,
    paymentStatus: "PARTIAL",
    status: "RECEIVED",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    customer: "Mike Wilson",
    subtotal: 3200.0,
    discount: 200.0,
    total: 3000.0,
    paidAmount: 0.0,
    paymentStatus: "CREDIT",
    status: "DRAFT",
    createdAt: "2024-01-13",
  },
  {
    id: 4,
    customer: "Emily Davis",
    subtotal: 750.0,
    discount: 50.0,
    total: 700.0,
    paidAmount: 700.0,
    paymentStatus: "PAID",
    status: "CANCELLED",
    createdAt: "2024-01-12",
  },
]

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPaymentStatus = paymentStatusFilter === "all" || sale.paymentStatus === paymentStatusFilter
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    return matchesSearch && matchesPaymentStatus && matchesStatus
  })

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default">Paid</Badge>
      case "PARTIAL":
        return <Badge variant="secondary">Partial</Badge>
      case "CREDIT":
        return <Badge variant="outline">Credit</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <Badge variant="default">Completed</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">Track your sales and customer transactions</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="CREDIT">Credit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="RECEIVED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.customer}</TableCell>
                <TableCell>${sale.subtotal.toFixed(2)}</TableCell>
                <TableCell>${sale.discount.toFixed(2)}</TableCell>
                <TableCell className="font-medium">${sale.total.toFixed(2)}</TableCell>
                <TableCell>${sale.paidAmount.toFixed(2)}</TableCell>
                <TableCell>{getPaymentStatusBadge(sale.paymentStatus)}</TableCell>
                <TableCell>{getStatusBadge(sale.status)}</TableCell>
                <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/sales/${sale.id}`}>
                    <Button variant="ghost" size="sm">
                      View
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
          Showing {filteredSales.length} of {sales.length} sales orders
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
