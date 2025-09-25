import { getTestAdminCookies } from "@/lib/test-helper";
import { SalesType, SalesCreateType } from "@/schemas/sales-schema";
import { test, expect } from "@playwright/test";

test.describe("Sales API", () => {
  let adminCookies: string;

  const category = {
    name: "Test Category",
  };

  let categoryId: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
    const createCategoryRes = await request.post("/api/categories", {
      data: category,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCategoryRes.ok()).toBeTruthy();
    const createdCategory = await createCategoryRes.json();
    categoryId = createdCategory.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should create a sale", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Sale Test Product",
      barcode: "SALE12345",
      unit: "pcs",
      sellingPrice: 50.00,
      categoryId: categoryId,
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
      name: "Sale Test Supplier",
      email: "sale@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    // Create inventory via purchase
    const newPurchase = {
      supplierId: supplier.id,
      totalAmount: 100.00,
      paidAmount: 100.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 5,
          costPrice: 20.00,
        },
      ],
    };
    const createPurchaseRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createPurchaseRes.ok()).toBeTruthy();

    // Create a customer
    const newCustomer = {
      name: "Sale Test Customer",
      email: "sale@customer.com",
    };
    const createCustomerRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCustomerRes.ok()).toBeTruthy();
    const customer = await createCustomerRes.json();

    const newSale = {
      customerId: customer.id,
      subtotal: 100.00,
      discount: 0.00,
      taxAmount: 0.00,
      totalAmount: 100.00,
      paidAmount: 100.00,
      paymentStatus: "PAID" as const,
      status: "RECEIVED" as const,
      includeTax: false,
      selectedCategory: "",
      productSearch: "",
      isPaymentOpen: false,
      quickAdd: {
        productCode: "",
        quantity: 1,
      },
      saleItems: [
        {
          productId: product.id,
          productCode: product.barcode,
          productName: product.name,
          quantity: 2,
          unitPrice: 50.00,
          total: 100.00,
        },
      ],
    };

    const createRes = await request.post("/api/sales", {
      data: newSale,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const sale = await createRes.json();
    expect(sale.totalAmount).toBe(newSale.totalAmount.toFixed(2));
    expect(sale.customerId).toBe(newSale.customerId);
  });

  test("should retrieve a sale", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Sale Retrieve Test Product",
      barcode: "SALERET123",
      unit: "pcs",
      sellingPrice: 25.00,
      categoryId: categoryId,
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
      name: "Sale Retrieve Test Supplier",
      email: "saleretrieve@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    // Create inventory via purchase
    const newPurchase = {
      supplierId: supplier.id,
      totalAmount: 75.00,
      paidAmount: 75.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 5,
          costPrice: 15.00,
        },
      ],
    };
    const createPurchaseRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createPurchaseRes.ok()).toBeTruthy();

    // Create a customer
    const newCustomer = {
      name: "Sale Retrieve Test Customer",
      email: "saleretrieve@customer.com",
    };
    const createCustomerRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCustomerRes.ok()).toBeTruthy();
    const customer = await createCustomerRes.json();

    const newSale = {
      customerId: customer.id,
      subtotal: 75.00,
      discount: 0.00,
      taxAmount: 0.00,
      totalAmount: 75.00,
      paidAmount: 75.00,
      paymentStatus: "PAID" as const,
      status: "RECEIVED" as const,
      includeTax: false,
      selectedCategory: "",
      productSearch: "",
      isPaymentOpen: false,
      quickAdd: {
        productCode: "",
        quantity: 1,
      },
      saleItems: [
        {
          productId: product.id,
          productCode: product.barcode,
          productName: product.name,
          quantity: 3,
          unitPrice: 25.00,
          total: 75.00,
        },
      ],
    };

    const createRes = await request.post("/api/sales", {
      data: newSale,
      headers: {
        Cookie: adminCookies,
      },
    });
    const sale = await createRes.json();

    const getRes = await request.get(`/api/sales/${sale.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const fetchedSale = await getRes.json();
    expect(fetchedSale.totalAmount).toBe(newSale.totalAmount.toFixed(2));
    expect(fetchedSale.saleItems.length).toBe(1);
    expect(fetchedSale.saleItems[0].productId).toBe(product.id);
  });

  test("should update payment status", async ({ request }) => {
    const newProduct = {
      name: "Sale Payment Status Test Product",
      barcode: "SALEPAY123",
      unit: "pcs",
      sellingPrice: 10.00,
      categoryId: categoryId,
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
      name: "Sale Payment Status Test Supplier",
      email: "salepayment@supplier.com",
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
      totalAmount: 50.00,
      paidAmount: 50.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 5,
          costPrice: 10.00,
        },
      ],
    };
    const createPurchaseRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createPurchaseRes.ok()).toBeTruthy();

    const newCustomer = {
      name: "Sale Payment Status Test Customer",
      email: "salepayment@customer.com",
    };
    const createCustomerRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCustomerRes.ok()).toBeTruthy();
    const customer = await createCustomerRes.json();

    const newSale = {
      customerId: customer.id,
      subtotal: 30.00,
      discount: 0.00,
      taxAmount: 0.00,
      totalAmount: 30.00,
      paidAmount: 10.00, // Partially paid
      paymentStatus: "PARTIAL" as const,
      status: "DRAFT" as const,
      includeTax: false,
      selectedCategory: "",
      productSearch: "",
      isPaymentOpen: false,
      quickAdd: {
        productCode: "",
        quantity: 1,
      },
      saleItems: [
        {
          productId: product.id,
          productCode: product.barcode,
          productName: product.name,
          quantity: 3,
          unitPrice: 10.00,
          total: 30.00,
        },
      ],
    };

    const createRes = await request.post("/api/sales", {
      data: newSale,
      headers: {
        Cookie: adminCookies,
      },
    });
    const sale = await createRes.json();

    const updateRes = await request.put(`/api/sales/${sale.id}`, {
      data: { paidAmount: 30.00, paymentStatus: "PAID" },
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updatedSale = await updateRes.json();
    expect(updatedSale.paidAmount).toBe("30.00");
    expect(updatedSale.paymentStatus).toBe("PAID");
  });

  test("should fail to create sale with exceeded stock", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Sale Exceeded Stock Test Product",
      barcode: "SALEEX123",
      unit: "pcs",
      sellingPrice: 10.00,
      categoryId: categoryId,
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
      name: "Exceeded Stock Test Supplier",
      email: "exceeded@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    // Create inventory via purchase - 3 items
    const newPurchase = {
      supplierId: supplier.id,
      totalAmount: 30.00,
      paidAmount: 30.00,
      paymentStatus: "PAID",
      status: "RECEIVED",
      items: [
        {
          productId: product.id,
          quantity: 3,
          costPrice: 10.00,
        },
      ],
    };
    const createStockRes = await request.post("/api/purchases", {
      data: newPurchase,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createStockRes.ok()).toBeTruthy();

    // Create a customer
    const newCustomer = {
      name: "Sale Exceeded Stock Test Customer",
      email: "saleexceeded@customer.com",
    };
    const createCustomerRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCustomerRes.ok()).toBeTruthy();
    const customer = await createCustomerRes.json();

    const newSale = {
      customerId: customer.id,
      subtotal: 40.00,
      discount: 0.00,
      taxAmount: 0.00,
      totalAmount: 40.00,
      paidAmount: 40.00,
      paymentStatus: "PAID",
      status: "DRAFT",
      includeTax: false,
      selectedCategory: "",
      productSearch: "",
      isPaymentOpen: false,
      quickAdd: {
        productCode: "",
        quantity: 1,
      },
      saleItems: [
        {
          productId: product.id,
          productCode: product.barcode,
          productName: product.name,
          quantity: 4,
          unitPrice: 10.00,
          total: 40.00,
        },
      ],
    };

    const createRes = await request.post("/api/sales", {
      data: newSale,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeFalsy();
    const sale = await createRes.json();
    expect(sale.message).toBe('requested quantity for "Sale Exceeded Stock Test Product" exceeds available stock.');
  });

  test("should consume inventory from multiple lots using FIFO", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "FIFO Sales Test Product",
      barcode: "FIFOSALES123",
      unit: "pcs",
      sellingPrice: 15.00,
      categoryId: categoryId,
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
      name: "FIFO Test Supplier",
      email: "fifo@supplier.com",
    };
    const createSupplierRes = await request.post("/api/suppliers", {
      data: newSupplier,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSupplierRes.ok()).toBeTruthy();
    const supplier = await createSupplierRes.json();

    // Create inventory - First lot: 6 items via purchase
    const firstPurchase = {
      supplierId: supplier.id,
      totalAmount: 60.00,
      paidAmount: 60.00,
      paymentStatus: "PAID" as const,
      status: "RECEIVED" as const,
      items: [
        {
          productId: product.id,
          quantity: 6,
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

    // Wait to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create inventory - Second lot: 8 items via purchase
    const secondPurchase = {
      supplierId: supplier.id,
      totalAmount: 80.00,
      paidAmount: 80.00,
      paymentStatus: "PAID" as const,
      status: "RECEIVED" as const,
      items: [
        {
          productId: product.id,
          quantity: 8,
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

    // Create a customer
    const newCustomer = {
      name: "FIFO Sales Test Customer",
      email: "fifosales@customer.com",
    };
    const createCustomerRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCustomerRes.ok()).toBeTruthy();
    const customer = await createCustomerRes.json();

    // Sell 10 items (should consume 6 from first lot + 4 from second lot)
    const newSale = {
      customerId: customer.id,
      subtotal: 150.00,
      discount: 0.00,
      taxAmount: 0.00,
      totalAmount: 150.00,
      paidAmount: 150.00,
      paymentStatus: "PAID" as const,
      status: "RECEIVED" as const,
      includeTax: false,
      selectedCategory: "",
      productSearch: "",
      isPaymentOpen: false,
      quickAdd: {
        productCode: "",
        quantity: 1,
      },
      saleItems: [
        {
          productId: product.id,
          productCode: product.barcode,
          productName: product.name,
          quantity: 10,
          unitPrice: 15.00,
          total: 150.00,
        },
      ],
    } satisfies SalesCreateType

    const createSaleRes = await request.post("/api/sales", {
      data: newSale,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createSaleRes.ok()).toBeTruthy();
    const sale = await createSaleRes.json();
    expect(sale.totalAmount).toBe("150.00");

    const productRes = await request.get(`/api/products/${product.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(productRes.ok()).toBeTruthy();
    const productWithInventory = await productRes.json();

    const inventoryRecords = productWithInventory.inventoryRecords;
    expect(inventoryRecords.length).toBe(2); // Should have 2 lots

    const sortedRecords = inventoryRecords.sort((a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    expect(sortedRecords[0].quantity).toBe(0);

    expect(sortedRecords[1].quantity).toBe(4);

    const totalQuantity = inventoryRecords.reduce((sum: number, record: any) =>
      sum + Number(record.quantity), 0
    );
    expect(totalQuantity).toBe(4); 
  });

});
