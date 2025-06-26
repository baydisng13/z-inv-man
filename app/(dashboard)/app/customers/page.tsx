"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus } from "lucide-react"

// Mock data
const customers = [
  {
    id: 1,
    name: "John Smith",
    phone: "+1 (555) 234-5678",
    email: "john.smith@email.com",
    country: "United States",
    address: "123 Main Street, New York, NY 10001",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    phone: "+1 (555) 345-6789",
    email: "sarah.j@email.com",
    country: "Canada",
    address: "456 Oak Avenue, Vancouver, BC V6B 1A1",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    name: "Mike Wilson",
    phone: "+44 20 7123 4567",
    email: "mike.wilson@email.co.uk",
    country: "United Kingdom",
    address: "789 High Street, Manchester, M1 1AA",
    createdAt: "2024-01-13",
  },
  {
    id: 4,
    name: "Emily Davis",
    phone: "+61 2 9876 5432",
    email: "emily.davis@email.com.au",
    country: "Australia",
    address: "321 Collins Street, Melbourne, VIC 3000",
    createdAt: "2024-01-12",
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.country}</TableCell>
                <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/customers/${customer.id}`}>
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
          Showing {filteredCustomers.length} of {customers.length} customers
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
