import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { CreateUserRequest, ListUsersQuery, ApiResponse, User, ListUsersResponse } from "@/types/admin"

export async function POST(request: NextRequest) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const body: CreateUserRequest = await request.json()

    const newUser = await auth.api.adminCreateUser({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role || "user",
        data: body.data || {},
      },
    })

    return NextResponse.json({
      success: true,
      data: newUser,
    } as ApiResponse<User>)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create user" } as ApiResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { searchParams } = new URL(request.url)

    const query: ListUsersQuery = {
      searchField: (searchParams.get("searchField") as "email" | "name") || undefined,
      searchOperator: (searchParams.get("searchOperator") as "contains" | "starts_with" | "ends_with") || undefined,
      searchValue: searchParams.get("searchValue") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortDirection: (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
      filterField: searchParams.get("filterField") || undefined,
      filterOperator:
        (searchParams.get("filterOperator") as "eq" | "contains" | "starts_with" | "ends_with") || undefined,
      filterValue: searchParams.get("filterValue") || undefined,
    }

    const result = await auth.api.adminListUsers({
      query,
    })

    return NextResponse.json({
      success: true,
      data: result,
    } as ApiResponse<ListUsersResponse>)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to list users" } as ApiResponse, { status: 500 })
  }
}

// documentation 
// ========================
// purpuse : create user
// request : /api/admin/users
// method : POST
// request body : {name: string, email: string, password: string, role?: string, data?: any}
// response : {success: boolean, error?: string, data?: any}
// ========================

// ========================
// purpuse : list users
// request : /api/admin/users
// method : GET
// request body : {searchField?: "email" | "name", searchOperator?: "contains" | "starts_with" | "ends_with", searchValue?: string, limit?: number, offset?: number, sortBy?: "createdAt" | "updatedAt", sortDirection?: "asc" | "desc", filterField?: string, filterOperator?: "eq" | "contains" | "starts_with" | "ends_with", filterValue?: string}
// response : {success: boolean, error?: string, data?: any}
// ========================

