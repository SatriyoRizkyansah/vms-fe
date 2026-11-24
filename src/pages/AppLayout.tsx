import { useEffect, type CSSProperties } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { LoadingLine } from "@/components/vms/primitives";
import use_query from "@/hook/api-use-query";
import { auth_signal, clear_auth, update_auth_user, type AuthUser } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

const routeTitles = [
  { to: "/app", title: "Ringkasan", exact: true },
  { to: "/app/visits", title: "Kunjungan" },
  { to: "/app/devices", title: "Perangkat" },
  { to: "/app/locations", title: "Lokasi" },
  { to: "/app/walk-in", title: "Tamu walk-in" },
  { to: "/app/reports", title: "Laporan" },
  { to: "/app/settings", title: "Pengaturan" },
];

export default function AppLayout() {
  const auth = useSignalValue(auth_signal);
  const location = useLocation();
  const navigate = useNavigate();
  const profileQuery = use_query({
    api_tag: "authentication",
    api_method: "authControllerMe",
    api_query: [],
    should_running_if: Boolean(auth.selectedToken),
    options: { should_disable_error_message: true },
  });
  const profile = profileQuery.response as { id?: string; nip_username?: string; full_name?: string; email?: string; role?: AuthUser["role"] } | null;
  const user = profile
    ? { id: profile.id, name: profile.full_name ?? profile.nip_username ?? "Pengguna VMS", full_name: profile.full_name, nip_username: profile.nip_username, email: profile.email, role: profile.role }
    : auth.user;
  const canSeeSettings = user?.role === "ADMIN" || user?.role === "AUDITOR";

  useEffect(() => {
    if (profile?.full_name) update_auth_user({
      id: profile.id,
      name: profile.full_name,
      full_name: profile.full_name,
      nip_username: profile.nip_username,
      email: profile.email,
      role: profile.role,
    });
  }, [profile?.id, profile?.full_name, profile?.nip_username, profile?.email, profile?.role]);

  if (!auth.selectedToken) return <Navigate to="/login" replace state={{ from: location }} />;

  if (!profile && profileQuery.is_loading) {
    return <main className="grid min-h-screen place-items-center bg-muted px-6"><LoadingLine label="Memeriksa sesi staf…" /></main>;
  }

  if (!profile && profileQuery.error) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted px-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-3 size-8 text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">Sesi tidak dapat diverifikasi</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Pastikan layanan VMS API aktif, lalu masuk kembali.</p>
          <Button className="mt-5" onClick={() => { clear_auth(); navigate("/login", { replace: true }); }}>Kembali ke login</Button>
        </div>
      </main>
    );
  }

  const displayName = user?.full_name ?? user?.name ?? "Pengguna VMS";
  const pageTitle = routeTitles.find(({ to, exact }) => exact ? location.pathname === to : location.pathname.startsWith(to))?.title ?? "Operasional";

  return (
    <SidebarProvider style={{ "--header-height": "3.5rem" } as CSSProperties}>
      <AppSidebar
        user={{ name: displayName, email: user?.email ?? user?.nip_username ?? "", role: user?.role }}
        canSeeSettings={canSeeSettings}
        onLogout={() => { clear_auth(); navigate("/login", { replace: true }); }}
      />
      <SidebarInset>
        <SiteHeader title={pageTitle} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1500px]"><Outlet /></div>
        </main>
        <footer className="px-4 pb-5 text-center text-xs text-muted-foreground sm:px-6">Visitor Management System · LEMIGAS</footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
