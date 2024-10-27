export function round(num: number, decimalSpaces = 2) {
  const multiplier = Math.pow(10, decimalSpaces)
  return Math.round((num + Number.EPSILON) * multiplier) / multiplier
}
