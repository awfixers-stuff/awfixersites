import type { Metadata } from "next";
import { CLink as Link } from "@awfixersites/telemetry/link";
import { ArrowUpRight, FileText, Scale, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "AWFixer Legal",
  description:
    "Canonical privacy, terms, and legal disclosures for AWFixer properties at legal.awfixer.llc.",
};

const documents = [
  {
    href: "/privacy",
    title: "Privacy Policy",
    description: "Collection, use, retention, and your rights across AWFixer sites.",
    icon: Shield,
  },
  {
    href: "/terms",
    title: "Terms of Service",
    description: "Acceptable use, IP, liability, and governing law for our web properties.",
    icon: Scale,
  },
  {
    href: "/legal",
    title: "Nonprofit & legal",
    description: "501(c)(3) status, allied organizations, and use of funds.",
    icon: FileText,
  },
] as const;

export default function LegalHomePage() {
  return (
    <>
      <section className="relative px-6 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="relative z-10 mx-auto max-w-[900px] text-center">
          <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
            legal.awfixer.llc
          </p>
          <h1 className="font-display text-4xl leading-[1.05] text-off-white sm:text-5xl lg:text-6xl">
            Policies &amp; disclosures
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            One place for privacy, terms, and nonprofit legal information. Other AWFixer apps
            redirect here for these paths.
          </p>
        </div>
      </section>

      <section className="section-auto px-6 pb-28 lg:pb-36">
        <ul className="mx-auto grid max-w-[900px] gap-4">
          {documents.map((doc) => (
            <li key={doc.href}>
              <Link
                href={doc.href}
                className="panel-steel group flex items-start gap-5 rounded-lg p-6 transition-colors hover:border-steel-bright/30"
              >
                <doc.icon className="mt-1 h-5 w-5 shrink-0 text-steel-bright" aria-hidden />
                <div className="min-w-0 flex-1 text-left">
                  <span className="font-display text-xl text-off-white group-hover:text-steel-bright">
                    {doc.title}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {doc.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-off-white" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-12 max-w-[900px] text-center font-mono text-[10px] tracking-wider text-muted-foreground/80 uppercase">
          Questions ·{" "}
          <a href="mailto:legal@awfixer.me" className="text-off-white hover:text-steel-bright">
            legal@awfixer.me
          </a>
        </p>
      </section>
    </>
  );
}
