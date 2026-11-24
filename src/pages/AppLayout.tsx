import { useEffect } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, CalendarDays, FileBarChart2, LogOut, Plus, Settings2, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingLine, VmsMark } from "@/components/vms/primitives";
import use_query from "@/hook/api-use-query";
import { auth_signal, clear_auth, update_auth_user, type AuthUser } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

const navigation = [
  { to: "/app", label: "Ringkasan", icon: Activity, end: true },
  { to: "/app/visits", label: "Kunjungan", icon: CalendarDays },
  { to: "/app/devices", label: "Perangkat", icon: Smartphone },
  { to: "/app/reports", label: "Laporan", icon: FileBarChart2, restricted: true },
  { to: "/app/settings", label: "Pengaturan", icon: Settings2, restricted: true },
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
    return <main className="grid min-h-screen place-items-center bg-slate-50 px-6"><LoadingLine label="Memeriksa sesi staf…" /></main>;
  }

  if (!profile && profileQuery.error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-3 size-8 text-teal-700" />
          <h1 className="text-lg font-semibold text-slate-900">Sesi tidak dapat diverifikasi</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Pastikan layanan VMS API aktif, lalu masuk kembali.</p>
          <Button className="mt-5" onClick={() => { clear_auth(); navigate("/login", { replace: true }); }}>Kembali ke login</Button>
        </div>
      </main>
    );
  }

  const displayName = user?.full_name ?? user?.name ?? "Pengguna VMS";

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
        <Link to="/app" aria-label="LEMIGAS VMS beranda"><VmsMark /></Link>
        <div className="mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">Menu utama</div>
        <nav className="mt-3 grid gap-1" aria-label="Navigasi utama">
          {navigation.filter((item) => !item.restricted || canSeeSettings).map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <Icon className="size-[17px] shrink-0" strokeWidth={1.8} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" /><span className="relative size-2 rounded-full bg-emerald-500" /></span>Portal operasional</div>
          <p className="mt-2 text-xs leading-5 text-slate-500">Kelola persetujuan, akses tamu, dan perangkat ruangan.</p>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex items-center gap-3 lg:hidden"><Link to="/app"><VmsMark /></Link></div>
          <div className="hidden text-sm text-slate-500 lg:block">Ruang Telematika <span className="mx-2 text-slate-300">/</span> Operasional</div>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            {user?.role !== "AUDITOR" && <Link to="/app/walk-in" className="hidden sm:block"><Button size="sm" className="gap-2"><Plus className="size-4" />Tamu walk-in</Button></Link>}
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800"><UserRound className="size-4" /></div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-40 truncate text-sm font-medium text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500">{user?.role ?? "Staf"}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Keluar" title="Keluar" onClick={() => { clear_auth(); navigate("/login", { replace: true }); }}><LogOut className="size-4" /></Button>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Navigasi utama">
            {navigation.filter((item) => !item.restricted || canSeeSettings).map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ${isActive ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50"}`}><Icon className="size-3.5" />{label}</NavLink>
            ))}
          </nav>
        </div>

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9"><Outlet /></main>
        <footer className="px-4 pb-7 pt-1 text-center text-xs text-slate-400 sm:px-7 lg:px-9">Visitor Management System · LEMIGAS</footer>
      </div>
    </div>
  );
}
