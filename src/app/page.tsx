"use client"

import { Button } from "@/components/ui/Button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { LongTermGoal, useLongTermGoals } from "@/sections/longTermGoals/longTermGoals.utils"
import { PeriodBudgetTable } from "@/sections/periodBudget/PeriodBudgetTable"
import { IconPlus } from "@tabler/icons-react"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

export default function Home() {
  const longTermGoals = useLongTermGoals()
  const columns: ColumnDef<LongTermGoal>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-right">Položka</div>,
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row.getValue("name")}</div>
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Celkem</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("cs-CZ", {
          style: "currency",
          currency: "CZK",
        }).format(amount)

        return <div className="text-right font-medium">{formatted}</div>
      },
    },
  ]

  const table = useReactTable({
    data: longTermGoals,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <main>
      <span className="block h-4" />

      <h1 className="text-3xl font-bold">Rozpočet Srpen - Září 2024</h1>
      <span className="block h-4" />
      <PeriodBudgetTable />

      <h1 className="text-3xl font-bold">Dlouhodobé cíle</h1>
      <span className="block h-4" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <span className="block h-4" />

      <div className="flex flex-row-reverse">
        <Button>
          <IconPlus size={24} />
          Přidat cíl
        </Button>
      </div>
    </main>
  )
}
