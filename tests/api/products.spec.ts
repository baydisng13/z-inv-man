import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Product API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should create a product", async ({ request }) => {
    const newProduct = {
      name: "Test Product",
      barcode: "1234567890",
      unit: "pcs",
      sellingPrice: 10.99,
    };

    const createRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const product = await createRes.json();
    expect(product.name).toBe(newProduct.name);
  });

  test("should get a product by ID", async ({ request }) => {
    const newProduct = {
      name: "Test Product for ID",
      barcode: "1234567891",
      unit: "pcs",
      sellingPrice: 11.99,
    };

    const createRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    const product = await createRes.json();

    const getRes = await request.get(`/api/products/${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const fetchedProduct = await getRes.json();
    expect(fetchedProduct.name).toBe(newProduct.name);
  });

  test("should update a product", async ({ request }) => {
    const newProduct = {
      name: "Test Product for Update",
      barcode: "1234567892",
      unit: "pcs",
      sellingPrice: 12.99,
    };

    const createRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    const product = await createRes.json();

    const updatedProduct = {
      ...newProduct,
      name: "Updated Test Product",
    };
    const updateRes = await request.put(`/api/products/${product.id}`, {
      data: updatedProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe(updatedProduct.name);
  });

  test("should delete a product", async ({ request }) => {
    const newProduct = {
      name: "Test Product for Delete",
      barcode: "1234567893",
      unit: "pcs",
      sellingPrice: 13.99,
    };

    const createRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    const product = await createRes.json();

    const deleteRes = await request.delete(`/api/products/${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(deleteRes.ok()).toBeTruthy();

    const listRes = await request.get("/api/products", {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(listRes.ok()).toBeTruthy();
    const allProducts = await listRes.json();
    const exists = allProducts.some((p: any) => p.id === product.id);
    expect(exists).toBeFalsy();
  });
});