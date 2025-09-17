import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Sales API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
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
    };
    const createProductRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createProductRes.ok()).toBeTruthy();
    const product = await createProductRes.json();

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
      totalAmount: 100.00,
      paidAmount: 100.00,
      paymentStatus: "PAID",
      status: "COMPLETED",
      items: [
        {
          productId: product.id,
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
    };
    const createProductRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createProductRes.ok()).toBeTruthy();
    const product = await createProductRes.json();

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
      totalAmount: 75.00,
      paidAmount: 75.00,
      paymentStatus: "PAID",
      status: "COMPLETED",
      items: [
        {
          productId: product.id,
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
    expect(fetchedSale.items.length).toBe(1);
    expect(fetchedSale.items[0].productId).toBe(product.id);
  });

  test("should update payment status", async ({ request }) => {
    // Create a product
    const newProduct = {
      name: "Sale Payment Status Test Product",
      barcode: "SALEPAY123",
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

    // Create a customer
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
      totalAmount: 30.00,
      paidAmount: 10.00, // Partially paid
      paymentStatus: "PARTIAL",
      status: "DRAFT",
      items: [
        {
          productId: product.id,
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

    //create new category before creating new product
    const newCategory = {
      name: "Sale Exceeded Stock Test Category",
    };
    const createCategoryRes = await request.post("/api/categories", {
      data: newCategory,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createCategoryRes.ok()).toBeTruthy();
    const category = await createCategoryRes.json();

    const newProduct = {
      name: "Sale Exceeded Stock Test Product",
      barcode: "SALEEX123",
      unit: "pcs",
      sellingPrice: 10.00,
      categoryId: category.id,
    };
    const createProductRes = await request.post("/api/products", {
      data: newProduct,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createProductRes.ok()).toBeTruthy();
    const product = await createProductRes.json();

    const createStockRes = await request.post("/api/inventory", {
      data: {
        productId: product.id,
        quantity: 3,
      },
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
    expect(sale.message).toBe("requested quantity for \"Sale Exceeded Stock Test Product\" exceeds available stock.");
  });
});
