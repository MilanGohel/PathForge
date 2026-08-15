import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * All variants share the same box model:
 * - fixed height via size
 * - 1px border (transparent on solid fills) so primary ≠ taller than outline
 * - box-border so border is inside h-*
 */
const buttonVariants = cva(
  "inline-flex box-border items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Transparent border keeps outer size identical to outline/secondary
        default:
          "border-transparent bg-primary text-white shadow-sm hover:bg-primary-hover hover:text-white",
        secondary:
          "border-border bg-muted-bg text-foreground hover:bg-border/60",
        outline:
          "border-border bg-card text-foreground shadow-sm hover:bg-muted-bg",
        ghost:
          "border-transparent text-foreground shadow-none hover:bg-muted-bg",
        danger:
          "border-transparent bg-danger text-white shadow-sm hover:opacity-90 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
