"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Minus, Trash2, Scan, ChevronDown, ChevronUp, Check, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Schemas
const productSchema = z.object({
  productCode: z.string().min(1, "Product code is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

// Types
interface Product {
  id: string
  code: string
  name: string
  price: number
  stock: number
  category: string
  icon?: string
}

interface CartItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

interface Customer {
  id: string
  name: string
  tin: string
  companyName: string
  verified: boolean
}

// Stationary categories and products
const categories = [
  "All",
  "Books",
  "Paper",
  "Pens",
  "Pencils",
  "Notebooks",
  "Files",
  "Binders",
  "Staplers",
  "Clips",
  "Tape",
  "Glue",
]

const mockProducts: Product[] = [
  // Books
  { id: "1", code: "B001", name: "Exercise Book A4", price: 2.5, stock: 150, category: "Books", icon: "📚" },
  { id: "2", code: "B002", name: "Composition Book", price: 3.2, stock: 120, category: "Books", icon: "📚" },
  { id: "3", code: "B003", name: "Graph Book", price: 2.8, stock: 100, category: "Books", icon: "📚" },
  { id: "4", code: "B004", name: "Ruled Notebook", price: 1.9, stock: 200, category: "Books", icon: "📚" },

  // Paper
  { id: "5", code: "P001", name: "A4 Copy Paper 500s", price: 8.5, stock: 80, category: "Paper", icon: "📄" },
  { id: "6", code: "P002", name: "A3 Paper Pack", price: 12.0, stock: 60, category: "Paper", icon: "📄" },
  { id: "7", code: "P003", name: "Legal Size Paper", price: 9.2, stock: 70, category: "Paper", icon: "📄" },
  { id: "8", code: "P004", name: "Colored Paper Pack", price: 6.8, stock: 90, category: "Paper", icon: "📄" },

  // Pens
  { id: "9", code: "PN001", name: "Ballpoint Pen Blue", price: 0.8, stock: 500, category: "Pens", icon: "🖊️" },
  { id: "10", code: "PN002", name: "Ballpoint Pen Black", price: 0.8, stock: 480, category: "Pens", icon: "🖊️" },
  { id: "11", code: "PN003", name: "Gel Pen Set", price: 4.5, stock: 120, category: "Pens", icon: "🖊️" },
  { id: "12", code: "PN004", name: "Marker Set", price: 8.9, stock: 85, category: "Pens", icon: "🖊️" },

  // Pencils
  { id: "13", code: "PC001", name: "HB Pencil", price: 0.5, stock: 600, category: "Pencils", icon: "✏️" },
  { id: "14", code: "PC002", name: "2B Pencil", price: 0.55, stock: 550, category: "Pencils", icon: "✏️" },
  { id: "15", code: "PC003", name: "Colored Pencil Set", price: 12.5, stock: 75, category: "Pencils", icon: "✏️" },
  { id: "16", code: "PC004", name: "Mechanical Pencil", price: 3.2, stock: 140, category: "Pencils", icon: "✏️" },

  // Notebooks
  { id: "17", code: "N001", name: "Spiral Notebook A5", price: 4.2, stock: 110, category: "Notebooks", icon: "📓" },
  { id: "18", code: "N002", name: "Hardcover Notebook", price: 8.5, stock: 65, category: "Notebooks", icon: "📓" },
  { id: "19", code: "N003", name: "Pocket Notebook", price: 2.8, stock: 180, category: "Notebooks", icon: "📓" },
  { id: "20", code: "N004", name: "Ring Binder Notebook", price: 6.9, stock: 95, category: "Notebooks", icon: "📓" },

  // Files & Folders
  { id: "21", code: "F001", name: "Manila Folder", price: 1.2, stock: 300, category: "Files", icon: "📁" },
  { id: "22", code: "F002", name: "Plastic File Folder", price: 2.5, stock: 200, category: "Files", icon: "📁" },
  { id: "23", code: "F003", name: "Hanging File", price: 3.8, stock: 150, category: "Files", icon: "📁" },
  { id: "24", code: "F004", name: "Document Wallet", price: 5.2, stock: 120, category: "Files", icon: "📁" },

  // Add more products
  ...Array.from({ length: 76 }, (_, i) => ({
    id: `extra-${i + 25}`,
    code: `S${String(i + 25).padStart(3, "0")}`,
    name: `Stationery Item ${i + 25}`,
    price: Math.round((Math.random() * 20 + 1) * 100) / 100,
    stock: Math.floor(Math.random() * 200) + 10,
    category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
    icon: "📎",
  })),
]

const mockCustomers: Customer[] = [
  { id: "1", name: "John Doe", tin: "123456789", companyName: "ABC Corp Ltd", verified: true },
  { id: "2", name: "Jane Smith", tin: "987654321", companyName: "XYZ Industries", verified: true },
  { id: "3", name: "Bob Johnson", tin: "456789123", companyName: "Johnson & Co", verified: false },
]

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [customerName, setCustomerName] = useState("")
  const [customerTin, setCustomerTin] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [includeTax, setIncludeTax] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "partial">("paid")
  const [partialAmount, setPartialAmount] = useState("")
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const productInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)

  const TAX_RATE = 0.15

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productCode: "",
      quantity: 1,
    },
  })

  // Aggressive focus management
  const focusSearchInput = useCallback(() => {
    setTimeout(() => {
      if (productInputRef.current) {
        productInputRef.current.focus()
        productInputRef.current.select()
      }
    }, 10)
  }, [])

  useEffect(() => {
    focusSearchInput()
  }, [focusSearchInput])

  // Reset and focus after any action
  const resetAndFocus = useCallback(() => {
    productForm.reset({ productCode: "", quantity: 1 })
    setProductSearch("")
    focusSearchInput()
  }, [productForm, focusSearchInput])

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      const existingItem = cart.find((item) => item.product.id === product.id)

      if (existingItem) {
        setCart((prev) =>
          prev.map((item) =>
            item.id === existingItem.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  total: item.unitPrice * (item.quantity + quantity),
                }
              : item,
          ),
        )
      } else {
        const newItem: CartItem = {
          id: Date.now().toString(),
          product,
          quantity,
          unitPrice: product.price,
          total: product.price * quantity,
        }
        setCart((prev) => [...prev, newItem])
      }

      resetAndFocus()
    },
    [cart, resetAndFocus],
  )

  const onProductSubmit = useCallback(
    (values: z.infer<typeof productSchema>) => {
      const product = mockProducts.find(
        (p) => p.code === values.productCode || p.name.toLowerCase().includes(values.productCode.toLowerCase()),
      )

      if (product) {
        addToCart(product, values.quantity)
      } else {
        // Product not found - reset and focus
        resetAndFocus()
      }
    },
    [addToCart, resetAndFocus],
  )

  const updateCartItemQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        setCart((prev) => prev.filter((item) => item.id !== itemId))
      } else {
        setCart((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity, total: item.unitPrice * newQuantity } : item,
          ),
        )
      }
      // focusSearchInput()
    },
    [focusSearchInput],
  )

  const removeFromCart = useCallback(
    (itemId: string) => {
      setCart((prev) => prev.filter((item) => item.id !== itemId))
      focusSearchInput()
    },
    [focusSearchInput],
  )

  const verifyTin = useCallback(() => {
    const customer = mockCustomers.find((c) => c.tin === customerTin)
    if (customer) {
      setSelectedCustomer(customer)
      setCustomerName(customer.name)
    }
    focusSearchInput()
  }, [customerTin, focusSearchInput])

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = includeTax ? subtotal * TAX_RATE : 0
  const total = subtotal + taxAmount
  const partialAmountNum = Number.parseFloat(partialAmount) || 0
  const remainingAmount = paymentStatus === "partial" ? total - partialAmountNum : 0

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch =
      product.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.name.toLowerCase().includes(productSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (field === "product") {
        if (quantityInputRef.current) {
          quantityInputRef.current.focus()
        }
      } else if (field === "quantity") {
        productForm.handleSubmit(onProductSubmit)()
      }
    }
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault()
        focusSearchInput()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [focusSearchInput])

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Ultra Compact Top Banner */}
      <div className="order-b  py-1 flex items-center justify-between text-xs sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3 text-blue-600" />
            POS
          </span>
          <Badge variant="outline" className="text-xs px-1 py-0">
            #{Date.now().toString().slice(-6)}
          </Badge>
          <div className="text-gray-500">Items: {cart.length}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Switch id="tax" checked={includeTax} onCheckedChange={setIncludeTax} className="scale-75" />
            <Label htmlFor="tax" className="text-xs">
              Tax 15%
            </Label>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600 text-sm">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Left Side - Products */}
        <div className="flex-1 py-2">
          {/* Lightning Fast Search */}
          <div className="mb-2">
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="flex gap-1">
                <div className="flex-1 relative">
                  <Scan className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    {...productForm.register("productCode")}
                    ref={productInputRef}
                    placeholder="scan/search..."
                    className="pl-7 h-8 text-xs font-mono"
                    onKeyDown={(e) => handleKeyDown(e, "product")}
                    onChange={(e) => {
                      productForm.setValue("productCode", e.target.value)
                      setProductSearch(e.target.value)
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
                <Button type="submit" size="sm" className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700">
                  ⚡
                </Button>
              </form>
            </Form>
          </div>

          {/* Ultra Compact Categories */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category)
                    focusSearchInput()
                  }}
                  className="h-6 px-2 text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Lightning Products Grid */}
          <div className="text-xs text-gray-500 mb-1 flex justify-between">
            <span>⚡ {filteredProducts.length} items ready</span>
            <span className="text-blue-600">Double-click for x2</span>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2 px-2">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-100 border hover:border-blue-300"
                  onClick={() => {
                    addToCart(product)
                  }}
                  onDoubleClick={() => {
                    addToCart(product, 2)
                  }}
                >
                  <CardContent className=" py-0">
                    <div className="text-center flex flex-col gap-4 justify-between ">
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-xs text-gray-500  font-mono ">{product.code}</div>
                        <div className="text-xs font-medium line-clamp-2 h-8 ">{product.name}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-green-600">${product.price}</span>
                        <Badge variant={product.stock < 20 ? "destructive" : "secondary"} className="text-xs px-1 py-0">
                          {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Receipt Style Bill */}
        <div className="w-80  border flex flex-col ">
          <div className="p-3 border-b ">
            <div className="text-sm font-semibold mb-2 flex items-center gap-1">📋 Receipt Preview</div>

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
                <Button onClick={verifyTin} size="sm" className="h-7 px-2 text-xs">
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
              <div className="text-xs font-mono text-center font-bold">RECEIPT</div>
            </div>

            <ScrollArea className="h-64 ">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 text-xs mt-8 font-mono">
                  ┌─────────────────────────────┐
                  <br />│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EMPTY
                  CART&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; │
                  <br />│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Add items to
                  start&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; │
                  <br />
                  └─────────────────────────────┘
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {cart.map((item, index) => (
                    <div key={item.id} className="border-b border-dashed border-gray-200 pb-1">
                      {/* Receipt-style item line */}
                      <div className="flex justify-between items-start text-xs font-mono">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name} 
                            <span
                              className=" opacity-65 text-xs"
                            >({item.product.code})</span>
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
                            onChange={(e) => updateCartItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
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
                          <span className="font-bold text-primary">${item.total.toFixed(2)}</span>
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
            <Collapsible open={isPaymentOpen} onOpenChange={setIsPaymentOpen} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-7 text-xs bg-transparent"
                  onClick={focusSearchInput}
                >
                  💳 Payment: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                  {isPaymentOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={paymentStatus === "paid" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentStatus("paid")
                      focusSearchInput()
                    }}
                    className="h-6 text-xs"
                  >
                    ✓ Paid
                  </Button>
                  <Button
                    variant={paymentStatus === "unpaid" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentStatus("unpaid")
                      focusSearchInput()
                    }}
                    className="h-6 text-xs"
                  >
                    ✗ Unpaid
                  </Button>
                  <Button
                    variant={paymentStatus === "partial" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentStatus("partial")
                      focusSearchInput()
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
                    <div className="text-xs text-red-600 font-mono">REMAINING: ${remainingAmount.toFixed(2)}</div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Button
              className="w-full mt-3 bg-green-600 hover:bg-green-700 h-8 text-xs font-semibold"
              onClick={focusSearchInput}
            >
              ⚡ CREATE ORDER
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
