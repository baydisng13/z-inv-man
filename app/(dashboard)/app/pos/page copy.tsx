"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Minus,
  Trash2,
  Scan,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import api from "@/apis";
import { ProductWithCategoryType } from "@/schemas/product-schema";

// Schemas
const productSchema = z.object({
  productCode: z.string().min(1, "Product code is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  cart : z.array(productSchema),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]),
  partialAmount: z.string().optional(),
  customerId: z.string().optional(),

})


interface CartItem {
  id: string;
  product: ProductWithCategoryType;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  tin: string;
  companyName: string;
  verified: boolean;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    tin: "123456789",
    companyName: "ABC Corp Ltd",
    verified: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    tin: "987654321",
    companyName: "XYZ Industries",
    verified: true,
  },
  {
    id: "3",
    name: "Bob Johnson",
    tin: "456789123",
    companyName: "Johnson & Co",
    verified: false,
  },
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [customerName, setCustomerName] = useState("");
  const [customerTin, setCustomerTin] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>(
    "All"
  );
  const [includeTax, setIncludeTax] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "paid" | "unpaid" | "partial"
  >("paid");
  const [partialAmount, setPartialAmount] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const productInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  const TAX_RATE = 0.15;

  const { data: categories, isSuccess: isCategoriesSuccess } =
    api.Category.GetAll.useQuery();

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productCode: "",
      quantity: 1,
    },
  });

  // Aggressive focus management
  const focusSearchInput = useCallback(() => {
    setTimeout(() => {
      if (productInputRef.current) {
        productInputRef.current.focus();
        productInputRef.current.select();
      }
    }, 10);
  }, []);

  useEffect(() => {
    focusSearchInput();
  }, [focusSearchInput]);

  // Reset and focus after any action
  const resetAndFocus = useCallback(() => {
    productForm.reset({ productCode: "", quantity: 1 });
    setProductSearch("");
    focusSearchInput();
  }, [productForm, focusSearchInput]);

  const addToCart = useCallback(
    (product: ProductWithCategoryType, quantity = 1) => {
      const existingItem = cart.find((item) => item.product.id === product.id);

      if (existingItem) {
        setCart((prev) =>
          prev.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total: item.unitPrice * (item.quantity + quantity),
                }
              : item
          )
        );
      } else {
        const newItem: CartItem = {
          id: Date.now().toString(),
          product,
          quantity,
          unitPrice: Number(product.sellingPrice),
          total: Number(product.sellingPrice) * quantity,
        };
        setCart((prev) => [...prev, newItem]);
      }

      resetAndFocus();
    },
    [cart, resetAndFocus]
  );

  const onProductSubmit = useCallback(
    (values: z.infer<typeof productSchema>) => {
      const product = filteredProducts.find(
        (p) =>
          p.barcode === values.productCode ||
          p.name.toLowerCase().includes(values.productCode.toLowerCase())
      );

      if (product) {
        addToCart(product, values.quantity);
      } else {
        // Product not found - reset and focus
        resetAndFocus();
      }
    },
    [addToCart, resetAndFocus]
  );

  const updateCartItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total: item.unitPrice * newQuantity,
                }
              : item
          )
        );
      }
      // focusSearchInput()
    },
    [focusSearchInput]
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
      focusSearchInput();
    },
    [focusSearchInput]
  );

  const verifyTin = useCallback(() => {
    const customer = mockCustomers.find((c) => c.tin === customerTin);
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerName(customer.name);
    }
    focusSearchInput();
  }, [customerTin, focusSearchInput]);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = includeTax ? subtotal * TAX_RATE : 0;
  const total = subtotal + taxAmount;
  const partialAmountNum = Number.parseFloat(partialAmount) || 0;
  const remainingAmount =
    paymentStatus === "partial" ? total - partialAmountNum : 0;

  const { data: product, isSuccess: isProductSuccess } =
    api.Product.GetAll.useQuery();

  const filteredProducts = isProductSuccess
    ? product.filter((product) => {
        const matchesCategory =
          selectedCategory === "All" ||
          product.categoryId === selectedCategory;
        const matchesSearch =
          product.barcode.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.name.toLowerCase().includes(productSearch.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  console.log("Categories:", categories);
  console.log("Selected Category:", selectedCategory);
  console.log("Filtered Products:", filteredProducts);

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "product") {
        if (quantityInputRef.current) {
          quantityInputRef.current.focus();
        }
      } else if (field === "quantity") {
        productForm.handleSubmit(onProductSubmit)();
      }
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        focusSearchInput();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [focusSearchInput]);

  return (
    <div className="min-h-[calc(100vh-100px)]  flex flex-col">
      {/* Ultra Compact Top Banner */}
      <div className="order-b  py-1 flex items-center justify-between text-xs sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold flex items-center gap-1 ca ">
            <Zap className="h-3 w-3 text-blue-600" />
            POS
          </span>
          <div className="text-gray-500">Items: {cart.length}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Switch
              id="tax"
              checked={includeTax}
              onCheckedChange={setIncludeTax}
              className="scale-75"
            />
            <Label htmlFor="tax" className="text-xs">
              Tax 15%
            </Label>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600 text-sm">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        <div className="flex-1 py-2">
          <div className="mb-2">
            <Form {...productForm}>
              <form
                onSubmit={productForm.handleSubmit(onProductSubmit)}
                className="flex gap-1"
              >
                <div className="flex-1 relative">
                  <Scan className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...productForm.register("productCode")}
                    ref={productInputRef}
                    placeholder="scan/search..."
                    className="pl-7 h-8 text-xs font-mono"
                    onKeyDown={(e) => handleKeyDown(e, "product")}
                    onChange={(e) => {
                      productForm.setValue("productCode", e.target.value);
                      setProductSearch(e.target.value);
                    }}
                    autoComplete="off"
                  />
                </div>
                <Input
                  {...productForm.register("quantity", { valueAsNumber: true })}
                  ref={quantityInputRef}
                  type="number"
                  min="1"
                  defaultValue={1}
                  className="w-12 h-8 text-xs text-center font-mono"
                  onKeyDown={(e) => handleKeyDown(e, "quantity")}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  ⚡
                </Button>
              </form>
            </Form>
          </div>

          {/* Ultra Compact Categories */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  focusSearchInput();
                }}
                className="h-6 px-2 text-xs"
              >
                All
              </Button>
              {isCategoriesSuccess
                ? categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        focusSearchInput();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      {category.name}
                    </Button>
                  ))
                : []}
            </div>
          </div>

          {/* Lightning Products Grid */}
          <div className="text-xs text-gray-500 mb-1 flex justify-between">
            <span>{filteredProducts.length} items ready</span>
            <span className="text-blue-600">Double-click for x2</span>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2 px-2">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-100 border hover:border-blue-300"
                  onClick={() => {
                    addToCart(product);
                  }}
                  onDoubleClick={() => {
                    addToCart(product, 2);
                  }}
                >
                  <CardContent className=" py-0">
                    <div className="text-center flex flex-col gap-4 justify-between ">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-xs text-gray-500  font-mono ">
                          {product.barcode}
                        </div>
                        <div className="text-xs font-medium line-clamp-2 h-8 ">
                          {product.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-green-600">
                          ${product.sellingPrice}
                        </span>
                        <Badge
                          variant={
                            product.inventoryRecords.reduce((sum, item) => sum + item.quantity, 0) < 20
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs px-1 py-0"
                        >
                          {product.inventoryRecords.reduce((sum, item) => sum + item.quantity, 0)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
              <pre>
                {
                  JSON.stringify(productForm.getValues(), null, 2)
                }
              </pre>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Receipt Style Bill */}
        <div className="w-80  border flex flex-col ">
          <div className="p-3 border-b ">
            <div className="text-sm font-semibold mb-2 flex items-center gap-1">
              📋 Receipt Preview
            </div>

            {/* Customer Section */}
            <div className="space-y-2">
              <div>
                <Input
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-7 text-xs"
                  onBlur={focusSearchInput}
                />
              </div>
              <div className="flex gap-1">
                <Input
                  placeholder="TIN Number"
                  value={customerTin}
                  onChange={(e) => setCustomerTin(e.target.value)}
                  className="h-7 text-xs flex-1 font-mono"
                  onBlur={focusSearchInput}
                />
                <Button
                  onClick={verifyTin}
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
              {selectedCustomer && (
                <div className="text-xs text-green-600  p-1 rounded font-medium">
                  ✓ {selectedCustomer.companyName}
                </div>
              )}
            </div>
          </div>

          {/* Receipt-Style Cart Items */}
          <div className="flex-1 ">
            <div className="p-2 border-b ">
              <div className="text-xs font-mono text-center font-bold">
                RECEIPT
              </div>
            </div>

            <ScrollArea className="h-64 ">
              {cart.length === 0 ? (
                <CartPlaceholder />
              ) : (
                <div className="p-2 space-y-1">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="border-b border-dashed border-gray-200 pb-1"
                    >
                      {/* Receipt-style item line */}
                      <div className="flex justify-between items-start text-xs font-mono">
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.product.name}
                            <span className=" opacity-65 text-xs">
                              ({item.product.barcode})
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs"></div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-4 w-4 p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Quantity and price controls */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                            className="h-5 w-5 p-0 text-xs"
                          >
                            <Minus className="h-2 w-2" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItemQuantity(
                                item.id,
                                Number.parseInt(e.target.value) || 1
                              )
                            }
                            className="w-12 h-5 text-xs font-mono border-0 p-0 m-0 pl-2"
                            min="1"
                            onBlur={focusSearchInput}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity + 1)
                            }
                            className="h-5 w-5 p-0 text-xs"
                          >
                            <Plus className="h-2 w-2" />
                          </Button>
                        </div>
                        <div className="text-xs font-mono">
                          <span className="text-gray-500">
                            ${item.unitPrice.toFixed(2)} × {item.quantity} ={" "}
                          </span>
                          <span className="font-bold text-primary">
                            ${item.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Receipt-Style Totals */}
          <div className="p-3 border-t ">
            <div className="text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>ITEMS ({cart.length}):</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {includeTax && (
                  <div className="flex justify-between">
                    <span>TAX (15%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-400 pt-1">
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL:</span>
                    <span className="text-green-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status Accordion */}
            <Collapsible
              open={isPaymentOpen}
              onOpenChange={setIsPaymentOpen}
              className="mt-3"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-7 text-xs bg-transparent"
                  onClick={focusSearchInput}
                >
                  💳 Payment:{" "}
                  {paymentStatus.charAt(0).toUpperCase() +
                    paymentStatus.slice(1)}
                  {isPaymentOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={paymentStatus === "paid" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentStatus("paid");
                      focusSearchInput();
                    }}
                    className="h-6 text-xs"
                  >
                    ✓ Paid
                  </Button>
                  <Button
                    variant={paymentStatus === "unpaid" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentStatus("unpaid");
                      focusSearchInput();
                    }}
                    className="h-6 text-xs"
                  >
                    ✗ Unpaid
                  </Button>
                  <Button
                    variant={
                      paymentStatus === "partial" ? "default" : "outline"
                    }
                    onClick={() => {
                      setPaymentStatus("partial");
                      focusSearchInput();
                    }}
                    className="h-6 text-xs"
                  >
                    ◐ Partial
                  </Button>
                </div>
                {paymentStatus === "partial" && (
                  <div className="space-y-1">
                    <Input
                      placeholder="Amount paid"
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      type="number"
                      className="h-6 text-xs font-mono"
                      onBlur={focusSearchInput}
                    />
                    <div className="text-xs text-red-600 font-mono">
                      REMAINING: ${remainingAmount.toFixed(2)}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Button
              className="w-full mt-3 bg-green-600 hover:bg-green-700 h-8 text-xs font-semibold"
              onClick={focusSearchInput}
            >
              CREATE ORDER
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPlaceholder() {
  return (
    <div className="group relative w-fit mx-auto m-8 p-[1px] rounded-lg bg-gradient-to-r from-gray-500 to-gray-500 hover:from-pink-500 hover:to-purple-500 transition-all duration-300">
      <div className="flex flex-col text-center text-gray-500 text-xs p-4 font-mono border border-dashed border-gray-500 group-hover:border-transparent rounded-lg bg-background transition-all duration-300">
        <span>No items in cart</span>
        <span>Please add items to your cart</span>
      </div>
    </div>
  );
}

function CartItem({
  item,
  removeFromCart,
  updateCartItemQuantity,
  focusSearchInput,
}: {
  item: CartItem;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  focusSearchInput: () => void;
}) {
  return (
    <div key={item.id} className="border-b border-dashed border-gray-200 pb-1">
      {/* Receipt-style item line */}
      <div className="flex justify-between items-start text-xs font-mono">
        <div className="flex-1">
          <div className="font-medium">
            {item.product.name}
            <span className=" opacity-65 text-xs">
              ({item.product.barcode})
            </span>
          </div>
          <div className="text-gray-500 text-xs"></div>
        </div>
        <Button
          variant="ghost"    
          size="sm"
          onClick={() => removeFromCart(item.id)}
          className="h-4 w-4 p-0 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Quantity and price controls */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
            className="h-5 w-5 p-0 text-xs"
          >
            <Minus className="h-2 w-2" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateCartItemQuantity(
                item.id,
                Number.parseInt(e.target.value) || 1
              )
            }
            className="w-12 h-5 text-xs font-mono border-0 p-0 m-0 pl-2"
            min="1"
            onBlur={focusSearchInput}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
            className="h-5 w-5 p-0 text-xs"
          >
            <Plus className="h-2 w-2" />
          </Button>
        </div>
        <div className="text-xs font-mono">
          <span className="text-gray-500">
            ${item.unitPrice.toFixed(2)} × {item.quantity} ={" "}
          </span>
          <span className="font-bold text-primary">
            ${item.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
