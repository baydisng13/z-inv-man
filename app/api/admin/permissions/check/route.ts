import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { HasPermissionRequest, ApiResponse } from "@/types/admin"

export async function POST(request: NextRequest) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const body: HasPermissionRequest = await request.json()

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: body.userId,
        role: body.role,
        permissions: body.permissions,
      },
    })

    return NextResponse.json({
      success: true,
      data: { hasPermission },
    } as ApiResponse<{ hasPermission: boolean }>)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to check permissions" } as ApiResponse, { status: 500 })
  }
}



// documention
// request method: POST
// request url: api/admin/permissions/check
// request body: HasPermissionRequest
// response:
// {
//   "success": true,
//   "data": {
//     "hasPermission": true
//   }
// }

