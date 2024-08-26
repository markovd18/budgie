import { sql } from "drizzle-orm"
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const periodBudgetEntryTable = sqliteTable("period_budget_entry", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  amount: int("amount").notNull(),
  type: text("type", { enum: ["income", "expense"] })
    .notNull()
    .default("expense"),

  createdAt: int("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: int("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
})
