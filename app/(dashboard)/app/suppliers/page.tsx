"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus } from "lucide-react"

// Mock data
const suppliers = [
  {
    id: 1,
    name: "Tech Distributors Inc",
    phone: "+1 (555) 123-4567",
    email: "contact@techdist.com",
    country: "United States",
    address: "123 Tech Street, Silicon Valley, CA 94000",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "Global Electronics",
    phone: "+1 (555) 987-6543",
    email: "sales@globalelec.com",
    country: "Canada",
    address: "456 Electronics Ave, Toronto, ON M5V 3A8",
    createdAt: "2024-01-08",
  },
  {
    id: 3,
    name: "Mobile World Supply",
    phone: "+44 20 7946 0958",
    email: "orders@mobileworld.co.uk",
    country: "United Kingdom",
    address: "789 Mobile Lane, London, SW1A 1AA",
    createdAt: "2024-01-05",
  },
  {
    id: 4,
    name: "Computer Parts Co",
    phone: "+49 30 12345678",
    email: "info@computerparts.de",
    country: "Germany",
    address: "321 Hardware Str, Berlin, 10115",
    createdAt: "2024-01-03",
  },
]

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships</p>
        </div>
        <Link href="/suppliers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers by name, email, or country..."
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
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.country}</TableCell>
                <TableCell className="max-w-xs truncate">{supplier.address}</TableCell>
                <TableCell>{new Date(supplier.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/suppliers/${supplier.id}`}>
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
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
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
