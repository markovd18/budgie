import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// TODO remove
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
