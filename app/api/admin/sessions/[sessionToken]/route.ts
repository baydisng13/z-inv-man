import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { ApiResponse } from "@/types/admin"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ sessionToken: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { sessionToken } = await params

    const revokedSession = await auth.api.adminRevokeUserSession({
      body: { sessionToken },
    })

    return NextResponse.json({
      success: true,
      data: revokedSession,
    } as ApiResponse)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to revoke session" } as ApiResponse, { status: 500 })
  }
}


// documention
// request method: DELETE
// request url: api/admin/sessions/token
// response:
// {
//   "success": true,
//   "data": any
// }
