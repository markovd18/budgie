import { ColumnDef, flexRender, getCoreRowModel, Table as TableType, useReactTable } from "@tanstack/react-table"
import { PeriodBudgetEntry } from "./periodBudget.utils"
import { PropsWithChildren, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { IconCheck, IconPlus, IconTrash, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

function Cell(props: PropsWithChildren) {
  return <div className="text-right font-medium">{props.children}</div>
}

const formSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

type NewEntryRowProps = {
  onCancel?: () => void
  onSubmit?: (values: FormValues) => void
}

function NewEntryRow(props: NewEntryRowProps) {
  const { onCancel, onSubmit } = props

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      amount: 100,
    },
  })

  async function handleSubmit() {
    // manually triggering validation since we cannot have a form element in table
    const values = form.getValues()
    const isValid = await form.trigger()
    if (!isValid) {
      return
    }

    onSubmit?.(values)
  }

  return (
    <TableRow>
      <TableCell>
        <Cell>
          <Input type="text" placeholder="název" autoFocus={true} required {...form.register("name")} />
        </Cell>
      </TableCell>
      <TableCell>
        <Cell>
          <Input type="number" placeholder="částka" step={0.01} required {...form.register("amount")} />
        </Cell>
      </TableCell>
      <TableCell>
        <Cell>
          <Button variant="ghost" type="button" onClick={handleSubmit}>
            <IconCheck size={16} className="text-emerald-600" />
          </Button>
          <Button variant="ghost" type="button" onClick={onCancel}>
            <IconTrash size={16} className="text-red-500" />
          </Button>
        </Cell>
      </TableCell>
    </TableRow>
  )
}

const data: PeriodBudgetEntry[] = [
  {
    name: "Výplata",
    amount: 40000,
    type: "income",
  },
  {
    name: "Nájem",
    amount: 17000,
    type: "expense",
  },
]

export function PeriodBudgetTable() {
  const [tableData, setTableData] = useState(data)
  const budgetColumns: ColumnDef<PeriodBudgetEntry>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => <div className="text-right font-medium">Položka</div>,
        cell: ({ row }) => {
          return <Cell>{row.getValue("name")}</Cell>
        },
      },
      {
        accessorKey: "amount",
        header: () => <Cell>Částka</Cell>,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"))
          const formatted = new Intl.NumberFormat("cs-CZ", {
            style: "currency",
            currency: "CZK",
          }).format(amount)

          return <Cell>{formatted}</Cell>
        },
      },
      {
        id: "actions",
        cell: () => {
          return <Cell />
        },
      },
    ],
    [],
  )

  const budgetTable = useReactTable({
    data: tableData,
    columns: budgetColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleEntryAdd(entry: FormValues) {
    setTableData((prev) => [...prev, { ...entry, type: "expense" }])
  }

  return <PeriodBudgetTableInner table={budgetTable} columns={budgetColumns} onEntryAdd={handleEntryAdd} />
}

type PeriodBudgetTableInnerProps = {
  table: TableType<PeriodBudgetEntry>
  columns: ColumnDef<PeriodBudgetEntry>[]
  onEntryAdd?: (entry: FormValues) => void
}

function PeriodBudgetTableInner(props: PeriodBudgetTableInnerProps) {
  const { table, columns, onEntryAdd } = props
  const [editing, setEditing] = useState(false)

  function handleSubmit(values: FormValues) {
    onEntryAdd?.(values)
    setEditing(false)
  }

  return (
    <>
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
            {table.getRowModel().rows?.length || editing ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
                {editing && <NewEntryRow onCancel={() => setEditing(false)} onSubmit={handleSubmit} />}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Žádné položky. Přidat +.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <span className="block h-4" />

      <div className="flex flex-row-reverse">
        <Button disabled={editing} onClick={() => setEditing(true)}>
          <IconPlus size={24} />
          Přidat položku
        </Button>
      </div>
    </>
  )
}
