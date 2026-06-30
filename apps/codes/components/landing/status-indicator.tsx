import { STATUS_PAGE_URL, type OverallStatus } from "@/lib/status";

interface StatusConfig {
  label: string;
  shortLabel: string;
  dotColor: string;
  textColor: string;
}

const statusConfig: Record<OverallStatus, StatusConfig> = {
  operational: {
    label: "All systems operational",
    shortLabel: "All operational",
    dotColor: "bg-green-500",
    textColor: "text-green-400",
  },
  degraded: {
    label: "Degraded performance",
    shortLabel: "Degraded",
    dotColor: "bg-yellow-500",
    textColor: "text-yellow-400",
  },
  partial_outage: {
    label: "Partial outage",
    shortLabel: "Partial outage",
    dotColor: "bg-orange-500",
    textColor: "text-orange-400",
  },
  major_outage: {
    label: "Major outage",
    shortLabel: "Major outage",
    dotColor: "bg-red-500",
    textColor: "text-red-400",
  },
  maintenance: {
    label: "Under maintenance",
    shortLabel: "Maintenance",
    dotColor: "bg-amber-500",
    textColor: "text-amber-400",
  },
  unknown: {
    label: "Status unavailable",
    shortLabel: "Unavailable",
    dotColor: "bg-gray-500",
    textColor: "text-gray-400",
  },
};

type Variant = "full" | "short";

interface StatusIndicatorProps {
  status: OverallStatus;
  variant?: Variant;
  className?: string;
}

export function StatusIndicator({
  status,
  variant = "full",
  className = "",
}: StatusIndicatorProps) {
  const config = statusConfig[status] ?? statusConfig.operational;
  const label = variant === "short" ? config.shortLabel : config.label;

  return (
    <a
      href={STATUS_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {label}
    </a>
  );
}
