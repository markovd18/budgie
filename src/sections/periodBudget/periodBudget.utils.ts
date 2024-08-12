export type PeriodBudgetEntry =
  | {
      type: "income"
      name: string
      amount: number
    }
  | {
      type: "expense"
      name: string
      amount: number
    }

export type PeriodBudgetIncome = Extract<PeriodBudgetEntry, { type: "income" }>

export type PeriodBudgetExpense = Extract<PeriodBudgetEntry, { type: "expense" }>
