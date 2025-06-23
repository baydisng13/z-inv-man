import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { ApiResponse } from "@/types/admin"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { userId } = await params

    const deletedUser = await auth.api.adminRemoveUser({
      body: { userId },
    })

    return NextResponse.json({
      success: true,
      data: deletedUser,
    } as ApiResponse)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete user" } as ApiResponse, { status: 500 })
  }
}
