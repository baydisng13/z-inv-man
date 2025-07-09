import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Stock Movements API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should create a stock movement", async ({ request }) => {
    // Create a product first
    const newProduct = {
      name: "Stock Movement Test Product",
      barcode: "SM12345",
      unit: "pcs",
      sellingPrice: 10.00,
    };
    const createProductRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createProductRes.ok()).toBeTruthy();
    const product = await createProductRes.json();

    const newStockMovement = {
      productId: product.id,
      type: "IN",
      quantity: 100,
    };

    const createRes = await request.post("/api/stock-movements", {
      data: newStockMovement,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const stockMovement = await createRes.json();
    expect(stockMovement.productId).toBe(newStockMovement.productId);
    expect(stockMovement.type).toBe(newStockMovement.type);
    expect(stockMovement.quantity).toBe(newStockMovement.quantity);
  });

  test("should list stock movements with filters", async ({ request }) => {
    const listRes = await request.get("/api/stock-movements", {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(listRes.ok()).toBeTruthy();
    const stockMovementsList = await listRes.json();
    expect(Array.isArray(stockMovementsList)).toBeTruthy();
  });
});
