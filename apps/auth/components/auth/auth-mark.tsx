import { cn } from "@/lib/utils";

export function AuthMark({ className }: { className?: string }) {
  return (
    <div
      className={cn("grid grid-cols-3 grid-rows-3 gap-1 text-foreground/80", className)}
      aria-hidden
    >
      <span className="col-start-2 row-start-1 rounded-sm bg-current" />
      <span className="col-span-3 row-start-2 rounded-sm bg-current/70" />
      <span className="col-span-3 row-start-3 rounded-sm bg-current/40" />
    </div>
  );
}
