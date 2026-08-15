import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "accent",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "accent" | "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "accent" && "bg-primary-soft text-primary-soft-fg",
        variant === "neutral" && "bg-muted-bg text-foreground/80",
        variant === "success" && "bg-success-bg text-success-fg",
        variant === "warning" && "bg-warning-bg text-warning-fg",
        className,
      )}
      {...props}
    />
  );
}
