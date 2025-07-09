import { getTestAdminCookies } from "@/lib/test-helper";
import { test, expect } from "@playwright/test";

test.describe("Customer API", () => {
  let adminCookies: string;

  test.beforeAll(async ({ request }) => {
    adminCookies = await getTestAdminCookies(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("should create a customer", async ({ request }) => {
    const newCustomer = {
      name: "Test Customer",
      email: "test@example.com",
      phone: "1234567890",
      address: "123 Test St",
      country: "USA",
    };

    const createRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const customer = await createRes.json();
    expect(customer.name).toBe(newCustomer.name);
    expect(customer.email).toBe(newCustomer.email);
  });

  test("should get a customer by ID", async ({ request }) => {
    const newCustomer = {
      name: "Test Customer for ID",
      email: "test_id@example.com",
      phone: "0987654321",
      address: "456 ID Ave",
      country: "Canada",
    };

    const createRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    const customer = await createRes.json();

    const getRes = await request.get(`/api/customers/${customer.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const fetchedCustomer = await getRes.json();
    expect(fetchedCustomer.name).toBe(newCustomer.name);
    expect(fetchedCustomer.email).toBe(newCustomer.email);
  });

  test("should update a customer", async ({ request }) => {
    const newCustomer = {
      name: "Test Customer for Update",
      email: "test_update@example.com",
      phone: "1122334455",
      address: "789 Update Blvd",
      country: "UK",
    };

    const createRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    const customer = await createRes.json();

    const updatedCustomerData = {
      name: "Updated Customer Name",
      phone: "5544332211",
    };

    const updateRes = await request.put(`/api/customers/${customer.id}`, {
      data: updatedCustomerData,
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updatedCustomer = await updateRes.json();
    expect(updatedCustomer.name).toBe(updatedCustomerData.name);
    expect(updatedCustomer.phone).toBe(updatedCustomerData.phone);
    expect(updatedCustomer.email).toBe(newCustomer.email); // Email should remain unchanged
  });

  test("should delete a customer", async ({ request }) => {
    const newCustomer = {
      name: "Test Customer for Delete",
      email: "test_delete@example.com",
      phone: "9988776655",
      address: "101 Delete Rd",
      country: "Germany",
    };

    const createRes = await request.post("/api/customers", {
      data: newCustomer,
      headers: {
        Cookie: adminCookies,
      },
    });
    const customer = await createRes.json();

    const deleteRes = await request.delete(`/api/customers/${customer.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(deleteRes.ok()).toBeTruthy();

    const getRes = await request.get(`/api/customers/${customer.id}`, {
      headers: {
        Cookie: adminCookies,
      },
    });
    expect(getRes.status()).toBe(404);
  });
});
