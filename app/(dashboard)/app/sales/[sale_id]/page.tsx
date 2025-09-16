"use client";

import { useParams, useRouter } from "next/navigation";
import api from "@/apis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SingleSalePage() {
  const router = useRouter();
  const { sale_id } = useParams<{ sale_id: string }>();

  const { data: sale, isLoading, isError, error } = api.Sales.GetById.useQuery(sale_id);

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
        return <Badge variant="default">Completed</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl w-full mx-auto p-8">
        <h1 className="text-2xl font-semibold">Loading Sale Details...</h1>
        <p className="text-muted-foreground">Fetching sale information.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl w-full mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-red-500">Error Loading Sale</h1>
        <p className="text-muted-foreground">Failed to load sale details: {error?.message}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="max-w-7xl w-full mx-auto p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Sale Not Found</h1>
        <p className="text-muted-foreground">The requested sale could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-8">
      {/* Header */}
        <Link href="/app/sales">
          <Button variant="default" className="backdrop-blur-sm bg-accent rounded-4xl text-accent-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales
          </Button>
        </Link>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">Sale Details</h1>
          <p className="text-muted-foreground">Sale #{sale.id.substring(0, 8)}...</p>
        </div>
        <div className="flex gap-2 justify-center md:justify-end">
          {getPaymentStatusBadge(sale.paymentStatus)}
          {getStatusBadge(sale.status)}
        </div>
      </div>

      {/* Customer & Payment Info */}
      <Card className="shadow-none rounded-2xl">
        <CardHeader>
          <CardTitle>Customer & Payment Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p><span className="text-muted-foreground">Customer:</span> <strong>{sale.customerName}</strong></p>
            <p><span className="text-muted-foreground">Total Amount:</span> ${sale.totalAmount}</p>
            <p><span className="text-muted-foreground">Paid Amount:</span> ${sale.paidAmount}</p>
          </div>
          <div className="space-y-2">
            <p><span className="text-muted-foreground">Created At:</span> {new Date(sale.createdAt).toLocaleDateString()}</p>
            <p><span className="text-muted-foreground">Discount:</span> ${sale.discount}</p>
            <p><span className="text-muted-foreground">Tax:</span> ${sale.taxAmount}</p>
          </div>
        </CardContent>
      </Card>

      {/* Sale Items */}
      <Card className="shadow-none rounded-2xl">
        <CardHeader>
          <CardTitle>Sale Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.saleItems && sale.saleItems.length > 0 ? (
                sale.saleItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice}</TableCell>
                    <TableCell className="text-right">${item.total}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No items in this sale.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
