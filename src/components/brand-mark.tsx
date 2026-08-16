import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { className: "h-5 w-5", px: 20 },
  md: { className: "h-7 w-7", px: 28 },
  lg: { className: "h-10 w-10", px: 40 },
} as const;

export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: keyof typeof SIZES;
}) {
  const dim = SIZES[size];
  return (
    <Image
      src="/pathforge-mark.png"
      alt=""
      width={dim.px}
      height={dim.px}
      className={cn(dim.className, "shrink-0", className)}
      aria-hidden
      priority={size !== "sm"}
    />
  );
}
