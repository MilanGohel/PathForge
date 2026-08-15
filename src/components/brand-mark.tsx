import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary font-semibold text-white",
        dim,
        className,
      )}
      aria-hidden
    >
      Pf
    </span>
  );
}
