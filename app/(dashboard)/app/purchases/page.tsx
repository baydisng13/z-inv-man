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
const purchases = [
  {
    id: 1,
    supplier: "Tech Distributors Inc",
    totalAmount: 15000.0,
    paidAmount: 15000.0,
    paymentStatus: "PAID",
    status: "RECEIVED",
    receivedDate: "2024-01-15",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    supplier: "Global Electronics",
    totalAmount: 8500.0,
    paidAmount: 4250.0,
    paymentStatus: "PARTIAL",
    status: "RECEIVED",
    receivedDate: "2024-01-14",
    createdAt: "2024-01-08",
  },
  {
    id: 3,
    supplier: "Mobile World Supply",
    totalAmount: 12000.0,
    paidAmount: 0.0,
    paymentStatus: "CREDIT",
    status: "DRAFT",
    receivedDate: null,
    createdAt: "2024-01-12",
  },
  {
    id: 4,
    supplier: "Computer Parts Co",
    totalAmount: 5500.0,
    paidAmount: 5500.0,
    paymentStatus: "PAID",
    status: "CANCELLED",
    receivedDate: null,
    createdAt: "2024-01-05",
  },
]

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPaymentStatus = paymentStatusFilter === "all" || purchase.paymentStatus === paymentStatusFilter
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter
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
        return <Badge variant="default">Received</Badge>
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
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your purchase orders and supplier relationships</p>
        </div>
        <Link href="/purchases/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by supplier..."
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
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.supplier}</TableCell>
                <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                <TableCell>${purchase.paidAmount.toFixed(2)}</TableCell>
                <TableCell>{getPaymentStatusBadge(purchase.paymentStatus)}</TableCell>
                <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                <TableCell>
                  {purchase.receivedDate ? new Date(purchase.receivedDate).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/purchases/${purchase.id}`}>
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
          Showing {filteredPurchases.length} of {purchases.length} purchase orders
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
