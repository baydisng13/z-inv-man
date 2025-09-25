import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./schema/auth-schema";
import * as productSchema from "./schema/product-schema";
import main from "./seed";

export const db = drizzle(process.env.POSTGRES_URL!, {
  schema: { ...authSchema, ...productSchema },
});

// main().catch((err) => {
//   console.error("❌ Seeding failed:", err);
//   process.exit(1);
// });
