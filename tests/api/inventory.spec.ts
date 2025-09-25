import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Inventory API", () => {
  let adminCookies: string;
  let testCategory: any;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
    
    // Create a test category to use across all tests
    const newCategory = {
      name: "Inventory Test Category",
    };
    const createCategoryRes = await request.post("/api/categories", {
      data: newCategory,
      headers: {
        Cookie: adminCookies,
      },
    });
    testCategory = await createCategoryRes.json();
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
      categoryId: testCategory.id,
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

  test("should show multiple inventory lots for same product", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Multiple Lots Test Product",
      barcode: "MULTILOTS123",
      unit: "pcs",
      sellingPrice: 40.00,
      categoryId: testCategory.id,
    };
    const createProductRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createProductRes.ok()).toBeTruthy();
    const product = await createProductRes.json();

    // Create a supplier for purchases
    const newSupplier = {
      name: "Inventory Test Supplier",
      email: "inventory@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    // Create first purchase to generate inventory
    const firstPurchase = {
      supplierId: supplier.id,
      totalAmount: 100.00,
      paidAmount: 100.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 10,
          costPrice: 10.00,
        },
      ],
    };
    const createFirstPurchaseRes = await request.post("/api/purchases", {
      data: firstPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createFirstPurchaseRes.ok()).toBeTruthy();

    // Create second purchase to generate more inventory
    const secondPurchase = {
      supplierId: supplier.id,
      totalAmount: 200.00,
      paidAmount: 200.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 20,
          costPrice: 10.00,
        },
      ],
    };
    const createSecondPurchaseRes = await request.post("/api/purchases", {
      data: secondPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSecondPurchaseRes.ok()).toBeTruthy();

    // Get product with inventory records
    const productRes = await request.get(`/api/products/${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(productRes.ok()).toBeTruthy();
    const productWithInventory = await productRes.json();

    const inventoryRecords = productWithInventory.inventoryRecords;
    expect(inventoryRecords.length).toBe(2); // Two separate inventory lots

    // Check total quantities
    const quantities = inventoryRecords.map((record: any) => Number(record.quantity)).sort();
    expect(quantities).toEqual([10, 20]); // Both lots should be present
  });
});
