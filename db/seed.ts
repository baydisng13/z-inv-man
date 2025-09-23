import { user } from "@/auth-schema";
import { db } from ".";
import { customers, suppliers } from "./schema/product-schema";

async function main() {
  console.log("Seeding initial config data...");

  // First, create a system user if it doesn't exist
  await db
    .insert(user)
    .values({
      id: "system",
      name: "System",
      email: "system@example.com",
      emailVerified: true,
      role: "admin",
    })
    .onConflictDoNothing();

  await db
    .insert(customers)
    .values({
      id: "00000000-0000-0000-0000-000000000000",
      name: "Unknown Customer",
      tin_number: "00000000",
      phone: "1234567890",
      email: "unknown@example.com",
      address: "123 Unknown Street",
      country: "Unknown Country",
      createdBy: "system",
    })
    .onConflictDoNothing();

  await db.insert(suppliers).values({
    id: "00000000-0000-0000-0000-000000000000",
    name: "Unknown Supplier",
    tin_number: "00000000",
    phone: "1234567890",
    email: "unknown@example.com",
    address: "123 Unknown Street",
    country: "Unknown Country",
    createdBy: "system",
  })
  .onConflictDoNothing();

  console.log("Seeding complete!");
}


export default main