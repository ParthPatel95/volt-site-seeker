import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: 
          "text-foreground border-border",
        // Data/status variants
        success:
          "border-transparent bg-data-positive/15 text-data-positive",
        warning:
          "border-transparent bg-data-warning/15 text-data-warning",
        error:
          "border-transparent bg-data-negative/15 text-data-negative",
        info:
          "border-transparent bg-primary/10 text-primary",
        // Muted variants
        muted:
          "border-transparent bg-muted text-muted-foreground",
        // Dot indicator variants
        "dot-success":
          "border-border bg-transparent text-foreground pl-4 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-data-positive",
        "dot-warning":
          "border-border bg-transparent text-foreground pl-4 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-data-warning",
        "dot-error":
          "border-border bg-transparent text-foreground pl-4 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-data-negative",
        "dot-neutral":
          "border-border bg-transparent text-foreground pl-4 relative before:absolute before:left-1.5 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-data-neutral",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-1.5 py-0 text-[10px]",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
