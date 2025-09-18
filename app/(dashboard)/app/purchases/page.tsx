"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Filter } from "lucide-react"
import Papa from "papaparse"

import api from "@/apis";
import NewPurchaseModal from "@/components/purchases/new-purchase-modal"
import CustomerTableSkeleton from "@/components/customer-table-skeleton"
import ReceiptModal from "@/components/purchases/receipt-modal"
import CsvExportModal from "@/components/csv-export"
import { saveCSV } from "@/lib/utils"

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");


  const {
    data: purchasesData,
    isLoading,
    isError,
    error,
  } = api.Purchase.GetAll.useQuery();

  const filteredPurchases = purchasesData
    ? purchasesData.filter((purchase) => {
        // Assuming supplier name will be joined or fetched separately later
        const supplierName = purchase.supplier.name || purchase.supplierId || ""; // Use supplierId as placeholder
        const matchesSearch = supplierName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPaymentStatus = paymentStatusFilter === "all" || purchase.paymentStatus === paymentStatusFilter;
        const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
        return matchesSearch && matchesPaymentStatus && matchesStatus;
      })
    : [];

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default">Paid</Badge>;
      case "PARTIAL":
        return <Badge variant="secondary">Partial</Badge>;
      case "CREDIT":
        return <Badge variant="outline">Credit</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <Badge variant="default">Received</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) return <CustomerTableSkeleton />;
  if (isError) return <div>Error loading purchase orders: {error?.message}</div>;

  function onExport(startDate: string, endDate: string) {
    if (!purchasesData) return;

    const filteredData = purchasesData.filter((purchase) => {
      const purchaseDate = new Date(purchase.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      return purchaseDate >= start && purchaseDate <= end;
    });

    const sortedData = filteredData.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    //TODO: update this based on template
    const csvData = sortedData.map(purchase => ({
      ID: purchase.id,
      Supplier: purchase.supplier.name || purchase.supplierId || 'N/A',
      'Total Amount': parseFloat(purchase.totalAmount).toFixed(2),
      'Paid Amount': parseFloat(purchase.paidAmount).toFixed(2),
      'Payment Status': purchase.paymentStatus,
      'Order Status': purchase.status,
      'Received Date': purchase.receivedAt ? new Date(purchase.receivedAt).toLocaleDateString() : '-',
      'Created Date': new Date(purchase.createdAt).toLocaleDateString()
    }));

    const csvContent = Papa.unparse(csvData);
    saveCSV(csvContent, { download: `purchases_${startDate}_to_${endDate}.csv` })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your purchase orders and supplier relationships</p>
        </div>

        <div className="flex justify-center gap-2">
          <CsvExportModal onExport={onExport} />
          <NewPurchaseModal />
        </div>

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
                <TableCell  className="font-medium">{purchase.supplier.name || purchase.supplierId || "N/A"}</TableCell>
                <TableCell  >${parseFloat(purchase.totalAmount).toFixed(2)}</TableCell>
                <TableCell >${parseFloat(purchase.paidAmount).toFixed(2)}</TableCell>
                <TableCell >{getPaymentStatusBadge(purchase.paymentStatus)}</TableCell>
                <TableCell >{getStatusBadge(purchase.status)}</TableCell>
                <TableCell >
                  {purchase.receivedAt ? new Date(purchase.receivedAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell key={`${purchase.id}-created`}>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                <TableCell key={`${purchase.id}-actions`} className="text-right">
                 
                  <ReceiptModal  purchase={purchase} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPurchases.length} of {purchasesData?.length ?? 0} purchase orders
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
  );
}