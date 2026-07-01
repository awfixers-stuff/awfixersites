import { AuthPanelFeatures } from "@/components/auth/auth-panel-features";
import { AuthPanelHeader } from "@/components/auth/auth-panel-header";
import { AuthPanel, AuthPanelDivider, AuthPanelSection } from "@/components/auth/auth-panel";
import { cn } from "@/lib/utils";

type AuthPanelLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showFeatures?: boolean;
  bodyClassName?: string;
};

export function AuthPanelLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  showFeatures = true,
  bodyClassName,
}: AuthPanelLayoutProps) {
  return (
    <AuthPanel>
      <AuthPanelSection className="pb-8 sm:pb-10">
        <AuthPanelHeader eyebrow={eyebrow} title={title} description={description} />
      </AuthPanelSection>

      <AuthPanelDivider />

      <AuthPanelSection className={cn("space-y-10 py-10 sm:space-y-12 sm:py-12", bodyClassName)}>
        <div className="mx-auto w-full max-w-lg">{children}</div>
        {showFeatures ? <AuthPanelFeatures /> : null}
      </AuthPanelSection>

      {footer ? (
        <>
          <AuthPanelDivider />
          <AuthPanelSection className="py-8 sm:py-10">{footer}</AuthPanelSection>
        </>
      ) : null}
    </AuthPanel>
  );
}
