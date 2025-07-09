import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Supplier API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should create a supplier", async ({ request }) => {
    const newSupplier = {
      name: "Test Supplier",
      email: "supplier@example.com",
      phone: "1234567890",
      address: "123 Supplier St",
      country: "USA",
    };

    const createRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const supplier = await createRes.json();
    expect(supplier.name).toBe(newSupplier.name);
    expect(supplier.email).toBe(newSupplier.email);
  });

  test("should get a supplier by ID", async ({ request }) => {
    const newSupplier = {
      name: "Test Supplier for ID",
      email: "supplier_id@example.com",
      phone: "0987654321",
      address: "456 ID Ave",
      country: "Canada",
    };

    const createRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    const supplier = await createRes.json();

    const getRes = await request.get(`/api/suppliers/${supplier.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const fetchedSupplier = await getRes.json();
    expect(fetchedSupplier.name).toBe(newSupplier.name);
    expect(fetchedSupplier.email).toBe(newSupplier.email);
  });

  test("should update a supplier", async ({ request }) => {
    const newSupplier = {
      name: "Test Supplier for Update",
      email: "supplier_update@example.com",
      phone: "1122334455",
      address: "789 Update Blvd",
      country: "UK",
    };

    const createRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    const supplier = await createRes.json();

    const updatedSupplierData = {
      name: "Updated Supplier Name",
      phone: "5544332211",
    };

    const updateRes = await request.put(`/api/suppliers/${supplier.id}`, {
      data: updatedSupplierData,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updatedSupplier = await updateRes.json();
    expect(updatedSupplier.name).toBe(updatedSupplierData.name);
    expect(updatedSupplier.phone).toBe(updatedSupplierData.phone);
    expect(updatedSupplier.email).toBe(newSupplier.email); // Email should remain unchanged
  });

  test("should delete a supplier", async ({ request }) => {
    const newSupplier = {
      name: "Test Supplier for Delete",
      email: "supplier_delete@example.com",
      phone: "9988776655",
      address: "101 Delete Rd",
      country: "Germany",
    };

    const createRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    const supplier = await createRes.json();

    const deleteRes = await request.delete(`/api/suppliers/${supplier.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(deleteRes.ok()).toBeTruthy();

    const getRes = await request.get(`/api/suppliers/${supplier.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.status()).toBe(404);
  });
});
