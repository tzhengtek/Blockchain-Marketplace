import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-magenta-600 text-white hover:shadow-lg hover:shadow-primary/60 active:scale-95 font-bold",
        destructive:
          "bg-destructive text-white hover:bg-red-600 hover:shadow-lg hover:shadow-destructive/60 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 active:scale-95 font-bold",
        outline:
          "border-2 border-primary/60 bg-gradient-to-b from-white/8 to-white/5 text-foreground hover:border-primary hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/40 dark:hover:shadow-lg dark:hover:shadow-primary/40 active:scale-95 font-semibold",
        secondary:
          "bg-gradient-to-r from-secondary to-blue-600 text-white hover:shadow-lg hover:shadow-secondary/60 active:scale-95 font-bold",
        ghost:
          "text-foreground hover:bg-white/15 hover:text-foreground dark:hover:shadow-lg dark:hover:shadow-primary/30 active:scale-95 font-semibold",
        link: "text-primary underline-offset-4 hover:underline hover:text-magenta-400 font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-11 rounded-lg px-6 has-[>svg]:px-4 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
