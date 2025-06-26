import { ArrowUpDown, BarChart3, Home, Package, Settings, Shield, ShoppingCart, TrendingUp, Truck, Users } from "lucide-react" // Removed Calendar, Inbox, Search

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.

const items = [
  { name: "Dashboard", href: "/app/", icon: Home },
  { name: "Products", href: "/app/products", icon: Package },
  { name: "Inventory", href: "/app/inventory", icon: BarChart3 },
  { name: "Purchases", href: "/app/purchases", icon: ShoppingCart },
  { name: "Sales", href: "/app/sales", icon: TrendingUp },
  { name: "Suppliers", href: "/app/suppliers", icon: Truck },
  { name: "Customers", href: "/app/customers", icon: Users },
  { name: "POS", href: "/app/pos", icon: Users },
  { name: "Teams", href: "/app/team", icon: Users },
  { name: "Settings", href: "/app/settings", icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200/60 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shadow-sm">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text tracking-tight">
              Admin Console
            </h1>
            <p className="text-sm text-text/50 font-medium">
              System Management
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
