import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-fredoka font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-goal-primary text-goal-heading hover:bg-goal-primary/90 hover:scale-105 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline:
          "border-2 border-goal-border bg-background text-goal-text-primary hover:bg-goal-accent hover:text-goal-heading hover:border-goal-primary",
        secondary:
          "bg-goal-accent text-goal-text-primary hover:bg-goal-accent/80 hover:text-goal-heading",
        ghost: "text-goal-text-primary hover:bg-goal-accent hover:text-goal-heading",
        link: "text-goal-text-primary underline-offset-4 hover:underline hover:text-goal-heading",
        goal: "bg-gradient-to-r from-goal-primary to-goal-accent text-goal-heading hover:from-goal-primary/90 hover:to-goal-accent/90 hover:scale-105 shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
