import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          AWFixer Account
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/apps" className="text-muted-foreground hover:text-foreground">
            Apps
          </Link>
          <Link href="/sessions" className="text-muted-foreground hover:text-foreground">
            Sessions
          </Link>
          <a
            href="https://auth.awfixer.me/settings"
            className="text-muted-foreground hover:text-foreground"
          >
            Security
          </a>
          <Link href="/admin" className="text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}