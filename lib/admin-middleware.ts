import type { NextRequest } from "next/server"
import { auth } from "./auth"

export async function validateAdminAccess(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return { error: "Unauthorized", status: 401 }
    }

    // Check if user is admin
    const isAdmin = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          user: ["create", "list", "set-role", "ban", "impersonate", "delete"],
        },
      },
    })

    if (!isAdmin) {
      return { error: "Forbidden - Admin access required", status: 403 }
    }

    return { user: session.user }
  } catch (error) {
    return { error: "Authentication failed", status: 401 }
  }
}
