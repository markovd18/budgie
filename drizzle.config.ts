import { defineConfig } from "drizzle-kit"
import { config } from "dotenv"
config({ path: ".env" })

export default defineConfig({
  schema: "./src/connectors/db/schema.ts",
  out: "./src/connectors/db/drizzle",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "noop",
    authToken: process.env.DATABASE_TOKEN,
  },
  strict: true,
  verbose: true,
})
