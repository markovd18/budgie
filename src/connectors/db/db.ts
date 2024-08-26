import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

import { createClient } from "@libsql/client"
import env, { isProd } from "@/utils/env.mjs"

import * as schema from "./schema"

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_TOKEN,
})

export const db = drizzle(client, { schema })

if (isProd()) {
  migrate(db, { migrationsFolder: "drizzle" })
}

export type Database = typeof db
