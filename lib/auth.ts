import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, createAuthMiddleware, openAPI } from "better-auth/plugins";
import { admin, user } from "./auth/role";
import { ac } from "./auth/ac";



export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    openAPI(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});


createAuthMiddleware(async (ctx) => {

    const cookieName = ctx.context.password.hash
});


