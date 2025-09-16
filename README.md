This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## TODOs and Improvements

*   **Security Vulnerability: Missing Authentication in Customer API Endpoints**
    *   The API endpoints for individual customer operations (`/api/customers/[id]`) in `app/api/customers/[id]/route.ts` currently lack authentication checks. This allows unauthorized access to view, update, or delete customer records if the ID is known.
    *   **Action:** Implement authentication checks in `GET`, `PUT`, and `DELETE` functions within `app/api/customers/[id]/route.ts` to ensure only authorized users can perform these actions.

*   **Security Vulnerability: Missing Authentication in Dashboard Layout**
    *   `app/(dashboard)/layout.tsx` lacks authentication, making dashboard content publicly accessible.
    *   **Action:** Uncomment and enable the authentication and redirection logic in `app/(dashboard)/layout.tsx`.

*   **Numerical Values Returned as Strings from API**
    *   The `decimal` fields (e.g., `subtotal`, `discount`, `totalAmount`, `paidAmount`) are returned as strings from the sales API (`app/api/sales/route.ts`) due to Drizzle ORM's default behavior for `decimal` types. This causes "toFixed is not a function" errors in the frontend.
    *   **Action:** Convert these string values to numbers (e.g., using `parseFloat()`) in the `GET` function of `app/api/sales/route.ts` before sending them to the frontend.

*   **Sale Items not displayed on single sale page**
    *   The `app/sales/[id]/route.ts` API returns sale items under the key `items`, but the frontend `app/sales/[sale_id]/page.tsx` expects them under `saleItems`. This mismatch causes sale items not to be displayed.
    *   **Action:** Modify the `GET` function in `app/api/sales/[id]/route.ts` to return sale items under the `saleItems` key (e.g., `return NextResponse.json({ ...sale[0], saleItems: items });`).

*   **Dummy Data for Development**
    *   The current `db/seed.ts` only provides minimal "Unknown Customer" and "Unknown Supplier" entries. For more comprehensive development and testing, it would be beneficial to have a richer set of dummy data.
    *   **Action:** Enhance `db/seed.ts` to generate a larger and more varied set of dummy data for customers, products, sales, purchases, etc., to facilitate local development and testing.

*   **Sales Implementation Inconsistency**
    *   Two sales pages exist: a client-side mock data version (`app/(dashboard)/app/sales/page.tsx`) and a more complete server-side version (`app/sales/page.tsx`).
    *   **Action:** The dashboard's sales page should be updated to use the server-side implementation or removed.

*   **Incomplete Features**
    *   Team Management actions (role updates, blocking/unblocking) are placeholders.
    *   Dashboard homepage uses hardcoded data.
    *   Pagination is often present but not fully implemented.

*   **Redundant Files**
    *   `app/(auth)/page copy.tsx` should be renamed or deleted.
    *   `app/(dashboard)/app/pos/page copy.tsx` should be deleted.
    *   `loading.tsx` files in feature directories are currently redundant.

*   **Debugging Code**
    *   `app/(dashboard)/app/pos/page.tsx` contains debugging `JSON.stringify` calls that need removal.

*   **UI Text Inconsistencies**
    *   Minor text errors, like "Add New Product" on the product update page.
