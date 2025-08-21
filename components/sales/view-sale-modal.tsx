import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/apis";
import { format } from "date-fns";
import { Button } from "../ui/button";

interface ViewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
}

export default function ViewSaleModal({ isOpen, onClose, saleId }: ViewSaleModalProps) {
  const { data: sale, isLoading, isError, error } = api.Sale.GetById.useQuery(saleId);

  if (isLoading) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Loading Sale Order...</DialogTitle>
        </DialogHeader>
        <div>Loading...</div>
      </DialogContent>
    </Dialog>
  );

  if (isError) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Error Loading Sale Order</DialogTitle>
        </DialogHeader>
        <div>Error: {error?.message}</div>
      </DialogContent>
    </Dialog>
  );

  if (!sale) return null; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline">View Sale Order</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Sale Order Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium">Sale ID:</p>
              <p>{sale.id}</p>
            </div>
            <div>
              <p className="font-medium">Customer:</p>
              <p>{sale.customerName || sale.customerId || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium">Sale Date:</p>
              <p>{format(new Date(sale.createdAt), "PPP")}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">${parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-right">
            <div>
              <p className="font-medium">Subtotal:</p>
              <p className="text-lg font-bold">${parseFloat(sale.subtotal).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Discount:</p>
              <p className="text-lg font-bold">${parseFloat(sale.discount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Tax Amount:</p>
              <p className="text-lg font-bold">${parseFloat(sale.taxAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Total Amount:</p>
              <p className="text-lg font-bold">${parseFloat(sale.totalAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Paid Amount:</p>
              <p className="text-lg font-bold">${parseFloat(sale.paidAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="font-medium">Payment Status:</p>
              <p>{sale.paymentStatus}</p>
            </div>
            <div>
              <p className="font-medium">Sale Status:</p>
              <p>{sale.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
