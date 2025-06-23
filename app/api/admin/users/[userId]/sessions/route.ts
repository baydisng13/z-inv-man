import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { ApiResponse, Session } from "@/types/admin"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { userId } = await params

    const sessions = await auth.api.adminListUserSessions({
      body: { userId },
    })

    return NextResponse.json({
      success: true,
      data: sessions,
    } as ApiResponse<Session[]>)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to list user sessions" } as ApiResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { userId } = await params

    const revokedSessions = await auth.api.adminRevokeUserSessions({
      body: { userId },
    })

    return NextResponse.json({
      success: true,
      data: revokedSessions,
    } as ApiResponse)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to revoke user sessions" } as ApiResponse, {
      status: 500,
    })
  }
}
