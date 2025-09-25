import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { PurchaseType, PurchaseItemType } from "@/schemas/purchase-schema";
import { format } from "date-fns";
import { PurchaseItemWithProductResType } from "@/apis/purchases";



export default function ReceiptModal({ purchase }: { purchase: PurchaseItemWithProductResType }) {
  const [isOpen, setIsOpen] = useState(false);

  const subtotal = purchase.items?.reduce((sum, item) => sum + (parseFloat(item.costPrice) * item.quantity), 0) || 0;
  const tax = subtotal * 0.08; // Example tax rate
  const total = subtotal + tax;

  const handleScreenshot = async () => {
    const receiptElement = document.getElementById("receipt-content");
    const modalContent = receiptElement?.closest('[role="dialog"]') as HTMLElement;

    if (!receiptElement) return;

    // Store original styles
    const originalReceiptStyles = {
      maxWidth: receiptElement.style.maxWidth,
      width: receiptElement.style.width,
      transform: receiptElement.style.transform,
      position: receiptElement.style.position,
      zIndex: receiptElement.style.zIndex,
      backgroundColor: receiptElement.style.backgroundColor,
      color: receiptElement.style.color,
    };

    const elementsWithInlineStyles: { element: HTMLElement; style: string }[] = [];
    receiptElement.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style && htmlEl.style.cssText) {
        elementsWithInlineStyles.push({ element: htmlEl, style: htmlEl.style.cssText });
        htmlEl.style.cssText = ''; // Clear inline styles
      }
    });

    const originalModalStyles = modalContent
      ? {
          maxWidth: modalContent.style.maxWidth,
          width: modalContent.style.width,
          maxHeight: modalContent.style.maxHeight,
          overflow: modalContent.style.overflow,
        }
      : null;

    try {
      // Temporarily expand for screenshot
      receiptElement.style.maxWidth = "400px";
      receiptElement.style.width = "400px";
      receiptElement.style.transform = "none";
      receiptElement.style.position = "relative";
      receiptElement.style.zIndex = "9999";
      receiptElement.style.backgroundColor = 'white';
      receiptElement.style.color = 'black';

      if (modalContent) {
        modalContent.style.maxWidth = "none";
        modalContent.style.width = "auto";
        modalContent.style.maxHeight = "none";
        modalContent.style.overflow = "visible";
      }

      // Also temporarily remove scrolling from the inner content
      const scrollableContent = receiptElement.querySelector(
        '[class*="max-h-"][class*="overflow-y-auto"]',
      ) as HTMLElement;
      const originalScrollStyles = scrollableContent
        ? {
            maxHeight: scrollableContent.style.maxHeight,
            overflow: scrollableContent.style.overflow,
          }
        : null;

      if (scrollableContent) {
        scrollableContent.style.maxHeight = "none";
        scrollableContent.style.overflow = "visible";
      }

      // Wait a moment for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(receiptElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 400,
        height: receiptElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      const link = document.createElement("a");
      link.download = `receipt-${purchase.id}.png`;
      link.href = canvas.toDataURL();
      link.click();

      // Restore scrollable content styles
      if (scrollableContent && originalScrollStyles) {
        scrollableContent.style.maxHeight = originalScrollStyles.maxHeight;
        scrollableContent.style.overflow = originalScrollStyles.overflow;
      }
    } catch (error) {
      console.error("Error generating screenshot:", error);
    } finally {
      // Restore original styles
      receiptElement.style.maxWidth = originalReceiptStyles.maxWidth;
      receiptElement.style.width = originalReceiptStyles.width;
      receiptElement.style.transform = originalReceiptStyles.transform;
      receiptElement.style.position = originalReceiptStyles.position;
      receiptElement.style.zIndex = originalReceiptStyles.zIndex;

      if (modalContent && originalModalStyles) {
        modalContent.style.maxWidth = originalModalStyles.maxWidth;
        modalContent.style.width = originalModalStyles.width;
        modalContent.style.maxHeight = originalModalStyles.maxHeight;
        modalContent.style.overflow = originalModalStyles.overflow;
      }

      // Restore original background-color and color
      receiptElement.style.backgroundColor = originalReceiptStyles.backgroundColor;
      receiptElement.style.color = originalReceiptStyles.color;

      elementsWithInlineStyles.forEach(({ element, style }) => {
        element.style.cssText = style;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"sm"}>View</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none max-h-[90vh]">
        <div className="relative">
          {/* Paper Receipt Container */}
          <div
            id="receipt-content"
            className="relative bg-white mx-auto max-w-sm shadow-2xl"
          >
            {/* Top Zigzag Edge */}
            <div
              className="w-full h-4 bg-gray-100 relative"
              style={{
                clipPath:
                  "polygon(0 0, 8% 100%, 16% 0, 24% 100%, 32% 0, 40% 100%, 48% 0, 56% 100%, 64% 0, 72% 100%, 80% 100%, 88% 0, 96% 100%, 100% 0)",
              }}
            />

            {/* Scrollable Content */}
            <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
              {/* Thank You Message */}
              <div className="text-center mb-6">
                <DialogTitle className="text-black text-xs font-mono">
                  Purchase Details
                </DialogTitle>
              </div>

              {/* Store Info (Placeholder) */}
              <div className="text-center mb-4 font-mono text-xs text-black/80 ">
                <p className="font-bold">Your Company Name</p>
                <p>Your Address, City, State, Zip</p>
                <p>Tel: (XXX) XXX-XXXX</p>
              </div>

              {/* Dashed Line */}
              <div className="border-t border-dashed border-gray-400 mb-4"></div>

              {/* Purchase Details */}
              <div className="space-y-1 mb-4 font-mono text-xs text-black/80">
                {/* <div className="flex justify-between">
                  <span className="text-black">PURCHASE ID:</span>
                  <span className="text-right">{purchase.id}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-black">DATE & TIME:</span>
                  <span>{format(new Date(purchase.createdAt), 'dd MMM yyyy • HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">SUPPLIER:</span>
                  <span>{purchase?.supplier?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">TIN NUMBER:</span>
                  <span>{purchase?.supplier?.tin_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">STATUS:</span>
                  <span>{purchase.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">PAYMENT STATUS:</span>
                  <span>{purchase.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">CREATED BY:</span>
                  <span>{purchase.createdByUser.name}</span>
                </div>
                {purchase.receivedAt && (
                  <div className="flex justify-between">
                    <span className="text-black">RECEIVED AT:</span>
                    <span>{format(new Date(purchase.receivedAt), 'dd MMM yyyy • HH:mm')}</span>
                  </div>
                )}
                {purchase.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-black">LAST UPDATED:</span>
                    <span>{format(new Date(purchase.updatedAt), 'dd MMM yyyy • HH:mm')}</span>
                  </div>
                )}
              </div>

              {/* Dashed Line */}
              <div className="border-t border-dashed border-gray-400 mb-4 "></div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {purchase.items?.map((item, index) => (
                  <div key={index} className="font-mono text-xs text-black/80 font-semibold">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-black text-xs">
                          {item.quantity} x {parseFloat(item.costPrice).toFixed(2)  } ETB 
                        </p>
                      </div>
                      <div className="text-right font-bold">{(parseFloat(item.costPrice) * item.quantity).toFixed(2)} ETB </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dashed Line */}
              <div className="border-t border-dashed border-gray-400 mb-3"></div>

              {/* Totals */}
              <div className="space-y-1 mb-4 font-mono text-xs text-black/80">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{subtotal.toFixed(2)} ETB </span>
                </div>
                <div className="flex justify-between">
                  <span>TAX (8%):</span>
                  <span>{tax.toFixed(2)} ETB </span>
                </div>
                <div className="border-t border-gray-400 pt-1 mt-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL:</span>
                    <span>{total.toFixed(2)} ETB </span>
                  </div>
                </div>
              </div>

              {/* Payment Method (Placeholder) */}
              <div className="mb-4">
                <div className="flex items-center gap-2 font-mono text-xs uppercase">
                  
                  <div className="flex justify-between w-full">
                    <p className="font-semibold text-black/80">Payment Staus</p>
                    <p className="text-black">{purchase.paymentStatus}</p>
                  </div>
                </div>
              </div>

              {/* Dashed Line */}
              <div className="border-t border-dashed border-gray-400 mb-4"></div>

              {/* Footer Message */}
              <div className="text-center mb-4 font-mono text-xs text-black">
                <p>Thank you for your business!</p>
                <p>Please come again soon</p>
              </div>

              {/* Barcode (Placeholder) */}
              <div className="flex justify-center mb-2">
                <div className="text-center">
                  <div className="flex items-end justify-center gap-px mb-1 bg-white p-2">
                    <img src={`https://barcode.tec-it.com/barcode.ashx?data=${purchase.id.split("-")[0]}`} alt="Barcode" className=" h-16" />
                  </div>
                  {/* <p className="text-xs text-black tracking-wider font-mono">{purchase.id.split("-")[0]}</p> */}
                </div>
              </div>
            </div>

            {/*
            <div className="mt-4 px-6">
              <Button onClick={handleScreenshot} className="w-full bg-transparent" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
            */}
          </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}