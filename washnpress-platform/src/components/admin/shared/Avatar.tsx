import { cn } from "@/lib/utils/cn";

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
