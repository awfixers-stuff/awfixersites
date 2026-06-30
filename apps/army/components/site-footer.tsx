import { NavLink } from "./nav-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="stripe-rule-thin" />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted-foreground">
          AWFixer&apos;s Army — legal militia, United States.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs">
          <NavLink
            href="/about"
            className="text-muted-foreground transition-colors hover:text-bleach"
          >
            About
          </NavLink>
          <NavLink
            href="/ranks"
            className="text-muted-foreground transition-colors hover:text-bleach"
          >
            Ranks
          </NavLink>
          <NavLink
            href="/aac"
            className="text-muted-foreground transition-colors hover:text-bleach"
          >
            AAC
          </NavLink>
          <NavLink
            href="/aacj"
            className="text-muted-foreground transition-colors hover:text-bleach"
          >
            AACJ
          </NavLink>
          <NavLink
            href="/enlist"
            className="text-muted-foreground transition-colors hover:text-bleach"
          >
            Enlist
          </NavLink>
        </nav>
      </div>
    </footer>
  );
}
