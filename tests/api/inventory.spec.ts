import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Inventory API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should get stock for a specific product", async ({ request }) => {
    // Create a product first
    const newProduct = {
      name: "Inventory Test Product",
      barcode: "INV12345",
      unit: "pcs",
      sellingPrice: 99.99,
    };
    const createProductRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createProductRes.ok()).toBeTruthy();
    const product = await createProductRes.json();

    // Now, get stock for this specific product
    const getStockRes = await request.get(`/api/inventory?productId=${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getStockRes.ok()).toBeTruthy();
    const stock = await getStockRes.json();
    // Expecting an empty array or a single item with 0 quantity if no stock movements yet
    expect(Array.isArray(stock)).toBeTruthy();
  });

  test("should list inventory stock", async ({ request }) => {
    const listStockRes = await request.get("/api/inventory", {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(listStockRes.ok()).toBeTruthy();
    const stockList = await listStockRes.json();
    expect(Array.isArray(stockList)).toBeTruthy();
  });
});
