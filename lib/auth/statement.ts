import { defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,

  // Auth-related
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password"],
  session: ["list", "revoke", "delete"],
  account: ["list", "delete", "update", "create"],
  verification: ["create", "delete", "list"],

  // Core modules
  product: ["create", "read", "update", "delete", "archive", "unarchive"],
  stock: ["read", "adjust", "move"],
  purchase: ["create", "read", "update", "delete", "receive"],
  sale: ["create", "read", "update", "delete", "refund"],
  customer: ["create", "read", "update", "delete"],
  supplier: ["create", "read", "update", "delete"],
  category: ["create", "read", "update", "delete"],
} as const;