import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminFooter } from "@/components/layout/admin-footer";
import { SubscriptionBanner } from "./admin/_components/subscription-banner";
import { getSidebarCollapsed } from "../../actions/sidebar.actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = (roleData as { role: string } | null)?.role;

  if (role !== "admin") redirect("/");

  // ⚠️ Lê o cookie ANTES de renderizar (server-side)
  const collapsed = await getSidebarCollapsed();

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AdminSidebar userEmail={user.email ?? ""} defaultCollapsed={collapsed} />

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 md:px-8 pt-6 md:pt-8 empty:hidden">
            <SubscriptionBanner />
          </div>
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}