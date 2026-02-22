import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-[#CC0000] selection:text-white border-[#111111] h-9 w-full min-w-0 rounded-none border bg-[#F9F9F7] px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

/** Underline-only input variant for Newsprint forms (border-b-2, transparent bg, focus #F0F0F0). */
function InputUnderline({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant="underline"
      className={cn(
        "font-mono-data placeholder:text-[#737373] selection:bg-[#CC0000] selection:text-white h-9 w-full min-w-0 rounded-none border-0 border-b-2 border-[#111111] bg-transparent px-3 py-2 text-sm outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input, InputUnderline }
