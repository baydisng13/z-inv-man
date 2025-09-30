import { ac } from "./ac";
import { statement } from "./statement";

// 👤 User Role
export const user = ac.newRole({
  product: ["create", "read", "update"],
  stock: ["read"],
  sale: ["create", "read"],
  customer: ["create", "read", "update"],
});

// 🛡️ Admin Role — Full Permissions
export const admin = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
  account: ["list", "delete", "update", "create"],
  verification: ["create", "delete", "list"],
  category: ["create", "delete", "read", "update"],
  product: ["create", "read", "update", "delete"],
  stock: ["read"],
  sale: ["create", "read"],
  customer: ["create", "read", "update"],
});
