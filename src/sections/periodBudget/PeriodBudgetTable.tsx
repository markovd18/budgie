"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog"
import { Button } from "@/components/ui/Button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/Form"
import { Input } from "@/components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { isModifierPressed, isTableRowElement } from "@/utils/dom"
import { round } from "@/utils/number"
import { isNotNil } from "@/utils/typeguards"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react"
import { ColumnDef, flexRender, getCoreRowModel, Table as TableType, useReactTable } from "@tanstack/react-table"
import {
  PropsWithChildren,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PeriodBudgetEntry } from "./periodBudget.utils"

function Cell(props: PropsWithChildren) {
  return <div className="text-right font-medium">{props.children}</div>
}

const formSchema = z.object({
  name: z.string().min(1, "Zadejte alespoň 1 znak.").max(100, "Zadejte nejvýše 100 znaků."),
  amount: z.number({ errorMap: () => ({ message: "Zadejte kladné číslo." }) }).min(0, "Částka musí být kladná."),
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

  function keyDownHandler<TElement extends Element>(e: ReactKeyboardEvent<TElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      form.handleSubmit(handleSubmit)()
      return
    }
  }

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
    <Form {...form}>
      <TableRow>
        <TableCell className="w-[40%] [word-wrap:break-word]">
          <Cell>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="např. Potraviny"
                      autoFocus={true}
                      onKeyDown={keyDownHandler}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Cell>
        </TableCell>
        <TableCell className="w-[40%] [word-wrap:break-word]">
          <Cell>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="např. 1200"
                      step={1}
                      required
                      onKeyDown={keyDownHandler}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.length === 0 ? "" : round(Number(e.target.value), 2)
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Cell>
        </TableCell>
        <TableCell>
          <Cell>
            <Button variant="ghost" type="submit" onClick={handleSubmit}>
              <IconCheck size={16} className="text-emerald-600" />
            </Button>
            <Button variant="ghost" type="button" onClick={onCancel}>
              <IconTrash size={16} className="text-red-500" />
            </Button>
          </Cell>
        </TableCell>
      </TableRow>
    </Form>
  )
}

const data: PeriodBudgetEntry[] = [
  {
    id: "vyplata",
    name: "Výplata",
    amount: 40000,
    type: "income",
  },
  {
    id: "najem",
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
    getRowId: (row) => row.id,
  })

  function handleEntryAdd(entry: FormValues) {
    setTableData((prev) => [...prev, { ...entry, id: entry.name.toLowerCase(), type: "expense" }])
  }

  function handleEntryDelete(id: string) {
    setTableData((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <PeriodBudgetTableInner
      table={budgetTable}
      columns={budgetColumns}
      onEntryAdd={handleEntryAdd}
      onEntryDelete={handleEntryDelete}
    />
  )
}

type PeriodBudgetTableInnerProps = {
  table: TableType<PeriodBudgetEntry>
  columns: ColumnDef<PeriodBudgetEntry>[]
  onEntryAdd?: (entry: FormValues) => void
  onEntryDelete?: (id: string) => void
}

function PeriodBudgetTableInner(props: PeriodBudgetTableInnerProps) {
  const { table, columns, onEntryAdd, onEntryDelete } = props
  const [editing, setEditing] = useState(false)
  const [rowIdToDelete, setRowIdToDelete] = useState<string | null>(null)

  const rowToDelete = isNotNil(rowIdToDelete) ? table.getRow(rowIdToDelete).original : null

  const keyDownHandler = useCallback(
    (e: KeyboardEvent) => {
      if (isModifierPressed(e)) {
        return
      }

      if (e.key === "a" && !editing) {
        e.preventDefault()
        setEditing(true)
        return
      }

      if (e.key === "Escape") {
        setEditing(false)
        return
      }

      if (e.key === "ArrowDown" || e.key === "j") {
        const activeElement = document.activeElement
        if (!activeElement) {
          // TODO nemam nic aktivniho - zafocusovat prvni radek
          return
        }

        if (!isTableRowElement(activeElement)) {
          return
        }

        const nextRow = activeElement.nextElementSibling
        if (!isTableRowElement(nextRow)) {
          return
        }

        nextRow.focus()
        return
      }

      if (e.key === "ArrowUp" || e.key === "k") {
        const activeElement = document.activeElement
        if (!activeElement) {
          // TODO nemam nic aktivniho - zafocusovat prvni radek
          return
        }

        if (!isTableRowElement(activeElement)) {
          return
        }

        const previousRow = activeElement.previousElementSibling
        if (!isTableRowElement(previousRow)) {
          return
        }

        previousRow.focus()
      }
    },
    [editing],
  )

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler)
    return () => {
      document.removeEventListener("keydown", keyDownHandler)
    }
  }, [keyDownHandler])

  function handleSubmit(values: FormValues) {
    onEntryAdd?.(values)
    setEditing(false)
  }

  return (
    <>
      <AlertDialog
        open={isNotNil(rowToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setRowIdToDelete(null)
          }
        }}
      >
        {/* TODO nejak se tam dela obrovskej padding kdyz se to otevre a nevim proc */}
        <AlertDialogTrigger className="hidden invisible" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete smazat položku?</AlertDialogTitle>
            <AlertDialogDescription>Pokud položku smažete, bude nenávratně ztracena.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onEntryDelete?.(rowIdToDelete ?? "")}>
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="w-[40%]">
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
                {table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    id={row.id}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    tabIndex={i + 1}
                    onKeyDown={(e) => {
                      if (isModifierPressed(e)) {
                        return
                      }

                      if (e.key === "Delete" || e.key === "d") {
                        setRowIdToDelete(row.id)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="w-[40%] [word-wrap:break-word]" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
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
