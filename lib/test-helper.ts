import { expect } from "@playwright/test";
import { db } from "@/db";
import { products, inventoryStock, stockMovements, purchases, purchaseItems, sales, saleItems, suppliers, customers } from "@/db/schema/product-schema";

export async function clearDbTables() {
  await db.delete(stockMovements);
  await db.delete(inventoryStock);
  await db.delete(purchaseItems);
  await db.delete(saleItems);
  await db.delete(products);
  await db.delete(purchases);
  await db.delete(sales);
  await db.delete(suppliers);
  await db.delete(customers);
}

export async function getTestAdminCookies(request: any) : Promise<string> {
  let adminCookies: string;
  const adminUser = {
    email: "theo-admin-test@gmail.com",
    password: "Admin@12345",
    name: "Admin User",
    role: "admin",
  };
  // Try to sign in
  const signInRes = await request.post("/api/auth/sign-in/email", {
    data: {
      email: adminUser.email,
      password: adminUser.password,
    },
  });

  if (signInRes.ok()) {
    adminCookies = signInRes.headers()["set-cookie"];
    return adminCookies;
  }

  // If sign-in fails, try to sign up
  const signUpRes = await request.post("/api/auth/sign-up/email", {
    data: adminUser,
  });
  const body = await signUpRes.json();
  console.log("Admin Sign-Up Response:", signUpRes.status(), body);

  if (!signUpRes.ok() && (!body?.user || !body?.token)) {
    throw new Error("Admin sign-up failed and no valid fallback");
  }

  // Try sign-in again after sign-up
  const retrySignIn = await request.post("/api/auth/sign-in/email", {
    data: {
      email: adminUser.email,
      password: adminUser.password,
    },
  });

  expect(retrySignIn.ok()).toBeTruthy();
  adminCookies = retrySignIn.headers()["set-cookie"];
  console.log("Admin Cookies:", adminCookies);
  return adminCookies;
}
