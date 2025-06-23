import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { ApiResponse } from "@/types/admin"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { userId } = await params
    const body: { role: string | string[] } = await request.json()

    const updatedUser = await auth.api.setRole({
      body: {
        userId,
        role: body.role,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    } as ApiResponse)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to set user role" } as ApiResponse, { status: 500 })
  }
}


// ========================
// purpuse : change role
// request : /api/admin/users/[userId]/role
// method : PUT
// request body : {role: string | string[]}
// response : {success: boolean, error?: string, data?: any}
// ========================
