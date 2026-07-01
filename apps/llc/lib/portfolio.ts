import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Church,
  Cloud,
  Globe,
  GraduationCap,
  Heart,
  Newspaper,
  ShieldCheck,
  Sparkles,
  UserCircle,
} from "lucide-react";

export type PortfolioCompany = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Shown on the dedicated portfolio page */
  role?: string;
  external?: boolean;
};

const X_AWFIXERS = "https://x.com/awfixers";

export const AWFIXER_X_URL = X_AWFIXERS;

/** Entities stewarded under AWFixer LLC oversight */
export const portfolioCompanies: PortfolioCompany[] = [
  {
    name: "AWFixer's Church",
    description:
      "The spiritual and intellectual center — a church built on a question, not a creed.",
    role: "501(c)(3) nonprofit · Mission anchor",
    href: "https://awfixer.church",
    icon: Church,
    external: true,
  },
  {
    name: "AWFixer Army",
    description: "Disciplined action in the field — enlistment, training, and service.",
    role: "Operational arm · Principle in motion",
    href: "https://awfixer.army",
    icon: ShieldCheck,
    external: true,
  },
  {
    name: "AWFixer Codes",
    description: "The platform layer for teams who ship — build, deploy, and scale.",
    role: "Technology · Product velocity",
    href: "https://awfixer.codes",
    icon: Sparkles,
    external: true,
  },
  {
    name: "AWFixer Cloud",
    description: "Infrastructure and services that keep the ecosystem running at scale.",
    role: "Infrastructure",
    href: "https://awfixer.cloud",
    icon: Cloud,
    external: true,
  },
  {
    name: "AWFixer Network",
    description: "Connectivity and presence across the AWFixer property graph.",
    role: "Network · Distribution",
    href: "https://awfixer.network",
    icon: Globe,
    external: true,
  },
  {
    name: "AWFixer News",
    description: "Signal from the ecosystem — updates, context, and narrative.",
    role: "Media",
    href: "https://awfixer.news",
    icon: Newspaper,
    external: true,
  },
  {
    name: "AWFixer Academy",
    description: "Education and training — equipping minds to think clearly and build.",
    role: "Education",
    href: "https://awfixer.church/careers",
    icon: GraduationCap,
    external: true,
  },
  {
    name: "AWFixer Cash",
    description: "Financial rails and treasury operations for church-owned commerce.",
    role: "Finance",
    href: "https://awfixer.cash",
    icon: Building2,
    external: true,
  },
  {
    name: "AWFixer Space",
    description: "Programs and properties oriented toward long-horizon mission work.",
    role: "Programs",
    href: "https://awfixer.space",
    icon: Heart,
    external: true,
  },
  {
    name: "awfixer.me",
    description: "Personal presence and identity layer within the network.",
    role: "Identity",
    href: "https://awfixer.me",
    icon: UserCircle,
    external: true,
  },
  {
    name: "Church-owned ventures",
    description:
      "Additional businesses and initiatives held in stewardship under the same oversight fabric.",
    role: "Portfolio · Inquiries",
    href: "mailto:developers@awfixer.llc",
    icon: Building2,
    external: false,
  },
];