"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Shield, ShieldCheck, Ban, RefreshCw, Plus, Trash, Users } from "lucide-react"
import { CreateMemberModal } from "./components/create"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import api from "@/apis"
import { AdvancedSearch } from "@/components/advanced-search"
import { ParsedQuery } from "@/lib/search-parser"
import { ListUsersQueryType } from "@/apis/admin"
import DebouncedSearch from "./components/debounce-search"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "pending" | "blocked"
  joinedAt: string
}

export default function TeamManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)

  const {
    data: teamMembers,
    isLoading: isTeamMembersLoading,
    isSuccess: isTeamMembersSuccess,
    isError: isTeamMembersError,
  } = api.Admin.ListUsers.useQuery({
    searchField: "name",
    searchOperator: "contains",
    searchValue: searchQuery,
  })

  const { mutate: removeUser, isPending, error, isError, isSuccess } = api.Admin.RemoveUser.useMutation()

  


  const updateMemberRole = (memberId: string, newRole: "admin" | "user") => {
    // Implementation here
  }

  const resendInvite = (memberEmail: string) => {
    console.log(`Resending invite to ${memberEmail}`)
  }

  const blockMember = (memberId: string) => {
    // Implementation here
  }

  const unblockMember = (memberId: string) => {
    // Implementation here
  }

  const getStatusBadge = (user: any) => {
    if (user.banned) {
      return <Badge variant="destructive">Blocked</Badge>
    }
    if (user.emailVerified) {
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
  }

  const filteredUsers =
    teamMembers?.users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your organization's team members and permissions</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      {isTeamMembersSuccess && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Total Members</span>
              </div>
              <div className="text-2xl font-bold mt-2">{teamMembers.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Active Members</span>
              </div>
              <div className="text-2xl font-bold mt-2">
                {teamMembers.users.filter((u) => u.emailVerified && !u.banned).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Pending Invites</span>
              </div>
              <div className="text-2xl font-bold mt-2">{teamMembers.users.filter((u) => !u.emailVerified).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      {/* {isTeamMembersSuccess && teamMembers.total > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredUsers.length} of {teamMembers.total} members
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Advanced Search */}
      {/* <AdvancedSearch onSearch={handleSearch} currentQuery={queryParams} isLoading={isTeamMembersLoading} /> */}

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            {isTeamMembersSuccess && (
              <Badge variant="secondary" className="ml-2">
                {teamMembers.total}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Manage your team members, their roles, and access permissions</CardDescription>
          <div className="flex items-center justify-end mt-2">
            <DebouncedSearch
              onSearch={(query) => setSearchQuery(query)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTeamMembersLoading &&
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                {isTeamMembersSuccess &&
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="capitalize text-sm">
                            {typeof user.role === "string" ? user.role : "User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {!user.emailVerified && (
                                <>
                                  <DropdownMenuItem onClick={() => resendInvite(user.email)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Resend Invite
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {user.role !== "admin" && (
                                <DropdownMenuItem onClick={() => updateMemberRole(user.id, "admin")}>
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Promote to Admin
                                </DropdownMenuItem>
                              )}

                              {user.role === "admin" && (
                                <DropdownMenuItem onClick={() => updateMemberRole(user.id, "user")}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Demote to User
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {user.banned ? (
                                <DropdownMenuItem onClick={() => unblockMember(user.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Unblock Member
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => blockMember(user.id)}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Block Member
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {isTeamMembersSuccess && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          {searchQuery ? "No members found matching your search." : "No team members found."}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {isTeamMembersError && (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Failed to load team members. Please try again later.</div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateMemberModal open={showInviteModal} onOpenChange={setShowInviteModal} afterCreate={() => {}} />
    </div>
  )
}
