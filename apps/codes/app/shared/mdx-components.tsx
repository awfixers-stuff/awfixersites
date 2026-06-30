import React from "react";

// ─── StatCard ─────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  trend?: "up" | "down";
}

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {trend && (
        <div className={`text-xs mt-2 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          {trend === "up" ? "\u2191" : "\u2193"} Industry average
        </div>
      )}
    </div>
  );
}

// ─── SecurityFeature ──────────────────────────────────────

interface SecurityFeatureProps {
  title: string;
  icon: React.ReactNode;
  status?: "implemented" | "in-progress" | "planned";
  children?: React.ReactNode;
}

export function SecurityFeature({
  title,
  icon,
  status = "implemented",
  children,
}: SecurityFeatureProps) {
  const statusColors = {
    implemented: "bg-green-500/20 text-green-400",
    "in-progress": "bg-blue-500/20 text-blue-400",
    planned: "bg-muted text-muted-foreground",
  };

  const statusLabels = {
    implemented: "Implemented",
    "in-progress": "In Progress",
    planned: "Planned",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-foreground">{title}</h4>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status]}`}
            >
              {statusLabels[status]}
            </span>
          </div>
          {children && <div className="text-sm text-muted-foreground">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── ComplianceBadge ──────────────────────────────────────

interface ComplianceBadgeProps {
  standard: string;
  description: string;
  certified?: boolean;
}

export function ComplianceBadge({ standard, description, certified = true }: ComplianceBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${certified ? "bg-green-500/20" : "bg-muted"}`}
      >
        {certified ? (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
      </div>
      <div>
        <div className="font-semibold text-foreground">{standard}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

// ─── ThreatModel ──────────────────────────────────────────

interface ThreatModelProps {
  threat: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string;
}

export function ThreatModel({ threat, likelihood, impact, mitigation }: ThreatModelProps) {
  const likelihoodColors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
  };

  const impactColors = {
    low: "border-green-500/30",
    medium: "border-yellow-500/30",
    high: "border-red-500/30",
  };

  return (
    <div className={`rounded-lg border p-4 ${impactColors[impact]} bg-card/50`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <h4 className="font-semibold text-foreground">{threat}</h4>
        <div className="flex gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded ${likelihoodColors[likelihood]}`}
          >
            Likelihood: {likelihood}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded border ${impactColors[impact]}`}
          >
            Impact: {impact}
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <strong className="text-foreground">Mitigation:</strong> {mitigation}
      </div>
    </div>
  );
}

// ─── ArchitectureLayer ────────────────────────────────────

interface ArchitectureLayerProps {
  name: string;
  description: string;
  technologies: string[];
  securityControls: string[];
}

export function ArchitectureLayer({
  name,
  description,
  technologies,
  securityControls,
}: ArchitectureLayerProps) {
  return (
    <div className="relative pl-8 pb-8 border-l-2 border-primary/20 ml-4">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="text-lg font-semibold text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>

        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Technologies</div>
          <div className="flex flex-wrap gap-1">
            {technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">Security Controls</div>
          <ul className="text-sm space-y-1">
            {securityControls.map((control, idx) => (
              <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                <svg
                  className="w-3 h-3 text-green-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {control}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-16">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>{title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8">{title}</h2>
      {children}
    </div>
  );
}

// ─── ContactCard ──────────────────────────────────────────

interface ContactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}

export function ContactCard({ icon, label, value, href }: ContactCardProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow hover:border-primary/30"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-foreground">{label}</div>
        <div className="text-sm text-muted-foreground">{value}</div>
      </div>
    </a>
  );
}
