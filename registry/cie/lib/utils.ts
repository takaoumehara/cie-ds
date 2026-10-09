// Mirrors shadcn's `utils` registry item (installed via registryDependencies: ["utils"]).
// Lives here only so the in-repo preview can resolve `@/lib/utils`.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
