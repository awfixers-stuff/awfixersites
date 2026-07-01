import { cn } from "@/lib/utils";

type AuthPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthPanel({ children, className }: AuthPanelProps) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl rounded-2xl border border-glass-border bg-glass backdrop-blur-sm",
        "container-glow shadow-lg shadow-black/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AuthPanelSectionProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthPanelSection({ children, className }: AuthPanelSectionProps) {
  return <div className={cn("px-8 py-10 sm:px-12 sm:py-12", className)}>{children}</div>;
}

export function AuthPanelDivider() {
  return <div className="border-t border-glass-border" aria-hidden />;
}
