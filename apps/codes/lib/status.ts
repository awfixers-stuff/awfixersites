const STATUS_FEED_URL = "https://status.awfixer.codes/feed/json";

export type OverallStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "unknown";

interface Maintenance {
  id: number;
  name: string;
  message: string;
  from: string;
  to: string;
  updatedAt: string;
  monitors: unknown[];
  pageComponents: unknown[];
}

interface StatusFeed {
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  monitors: unknown[];
  pageComponents: unknown[];
  pageComponentGroups: unknown[];
  maintenances: Maintenance[];
  statusReports: unknown[];
}

export const STATUS_PAGE_URL = "https://status.awfixer.codes/";

export async function fetchSystemStatus(): Promise<OverallStatus> {
  try {
    const res = await fetch(STATUS_FEED_URL, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return "unknown";

    const data: StatusFeed = await res.json();

    // Active incidents take priority
    if (data.statusReports && data.statusReports.length > 0) {
      return "degraded";
    }

    // Currently active scheduled maintenance
    const now = new Date();
    const activeMaintenance = data.maintenances?.some((m) => {
      const from = new Date(m.from);
      const to = new Date(m.to);
      return now >= from && now <= to;
    });
    if (activeMaintenance) {
      return "maintenance";
    }

    if (data.status === "success") {
      return "operational";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
