export interface User {
  id: string
  name: string
  email: string
  role: string | string[]
  banned: boolean
  banReason?: string
  banExpires?: Date
  createdAt: Date
  updatedAt: Date
  [key: string]: any
}

export interface Session {
  id: string
  userId: string
  sessionToken: string
  impersonatedBy?: string
  createdAt: Date
  expiresAt: Date
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: string | string[]
  data?: Record<string, any>
}

export interface ListUsersQuery {
  searchField?: "email" | "name"
  searchOperator?: "contains" | "starts_with" | "ends_with"
  searchValue?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filterField?: string
  filterOperator?: "eq" | "contains" | "starts_with" | "ends_with"
  filterValue?: string
}

export interface ListUsersResponse {
  users: User[]
  total: number
  limit?: number
  offset?: number
}

export interface SetRoleRequest {
  userId: string
  role: string | string[]
}

export interface BanUserRequest {
  userId: string
  banReason?: string
  banExpiresIn?: number
}

export interface Permission {
  [resource: string]: string[]
}

export interface HasPermissionRequest {
  permissions: Permission
  userId?: string
  role?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
