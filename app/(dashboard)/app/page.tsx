'use client'
import api from "@/apis"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { AlertTriangle, Loader2, Package, ShoppingCart, TrendingUp } from "lucide-react"
import Link from "next/link"
import React from "react"

const getActivityColor = (color: string) => {
  switch (color) {
    case 'green':
      return 'bg-green-500'
    case 'blue':
      return 'bg-blue-500'
    case 'orange':
      return 'bg-orange-500'
    case 'yellow':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}
export default function Dashboard() {
  const { data: allProducts = [], isLoading: productsLoading, error: productsError } = api.Product.GetAll.useQuery()
  const { data: stock = [], isLoading: stockLoading, error: stockError } = api.Inventory.GetAllStock.useQuery()
  const { data: sales = [], isLoading: salesLoading, error: salesError } = api.Sales.GetAll.useQuery()
  const { data: purchaseOrders = [], isLoading: purchasesLoading, error: purchasesError } = api.Purchase.GetAll.useQuery()

  const activities = React.useMemo(() => {
    if (!allProducts || !sales || !purchaseOrders) return []

    const allActivities: { id: string, type: string, title: string, timestamp: string | Date, color: string }[] = []

    //TODO:revisit this
    purchaseOrders.slice(0, 2).forEach((purchase) => {
      allActivities.push({
        id: `purchase-${purchase.id}`,
        type: 'purchase',
        title: `New purchase order from ${purchase.supplier?.name || 'Supplier'}`,
        timestamp: purchase.createdAt,
        color: 'green'
      })
    })

    //TODO:revisit this
    sales.slice(0, 2).forEach((sale) => {
      allActivities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        title: `New sale - $${Number(sale.totalAmount).toLocaleString()}`,
        timestamp: sale.createdAt,
        color: 'blue'
      })
    })



    //TODO:revisit this
    allProducts
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 2)
      .forEach((product) => {
        allActivities.push({
          id: `product-${product.id}`,
          type: 'product_update',
          title: `Product updated: ${product.name}`,
          timestamp: product.updatedAt || product.createdAt,
          color: 'yellow'
        })
      })

    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [allProducts, sales, purchaseOrders])

  const isLoading = productsLoading || stockLoading || salesLoading || purchasesLoading
  const error = productsError || stockError || salesError || purchasesError

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your inventory overview.</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your inventory overview.</p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {error.response?.data?.message || error.message || "Failed to load dashboard data. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!allProducts || !stock || !sales || !purchaseOrders) {
    return null
  }

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const totalProducts = allProducts.length
  const currentMonthProducts = allProducts.filter(
    (p) => new Date(p.createdAt) >= currentMonthStart
  ).length
  const lastMonthProducts = allProducts.filter(
    (p) => new Date(p.createdAt) >= lastMonthStart && new Date(p.createdAt) <= lastMonthEnd
  ).length

  const productsChange = lastMonthProducts === 0
    ? (currentMonthProducts > 0 ? 100 : 0)
    : ((currentMonthProducts - lastMonthProducts) / lastMonthProducts * 100);

  const LOW_STOCK_THRESHOLD = 10
  const lowStockItems = stock.filter(
    (item) => item.inventory_stock.quantity < LOW_STOCK_THRESHOLD
  ).length

  const lowStockPercentage = totalProducts > 0
    ? ((lowStockItems / totalProducts) * 100).toFixed(1)
    : "0"

  const currentMonthSales = sales.filter(
    (sale) => new Date(sale.createdAt) >= currentMonthStart
  )
  const lastMonthSales = sales.filter(
    (sale) => new Date(sale.createdAt) >= lastMonthStart && new Date(sale.createdAt) <= lastMonthEnd
  )

  const currentMonthSalesTotal = currentMonthSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  )
  const lastMonthSalesTotal = lastMonthSales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  )

  const salesChange = lastMonthSalesTotal === 0
    ? (currentMonthSalesTotal > 0 ? 100 : 0)
    : ((currentMonthSalesTotal - lastMonthSalesTotal) / lastMonthSalesTotal * 100);

  const currentMonthPurchases = purchaseOrders.filter(
    (po) => new Date(po.createdAt) >= currentMonthStart
  ).length
  const lastMonthPurchases = purchaseOrders.filter(
    (po) => new Date(po.createdAt) >= lastMonthStart && new Date(po.createdAt) <= lastMonthEnd
  ).length
  const purchasesChange = lastMonthPurchases === 0
    ? (currentMonthPurchases > 0 ? 100 : 0)
    : ((currentMonthPurchases - lastMonthPurchases) / lastMonthPurchases * 100);

  const totalPurchaseOrders = purchaseOrders.length

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: `${productsChange >= 0 ? '+' : ''}${productsChange.toFixed(1)}%`,
      icon: Package,
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.toString(),
      change: `${lowStockPercentage}% `,
      icon: AlertTriangle,
    },
    {
      title: "Monthly Sales",
      value: `$${currentMonthSalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      icon: TrendingUp,
    },
    {
      title: "Purchase Orders",
      value: totalPurchaseOrders.toString(),
      change: `${purchasesChange >= 0 ? '+' : ''}${purchasesChange.toFixed(1)}%`,
      icon: ShoppingCart,
    },
  ]



  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your inventory overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${getActivityColor(activity.color)} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activities found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link
                href="/app/products/new"
                className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <Package className="h-4 w-4" />
                <span className="text-sm">Add New Product</span>
              </Link>
              <Link
                href="/app/purchases"
                className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Create Purchase Order</span>
              </Link>
              <Link
                href="/app/pos"
                className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Record Sale</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
