import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { admin, user } from "./auth/role";
import { ac } from "./auth/ac";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});

export const { signIn, signUp, useSession } = authClient;
