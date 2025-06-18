import { ArrowUpDown, BarChart3, Calendar, Home, Inbox, Package, Search, Settings, ShoppingCart, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.

const items = [
  { name: 'Dashboard', url: '/', icon: Home },
  { name: 'Quick Sales', url: '/sales', icon: ShoppingCart },
  { name: 'Inventory', url: '/inventory', icon: Package },
  { name: 'Products', url: '/products', icon: BarChart3 },
  { name: 'Transfers', url: '/transfers', icon: ArrowUpDown },
  { name: 'Customers', url: '/customers', icon: Users },
  { name: 'Settings', url: '/settings', icon: Settings },
]


export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
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
  )
}