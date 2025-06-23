"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Ban,
  RefreshCw,
  Eye,
  Plus,
} from "lucide-react";
import { CreateMemberModal } from "./components/create";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "pending" | "blocked";
  joinedAt: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@acme.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@acme.com",
    role: "user",
    status: "blocked",
    joinedAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@acme.com",
    role: "user",
    status: "pending",
    joinedAt: "2024-02-10",
  },
];

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    authClient.admin.listUsers(
      {
        query: {
          limit: 10,
        },
      },
      {
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
          setIsLoading(false);
        },
        onSuccess: (data) => {
          setTeamMembers(data.data.users);
          setIsLoading(false);
        },
        onRequest: () => {
          setIsLoading(true);
        },
      }
    );
  }, [isLoading]);

  const filteredMembers =
    !isLoading && teamMembers
      ? teamMembers.filter(
          (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  const updateMemberRole = (memberId: string, newRole: "admin" | "user") => {
    // setTeamMembers((members) =>
    //   members.map((member) =>
    //     member.id === memberId ? { ...member, role: newRole } : member
    //   )
    // );
  };

  const resendInvite = (memberEmail: string) => {
    console.log(`Resending invite to ${memberEmail}`);
  };

  const blockMember = (memberId: string) => {
    // setTeamMembers((members) =>
    //   members.map((member) =>
    //     member.id === memberId ? { ...member, status: "blocked" } : member
    //   )
    // );
  };

  const unblockMember = (memberId: string) => {
    // setTeamMembers((members) =>
    //   members.map((member) =>
    //     member.id === memberId ? { ...member, status: "active" } : member
    //   )
    // );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4" />;
      case "member":
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        variant={
          status === "active"
            ? "default"
            : status === "pending"
            ? "outline"
            : "destructive"
        }
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Team Management
          </h1>
          <p className="mt-2  font-medium">
            Manage your organization's team members and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className=" text-white shadow-sm px-6 py-2.5 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Member
        </Button>
      </div>

      {/* Search and Filters */}

      {teamMembers && teamMembers.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-text focus:ring-text/10 "
                />
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {filteredMembers.length} of {teamMembers.length} members
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            Manage your team members, their roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-4">Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className=" text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow>
                      {Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <TableCell key={index} colSpan={1} className="py-4">
                            <Skeleton className="h-8 w-40" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
              {!isLoading &&
                filteredMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-gray-200/60 hover:-50/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ">
                          <AvatarImage src={member.name} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-text">{member.name}</div>
                          <div className="text-sm text-text/50 font-medium">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className="capitalize ">{member.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active"
                            ? "default"
                            : member.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className=" ">
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 shadow-lg border-gray-200"
                        >
                          {member.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() => resendInvite(member.email)}
                              className="font-medium"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}

                          {member.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateMemberRole(member.id, "admin")
                              }
                              className="font-medium"
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Promote to Admin
                            </DropdownMenuItem>
                          )}
                          {member.role !== "user" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateMemberRole(member.id, "user")
                              }
                              className="font-medium"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Demote to User
                            </DropdownMenuItem>
                          )}

                          {member.status === "blocked" ? (
                            <DropdownMenuItem
                              onClick={() => unblockMember(member.id)}
                              className="font-medium text-emerald-600 focus:text-emerald-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Unblock Member
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => blockMember(member.id)}
                              className="font-medium text-red-600 focus:text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Block Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        afterCreate={() => {
          setIsLoading(true);
        }}
        
      />
    </div>
  );
}
