import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Purchase API", () => {
  let adminCookies: string;
  let testCategory: any;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
    
    // Create a test category to use across all tests
    const newCategory = {
      name: "Purchase Test Category",
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

  test("should create a purchase", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Purchase Test Product",
      barcode: "PUR12345",
      unit: "pcs",
      sellingPrice: 50.00,
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

    // Create a supplier
    const newSupplier = {
      name: "Purchase Test Supplier",
      email: "purchase@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    const newPurchase = {
      supplierId: supplier.id,
      totalAmount: 100.00,
      paidAmount: 100.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 2,
          costPrice: 50.00,
        },
      ],
    };

    const createRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const purchase = await createRes.json();
    expect(purchase.totalAmount).toBe(newPurchase.totalAmount.toFixed(2));
    expect(purchase.supplierId).toBe(newPurchase.supplierId);
  });

  test("should fetch purchase details", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Purchase Details Test Product",
      barcode: "PURDET123",
      unit: "pcs",
      sellingPrice: 25.00,
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

    // Create a supplier
    const newSupplier = {
      name: "Purchase Details Test Supplier",
      email: "purchasedetails@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    const newPurchase = {
      supplierId: supplier.id,
      totalAmount: 75.00,
      paidAmount: 75.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 3,
          costPrice: 25.00,
        },
      ],
    };

    const createRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    const purchase = await createRes.json();

    const getRes = await request.get(`/api/purchases/${purchase.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const fetchedPurchase = await getRes.json();
    expect(fetchedPurchase.totalAmount).toBe(newPurchase.totalAmount.toFixed(2));
    expect(fetchedPurchase.items.length).toBe(1);
    expect(fetchedPurchase.items[0].productId).toBe(product.id);
  });

  test("should mark purchase as received", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Purchase Mark Received Test Product",
      barcode: "PURREC123",
      unit: "pcs",
      sellingPrice: 10.00,
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

    // Create a supplier
    const newSupplier = {
      name: "Purchase Mark Received Test Supplier",
      email: "purchasereceived@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    const newPurchase = {
      supplierId: supplier.id,
      totalAmount: 30.00,
      paidAmount: 30.00,
      paymentStatus: "PAID",
      status: "DRAFT", // Start as DRAFT
      items: [
        {
          productId: product.id,
          quantity: 3,
          costPrice: 10.00,
        },
      ],
    };

    const createRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    const purchase = await createRes.json();

    const updateRes = await request.put(`/api/purchases/${purchase.id}`, {
      data: { status: "RECEIVED" },
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updatedPurchase = await updateRes.json();
    expect(updatedPurchase.status).toBe("RECEIVED");
  });

  test("should create separate inventory rows for multiple purchases", async ({ request }) => {
    const newProduct = {
      name: "Multi Purchase Inventory Test Product",
      barcode: "MULTIPURCH123",
      unit: "pcs",
      sellingPrice: 20.00,
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

    const newSupplier = {
      name: "Multi Purchase Test Supplier",
      email: "multipurch@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    const firstPurchase = {
      supplierId: supplier.id,
      totalAmount: 120.00,
      paidAmount: 120.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 6,
          costPrice: 20.00,
        },
      ],
    };

    const createFirstRes = await request.post("/api/purchases", {
      data: firstPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createFirstRes.ok()).toBeTruthy();

    const secondPurchase = {
      supplierId: supplier.id,
      totalAmount: 160.00,
      paidAmount: 160.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 8,
          costPrice: 20.00,
        },
      ],
    };

    const createSecondRes = await request.post("/api/purchases", {
      data: secondPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSecondRes.ok()).toBeTruthy();

    const productRes = await request.get(`/api/products/${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(productRes.ok()).toBeTruthy();
    const productWithInventory = await productRes.json();

    const inventoryRecords = productWithInventory.inventoryRecords;
    expect(inventoryRecords.length).toBe(2);

    const quantities = inventoryRecords.map((record: any) => Number(record.quantity)).sort();
    expect(quantities).toEqual([6, 8]);
  });

});
