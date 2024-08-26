import { db } from "@/connectors/db/db"

export const dynamic = "force-dynamic"

export default async function Page() {
  const entries = await db.query.periodBudgetEntryTable.findMany({ limit: 100 })

  if (entries.length === 0) {
    return <div>Nic tu nemam. Musis neco pridat.</div>
  }

  return (
    <>
      <h1>DB zaznamy</h1>
      <div className="h-4" />
      {entries.map((entry) => (
        <div key={entry.id}>{entry.name}</div>
      ))}
    </>
  )
}
