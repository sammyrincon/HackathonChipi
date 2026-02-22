import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium uppercase tracking-widest transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 aria-invalid:border-destructive min-h-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-[#111111] text-[#F9F9F7] border-[#111111] hover:bg-white hover:text-[#111111] hover:border-[#111111] hover:shadow-[4px_4px_0px_0px_#111111]",
        accent:
          "bg-[#CC0000] text-white border-[#111111] hover:shadow-[4px_4px_0px_0px_#111111]",
        destructive:
          "bg-destructive text-white border-[#111111] hover:shadow-[4px_4px_0px_0px_#111111]",
        outline:
          "border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] hover:shadow-[4px_4px_0px_0px_#111111]",
        secondary:
          "bg-muted text-muted-foreground border-[#111111] hover:shadow-[4px_4px_0px_0px_#111111]",
        ghost:
          "border-transparent hover:bg-[#E5E5E0] hover:text-[#111111]",
        link:
          "text-[#111111] underline-offset-4 decoration-2 decoration-[#CC0000] hover:underline border-transparent min-h-0 min-w-0 tracking-normal normal-case",
      },
      size: {
        default: "h-9 min-h-[44px] px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 min-h-[44px] gap-1 rounded-none px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 min-h-[44px] rounded-none gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-none px-6 has-[>svg]:px-4",
        icon: "size-9 min-h-[44px] min-w-[44px]",
        "icon-xs": "size-6 min-h-[44px] min-w-[44px] rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 min-h-[44px] min-w-[44px]",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
