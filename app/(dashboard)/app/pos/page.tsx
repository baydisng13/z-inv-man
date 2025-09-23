"use client"
import type React from "react"
import { useRef, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Minus, Trash2, Scan, ChevronDown, ChevronUp, Check, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import api from "@/apis"
import type { ProductWithCategoryType } from "@/schemas/product-schema"
import CustomerSelect from "./customerSelect"
import { SalesCreateType, salesFormSchema } from "@/schemas/sales-schema"
import { toast } from "sonner"

export default function POSPage() {
  const productInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const TAX_RATE = 0.15

  // Main form
  const form = useForm<SalesCreateType>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      saleItems: [],
      subtotal: 0,
      discount: 0,
      taxAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      paymentStatus: "PAID",
      status: "RECEIVED",
      includeTax: true,
      selectedCategory: "All",
      productSearch: "",
      isPaymentOpen: false,
      quickAdd: {
        productCode: "",
        quantity: 1,
      },
    },
  })

  const {
    fields: saleItems,
    append,
    remove,
    update,
  } = useFieldArray({
    control: form.control,
    name: "saleItems",
  })

  // Watch form values for calculations
  const watchedValues = form.watch()
  const { saleItems: cartItems, includeTax, customerId } = watchedValues

  // API queries
  const { data: categories, isSuccess: isCategoriesSuccess } = api.Category.GetAll.useQuery()
  const { data: products, isSuccess: isProductSuccess } = api.Product.GetAll.useQuery()

  // Calculate totals whenever cart changes
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = includeTax ? subtotal * TAX_RATE : 0
    const totalAmount = subtotal + taxAmount

    form.setValue("subtotal", subtotal)
    form.setValue("taxAmount", taxAmount)
    form.setValue("totalAmount", totalAmount)

    // Set paid amount to total if payment status is PAID
    if (form.getValues("paymentStatus") === "PAID") {
      form.setValue("paidAmount", totalAmount)
    }
  }, [cartItems, includeTax, form])

  // Focus management
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

  // Reset quick add form and focus
  const resetQuickAddAndFocus = useCallback(() => {
    form.setValue("quickAdd.productCode", "")
    form.setValue("quickAdd.quantity", 1)
    form.setValue("productSearch", "")
    focusSearchInput()
  }, [form, focusSearchInput])

  // Add product to cart
  const addToCart = useCallback(
    (product: ProductWithCategoryType, quantity = 1) => {
      if (product.inventory?.quantity == 0) return
      const existingItemIndex = cartItems.findIndex((item) => item.productId === product.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = cartItems[existingItemIndex]
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.inventory?.quantity) {
          toast.error("Not enough stock")
          return
        }
        const newTotal = Number(product.sellingPrice) * newQuantity

        update(existingItemIndex, {
          ...existingItem,
          quantity: newQuantity,
          total: newTotal,
        })
      } else {
        // Add new item
        const newItem = {
          productId: product.id,
          productCode: product.barcode,
          productName: product.name,
          quantity,
          unitPrice: Number(product.sellingPrice),
          total: Number(product.sellingPrice) * quantity,
        }
        append(newItem)
      }
      resetQuickAddAndFocus()
    },
    [cartItems, append, update, resetQuickAddAndFocus],
  )

  const handleSingleClick = useCallback(
    (product: ProductWithCategoryType) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }

      clickTimeoutRef.current = setTimeout(() => {
        addToCart(product, 1)
        clickTimeoutRef.current = null
      }, 200)
    },
    [addToCart],
  )

  const handleDoubleClick = useCallback(
    (product: ProductWithCategoryType) => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      addToCart(product, 2)
    },
    [addToCart],
  )

  const onQuickAddSubmit = useCallback(() => {
    const { productCode, quantity } = form.getValues("quickAdd")
    const productSearch = form.getValues("productSearch")

    if (!products) return

    const product = products.find(
      (p) =>
        p.barcode === productCode ||
        p.barcode === productSearch ||
        p.name.toLowerCase().includes(productCode.toLowerCase()) ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
    )

    if (product) {
      addToCart(product, quantity)
    } else {
      resetQuickAddAndFocus()
    }
  }, [form, products, addToCart, resetQuickAddAndFocus])


  const isProductStockExeceeded = (productId: string, newQuantity: number) => {
    const product = products?.find((p) => p.id === productId);
    const productStock = product?.inventory?.quantity ?? 0;
    if (productStock < newQuantity) return true
  }

  // Update cart item quantity
  const updateCartItemQuantity = useCallback(
    (index: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        remove(index)
      } else {
        const item = cartItems[index]
        if (isProductStockExeceeded(item.productId, newQuantity)) {
          toast.error('Not Enough Stock')
          return
        }

        const newTotal = item.unitPrice * newQuantity
        update(index, {
          ...item,
          quantity: newQuantity,
          total: newTotal,
        })
      }
    },
    [cartItems, remove, update],
  )

  // Filter products
  const filteredProducts = isProductSuccess
    ? products.filter((product) => {
      const matchesCategory =
        watchedValues.selectedCategory === "All" || product.categoryId === watchedValues.selectedCategory
      const matchesSearch =
        product.barcode.toLowerCase().includes(watchedValues.productSearch.toLowerCase()) ||
        product.name.toLowerCase().includes(watchedValues.productSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })
    : []

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (field === "product") {
        if (quantityInputRef.current) {
          quantityInputRef.current.focus()
        }
      } else if (field === "quantity") {
        onQuickAddSubmit()
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

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  const { mutate: createSalesOrder, isPending: isCreating, isSuccess: isCreated } = api.Sales.Create.useMutation()

  useEffect(() => {
    if (isCreated) {
      form.reset()
    }
  }, [isCreated])

  // Handle form submission
  const onSubmit = (data: SalesCreateType) => {
    console.log("Form submitted:", data)
    for (const item of data.saleItems) {
      const product = products?.find((p) => p.id === item.productId);
      const productStock = product?.inventoryRecords.reduce((prv, cur) => prv + cur.quantity, 0) ?? 0;
      if (productStock < item.quantity) {
        toast.error(`Requested quantity for ${product?.name ?? "product"} exceeded stock`);
        return;
      }
    }
    createSalesOrder(data)
  }

  const remainingAmount =
    watchedValues.paymentStatus === "PARTIAL" ? watchedValues.totalAmount - watchedValues.paidAmount : 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-[calc(100vh-100px)] flex flex-col">
        {/* Ultra Compact Top Banner */}
        <div className="border-b py-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-600" />
              POS
            </span>
            <div className="text-gray-500">Items: {cartItems.length}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FormField
                control={form.control}
                name="includeTax"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-1">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                    </FormControl>
                    <Label htmlFor="tax" className="text-xs">
                      Tax 15%
                    </Label>
                  </FormItem>
                )}
              />
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600 text-sm">${watchedValues.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4">
          <div className="flex-1 py-2">
            {/* Quick Add Product Form */}
            <div className="mb-2">
              <div className="flex gap-1">
                <div className="flex-1 relative">
                  <Scan className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <FormField
                    control={form.control}
                    name="productSearch"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            ref={productInputRef}
                            placeholder="scan/search..."
                            className="pl-7 h-8 text-xs font-mono"
                            onKeyDown={(e) => handleKeyDown(e, "product")}
                            onChange={(e) => {
                              field.onChange(e.target.value)
                              form.setValue("quickAdd.productCode", e.target.value)
                            }}
                            autoComplete="off"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="quickAdd.quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          ref={quantityInputRef}
                          type="number"
                          min="1"
                          className="w-12 h-8 text-xs text-center font-mono"
                          onKeyDown={(e) => handleKeyDown(e, "quantity")}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={onQuickAddSubmit}
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  ⚡
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={watchedValues.selectedCategory === "All" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    form.setValue("selectedCategory", "All")
                    focusSearchInput()
                  }}
                  className="h-6 px-2 text-xs"
                >
                  All
                </Button>
                {isCategoriesSuccess &&
                  categories.map((category) => (
                    <Button
                      key={category.id}
                      type="button"
                      variant={watchedValues.selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        form.setValue("selectedCategory", category.id)
                        focusSearchInput()
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      {category.name}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="text-xs text-gray-500 mb-1 flex justify-between">
              <span>{filteredProducts.length} items ready</span>
              <span className="text-blue-600">Double-click for x2</span>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2 px-2">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    aria-disabled={product.inventory?.quantity === 0}
                    className={` border ${product.inventory?.quantity === 0 ? "opacity-50" : "hover:border-blue-300 hover:scale-105 cursor-pointer hover:shadow-md transition-all duration-100"}`}
                    onClick={() => handleSingleClick(product)}
                    onDoubleClick={() => handleDoubleClick(product)}
                  >
                    <CardContent className="py-0">
                      <div className="text-center flex flex-col gap-4 justify-between">
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-xs text-gray-500 font-mono">{product.barcode}</div>
                          <div className="text-xs font-medium line-clamp-2 h-8">{product.name}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-green-600">${product.sellingPrice}</span>
                          <Badge
                            variant={product.inventoryRecords.reduce((prv, cur) => prv + cur.quantity, 0) < 20 ? "destructive" : "secondary"}
                            className="text-xs px-1 py-0"
                          >
                            {product.inventoryRecords.reduce((prv, cur) => prv + cur.quantity, 0)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <pre>
                {JSON.stringify(form.watch(), null, 2)}
                {JSON.stringify(form.formState.errors, null, 2)}
              </pre>
            </ScrollArea>

          </div>

          {/* Right Sidebar - Receipt */}
          <div className="w-80 border flex flex-col">
            <div className="p-3 border-b">
              <div className="text-sm font-semibold mb-2 flex items-center gap-1">📋 Receipt Preview</div>
              {/* Customer Section */}
              <div className="space-y-2">

                <CustomerSelect
                  name="customerId"
                />


              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1">
              <div className="p-2 border-b">
                <div className="text-xs font-mono text-center font-bold">RECEIPT</div>
              </div>
              <ScrollArea className="h-64">
                {cartItems.length === 0 ? (
                  <CartPlaceholder />
                ) : (
                  <div className="p-2 space-y-1">
                      {saleItems.map((item, index) => {
                        const productWithStock = products?.find((product) => product.id == item.productId)
                        const stockQuantity = productWithStock?.inventoryRecords.reduce((prev, curr) => prev + curr.quantity, 0)
                        return <div key={item.id} className="border-b border-dashed border-gray-200 pb-1">
                        <div className="flex justify-between items-start text-xs font-mono">
                          <div className="flex-1">
                            <div className="font-medium">
                              {item.productName}
                              <span className="opacity-65 text-xs">({item.productCode})</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-4 w-4 p-0 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                              className="h-5 w-5 p-0 text-xs"
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartItemQuantity(index, Number.parseInt(e.target.value) || 1)}
                              className="w-12 h-5 text-xs font-mono border-0 p-0 m-0 pl-2"
                              min="1"
                              onBlur={focusSearchInput}
                            />
                            <Button
                              type="button"
                              disabled={stockQuantity !== undefined && stockQuantity < item.quantity + 1}
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
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
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Totals and Payment */}
            <div className="p-3 border-t">
              <div className="text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>ITEMS ({cartItems.length}):</span>
                    <span>${watchedValues.subtotal.toFixed(2)}</span>
                  </div>
                  {watchedValues.includeTax && (
                    <div className="flex justify-between">
                      <span>TAX (15%):</span>
                      <span>${watchedValues.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-400 pt-1">
                    <div className="flex justify-between font-bold text-sm">
                      <span>TOTAL:</span>
                      <span className="text-green-600">${watchedValues.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <FormField
                control={form.control}
                name="isPaymentOpen"
                render={({ field }) => (
                  <Collapsible open={field.value} onOpenChange={field.onChange} className="mt-3">
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between h-7 text-xs bg-transparent"
                      >
                        💳 Payment: {watchedValues.paymentStatus}
                        {field.value ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          type="button"
                          variant={watchedValues.paymentStatus === "PAID" ? "default" : "outline"}
                          onClick={() => {
                            form.setValue("paymentStatus", "PAID")
                            form.setValue("paidAmount", watchedValues.totalAmount)
                          }}
                          className="h-6 text-xs"
                        >
                          ✓ Paid
                        </Button>
                        <Button
                          type="button"
                          variant={watchedValues.paymentStatus === "CREDIT" ? "default" : "outline"}
                          onClick={() => {
                            form.setValue("paymentStatus", "CREDIT")
                            form.setValue("paidAmount", 0)
                          }}
                          className="h-6 text-xs"
                        >
                          ✗ Credit
                        </Button>
                        <Button
                          type="button"
                          variant={watchedValues.paymentStatus === "PARTIAL" ? "default" : "outline"}
                          onClick={() => {
                            form.setValue("paymentStatus", "PARTIAL")
                          }}
                          className="h-6 text-xs"
                        >
                          ◐ Partial
                        </Button>
                      </div>
                      {watchedValues.paymentStatus === "PARTIAL" && (
                        <div className="space-y-1">
                          <FormField
                            control={form.control}
                            name="paidAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Amount paid"
                                    type="number"
                                    step="0.01"
                                    className="h-6 text-xs font-mono"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    onBlur={focusSearchInput}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="text-xs text-red-600 font-mono">REMAINING: ${remainingAmount.toFixed(2)}</div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              />

              <Button type="submit" className="w-full mt-3 bg-green-600 hover:bg-green-700 h-8 text-xs font-semibold">
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                CREATE ORDER
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

function CartPlaceholder() {
  return (
    <div className="group relative w-fit mx-auto m-8 p-[1px] rounded-lg bg-gradient-to-r from-gray-500 to-gray-500 hover:from-pink-500 hover:to-purple-500 transition-all duration-300">
      <div className="flex flex-col text-center text-gray-500 text-xs p-4 font-mono border border-dashed border-gray-500 group-hover:border-transparent rounded-lg bg-background transition-all duration-300">
        <span>No items in cart</span>
        <span>Please add items to your cart</span>
      </div>
    </div>
  )
}
