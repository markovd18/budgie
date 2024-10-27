export type PeriodBudgetEntry =
  | {
      type: "income"
      id: string
      name: string
      amount: number
    }
  | {
      id: string
      type: "expense"
      name: string
      amount: number
    }

export type PeriodBudgetIncome = Extract<PeriodBudgetEntry, { type: "income" }>

export type PeriodBudgetExpense = Extract<PeriodBudgetEntry, { type: "expense" }>
