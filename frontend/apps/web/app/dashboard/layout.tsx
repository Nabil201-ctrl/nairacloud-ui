import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { DashboardShell } from "@/components/dashboard-shell";
import { SupportFab } from "@/components/support-fab";
import { AiChatBubble } from "@/components/ai-chat-bubble";
import { LiveChatWidget } from "@nairacloud/ui";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: { default: "Dashboard · NairaCloud", template: "%s · NairaCloud" } };

/**
 * Fail-closed gates (middleware only sees session presence):
 * no cookie -> /login, PENDING_VERIFICATION -> /verify-email,
 * verified but not onboarded -> /onboarding.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!cookies().get("nc_access")) redirect("/login");
  if (!user) return <DashboardShell name={null}>{children}</DashboardShell>;
  if (user.status === "PENDING_VERIFICATION") redirect("/verify-email");
  if (user.status !== "ACTIVE") redirect("/login");
  if (!cookies().get("nc_onboarded") && user.role === "CUSTOMER") redirect("/onboarding");
  return (
    <DashboardShell name={user.name} email={user.email}>
      {children}
      <SupportFab />
      <AiChatBubble email={user.email} name={user.name} />
      <LiveChatWidget />
    </DashboardShell>
  );
}
