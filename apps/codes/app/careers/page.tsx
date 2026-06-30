import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { StatusIndicator } from "@/components/landing/status-indicator";
import { fetchSystemStatus } from "@/lib/status";
import CareersContent from "./content";

export default async function CareersPage() {
  const status = await fetchSystemStatus();

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <article className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <CareersContent />
      </article>
      <FooterSection statusIndicator={<StatusIndicator status={status} />} />
    </main>
  );
}

export async function generateStaticParams() {
  return [{}];
}
