import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      change: "+12%",
      icon: Package,
    },
    {
      title: "Low Stock Items",
      value: "23",
      change: "-5%",
      icon: AlertTriangle,
    },
    {
      title: "Monthly Sales",
      value: "$45,231",
      change: "+18%",
      icon: TrendingUp,
    },
    {
      title: "Purchase Orders",
      value: "89",
      change: "+7%",
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
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New purchase order received</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Product &quot;iPhone 15&quot; updated</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Low stock alert: Samsung Galaxy</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <Package className="h-4 w-4" />
                <span className="text-sm">Add New Product</span>
              </button>
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Create Purchase Order</span>
              </button>
              <button className="flex items-center justify-start space-x-2 p-2 rounded-md hover:bg-muted transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Record Sale</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
