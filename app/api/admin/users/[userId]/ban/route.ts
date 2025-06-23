import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-config"
import { validateAdminAccess } from "@/lib/admin-middleware"
import type { BanUserRequest, ApiResponse } from "@/types/admin"

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { userId } = await params
    const body: Omit<BanUserRequest, "userId"> = await request.json()

    const bannedUser = await auth.api.adminBanUser({
      body: {
        userId,
        banReason: body.banReason,
        banExpiresIn: body.banExpiresIn,
      },
    })

    return NextResponse.json({
      success: true,
      data: bannedUser,
    } as ApiResponse)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to ban user" } as ApiResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const adminCheck = await validateAdminAccess(request)
  if (adminCheck.error) {
    return NextResponse.json({ success: false, error: adminCheck.error } as ApiResponse, { status: adminCheck.status })
  }

  try {
    const { userId } = await params

    const unbannedUser = await auth.api.adminUnbanUser({
      body: { userId },
    })

    return NextResponse.json({
      success: true,
      data: unbannedUser,
    } as ApiResponse)
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to unban user" } as ApiResponse, { status: 500 })
  }
}

// ======================
// purpose: unban user
// request method: DELETE
// request url: api/admin/users/[userId]/ban
// response:
// {
//   "success": true,
//   "data": any
// }


// ======================
// purpose: ban user
// request method: POST
// request url: api/admin/users/[userId]/ban
// request body:
// {
//   "banReason": "Banned for violating the terms of service",
//   "banExpiresIn": 3600
// }
// response:
// {  
//   "success": true,
//   "data": any
// }
