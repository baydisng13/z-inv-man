import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/apis";
import { format } from "date-fns";
import { Button } from "../ui/button";

interface ViewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string ;
}

export default function ViewPurchaseModal({ isOpen, onClose, purchaseId }: ViewPurchaseModalProps) {
  const { data: purchase, isLoading, isError, error } = api.Purchase.GetById.useQuery(purchaseId);
  

  if (isLoading) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Loading Purchase Order...</DialogTitle>
        </DialogHeader>
        <div>Loading...</div>
      </DialogContent>
    </Dialog>
  );

  if (isError) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Error Loading Purchase Order</DialogTitle>
        </DialogHeader>
        <div>Error: {error?.message}</div>
      </DialogContent>
    </Dialog>
  );

  if (!purchase) return null; // Should not happen if enabled is false when purchaseId is null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogTrigger asChild>
        <Button variant="outline">View Purchase Order</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Purchase Order Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium">Purchase ID:</p>
              <p>{purchase.id}</p>
            </div>
            <div>
              <p className="font-medium">Supplier:</p>
              <p>{purchase.supplierName || purchase.supplierId || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium">Order Date:</p>
              <p>{format(new Date(purchase.createdAt), "PPP")}</p>
            </div>
            <div>
              <p className="font-medium">Received Date:</p>
              <p>{purchase.receivedAt ? format(new Date(purchase.receivedAt), "PPP") : "-"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.costPrice}</TableCell>
                    <TableCell className="text-right">${parseFloat(item.costPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${(parseFloat(item.costPrice) * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-right">
            <div>
              <p className="font-medium">Total Amount:</p>
              <p className="text-lg font-bold">${parseFloat(purchase.totalAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Paid Amount:</p>
              <p className="text-lg font-bold">${parseFloat(purchase.paidAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Payment Status:</p>
              <p>{purchase.paymentStatus}</p>
            </div>
            <div>
              <p className="font-medium">Order Status:</p>
              <p>{purchase.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
