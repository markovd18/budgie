import { Maybe } from "./types"
import { KeyboardEvent as ReactKeyboardEvent } from "react"

export const TagNames = {
  Tr: "TR",
} as const

export type Tag = keyof typeof TagNames

// @ts-expect-error nejakej divnej mapping
export function isTableRowElement<TElement extends Element>(element?: Maybe<TElement>): element is HTMLTableRowElement {
  return element?.tagName === TagNames.Tr && element instanceof HTMLTableRowElement
}

export function isModifierPressed(event: KeyboardEvent | ReactKeyboardEvent) {
  return event.shiftKey || event.altKey || event.ctrlKey
}
