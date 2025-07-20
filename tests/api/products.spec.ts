import { getTestAdminCookies, clearDbTables } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Product API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
  });

  test.beforeEach(async ({ page, request }) => {
    await page.context().clearCookies();
    await clearDbTables();
    adminCookies = await getTestAdminCookies(request);
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

    // Verify product exists before deleting
    const getResBeforeDelete = await request.get(`/api/products/${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getResBeforeDelete.ok()).toBeTruthy(); // Ensure product is found before deletion

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

  test("should archive and unarchive a product", async ({ request }) => {
    const newProduct = {
      name: "Test Product for Archive",
      barcode: "1234567894",
      unit: "pcs",
      sellingPrice: 14.99,
    };

    // 1. Create a product
    const createRes = await request.post("/api/products", {
      data: newProduct,
      headers: { Cookie: adminCookies },
    });
    expect(createRes.ok()).toBeTruthy();
    const product = await createRes.json();

    // 2. Archive the product (using the PATCH endpoint)
    const archiveRes = await request.patch(`/api/products/${product.id}`, {
      data: { isArchived: true },
      headers: { Cookie: adminCookies },
    });
    expect(archiveRes.ok()).toBeTruthy();
    const archivedProduct = await archiveRes.json();
    expect(archivedProduct.isArchived).toBe(true);

    // 3. Verify it's in the archived list and not in the active list
    const archivedListRes = await request.get("/api/products?isArchived=true", {
      headers: { Cookie: adminCookies },
    });
    const archivedList = await archivedListRes.json();
    expect(archivedList.some((p: any) => p.id === product.id)).toBe(true);

    const activeListRes = await request.get("/api/products?isArchived=false", {
        headers: { Cookie: adminCookies },
    });
    const activeList = await activeListRes.json();
    expect(activeList.some((p: any) => p.id === product.id)).toBe(false);

    // 4. Unarchive the product
    const unarchiveRes = await request.put(`/api/products/${product.id}`, {
        data: { isArchived: false },
        headers: { Cookie: adminCookies },
    });
    expect(unarchiveRes.ok()).toBeTruthy();
    const unarchivedProduct = await unarchiveRes.json();
    expect(unarchivedProduct.isArchived).toBe(false);

    // 5. Verify it's back in the active list
    const finalListRes = await request.get("/api/products?isArchived=false", {
        headers: { Cookie: adminCookies },
    });
    const finalList = await finalListRes.json();
    expect(finalList.some((p: any) => p.id === product.id)).toBe(true);
  });

  test("should create an inventory item when a product is created", async ({ request }) => {
    const newProduct = {
      name: "Test Product with Inventory",
      barcode: "1234567895",
      unit: "pcs",
      sellingPrice: 15.99,
    };

    const createRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const product = await createRes.json();

    const inventoryRes = await request.get(`/api/inventory?productId=${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(inventoryRes.ok()).toBeTruthy();
    const inventory = await inventoryRes.json();
    expect(inventory.length).toBe(1);
    expect(inventory[0].quantity).toBe(0);
  });
});