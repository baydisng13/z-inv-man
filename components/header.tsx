"use client";

import { useState } from "react";
import {
  // Menu, // Unused
  ChevronDown,
  Check,
  Building2,
  MapPin,
  User,
  Settings,
  LogOut,
  // Bell, // Unused
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge"; // Unused
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { authClient, useSession } from "@/lib/auth-client";

// interface HeaderProps {} // Unused interface removed

const organizationss = [
  { id: 1, name: "Addis Stationery Co.", plan: "Pro" },
  { id: 2, name: "Bahir Dar Office Supplies", plan: "Starter" },
  { id: 3, name: "Hawassa Paper House", plan: "Pro" },
];

const branches = [
  {
    id: 1,
    name: "Addis Ababa Main",
    location: "Bole, Addis Ababa",
    active: true,
  },
  {
    id: 2,
    name: "Bahir Dar Branch",
    location: "Kebele 01, Bahir Dar",
    active: false,
  },
  { id: 3, name: "Hawassa Branch", location: "Tabor, Hawassa", active: false },
  { id: 4, name: "Mekelle Branch", location: "Ayder, Mekelle", active: false },
];

export function Header() {
  const [selectedOrg, setSelectedOrg] = useState(organizationss[0]);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  const { data: session } = useSession();


   


  return (
    <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b text-text bg-muted px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <SidebarTrigger />
      
      {/* Separator */}
      <div className="h-6 w-px bg-text lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Organization Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-x-2 text-xs font-medium text-text hover:opacity-80"
              >
                <div className="flex items-center gap-x-2">
                  <Building2 className="h-4 w-4 text-primary-foreground" />

                  <span className="hidden sm:block">{selectedOrg.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-primary-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
                Organizations
              </DropdownMenuLabel>
              {organizationss.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-x-4">
                    <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {org.plan} Plan
                      </div>
                    </div>
                  </div>
                  {selectedOrg.id === org.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-primary  text-xs ">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center space-x-4">
                  <Plus className="h-4 w-4 text-white" />
                </div>{" "}
                Create Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Branch Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-x-2 text-xs font-medium text-text hover:opacity-80"
              >
                <div className="flex items-center gap-x-2">
                  <MapPin className="h-4 w-4 text-text" />
                  <span className="hidden sm:block">{selectedBranch.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
                Switch Branch
              </DropdownMenuLabel>
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch)}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-gray-500">
                        {branch.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    {selectedBranch.id === branch.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-primary">
                <MapPin className="h-4 w-4 mr-2" />
                Add New Branch
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          {/* <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button> */}

          {/* Profile dropdown */}
          {session && 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-x-2 text-xs font-medium text-text hover:opacity-80"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {session.user.name.split(" ").map((name, index) => <span key={index}>{name.slice(0, 1)}</span>)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block">{session.user.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {session.user.name.split(" ").map((name, index) => <span key={index}>{name.slice(0, 1)}</span>)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{session.user.name}</div>
                    {/* <div className="text-xs text-gray-500">Branch Manager</div> */}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={()=> {
                authClient.signOut({

                })
              }} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
              <pre>
                {JSON.stringify({active_org_id :session.session.activeOrganizationId}, null, 2)} 
              </pre>
            </DropdownMenuContent>
          </DropdownMenu>}
        </div>
      </div>
    </div>
  );
}
