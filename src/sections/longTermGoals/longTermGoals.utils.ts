export type LongTermGoal = {
  name: string
  amount: number
}

const data: LongTermGoal[] = [
  {
    name: "Rezerva",
    amount: 50_000,
  },
  { name: "Postel", amount: 15_000 },
  { name: "Macbook", amount: 80_000 },
]

export function useLongTermGoals() {
  return data
}
