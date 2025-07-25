"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { Customer } from "@/apis/customers";
import EditCustomerModal from "@/components/customers/edit-customer-modal";
import NewCustomerModal from "@/components/customers/new-customer-modal";
import { useGlobalModal } from "@/store/useGlobalModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import CustomerTableSkeleton from "@/components/customer-table-skeleton";
import { Label } from "@/components/ui/label";
import { CustomerType } from "@/schemas/customer-schema";

export default function CustomersPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(
    null
  );
  const { openModal } = useGlobalModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: customers, isLoading } = Customer.GetAll.useQuery();

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter((customer) =>
      Object.values(customer).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [customers, searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCustomers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

  const handleEdit = (c: CustomerType) => {
    setSelectedCustomer(c);
    setIsEditModalOpen(true);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage - 1 <= halfMaxPages) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }

    if (totalPages - currentPage < halfMaxPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft />
            </Button>
          </PaginationItem>
          {startPage > 1 && <PaginationItem>...</PaginationItem>}
          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {endPage < totalPages && <PaginationItem>...</PaginationItem>}
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => openModal({ title: "Create New Customer", content: <NewCustomerModal /> })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      {isLoading ? (
        <CustomerTableSkeleton />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>TIN Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.tin_number}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           <div className="flex justify-between items-center mt-4 w-full ">
            <div className="flex flex-col w-full  gap-2">
              <Label>Rows per page:</Label>
              <Select onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger className="">
                  <SelectValue placeholder={rowsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {`Showing ${paginatedCustomers.length} of ${filteredCustomers.length} customers`}
              </span>
            </div>
            {renderPagination()}
          </div>
        </>
      )}
      {selectedCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}