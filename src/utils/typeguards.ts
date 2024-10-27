import { Maybe } from "./types"

export function isNotNil<T>(value?: Maybe<T>): value is NonNullable<T> {
  return value !== undefined && value !== null
}
