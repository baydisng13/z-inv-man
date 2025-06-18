import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
