import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, BatteryWarning, CalendarCheck2, CalendarClock, Clock3, Plus, ShieldAlert, Smartphone, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, Panel } from "@/components/vms/primitives";
import { VisitTable } from "@/components/vms/VisitTable";
import use_query from "@/hook/api-use-query";
import { getJakartaDayRange, type VisitListResponse, type VisitRecord } from "@/utils/vms";
import VisitDetailsPanel from "@/components/vms/VisitDetailsPanel";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

type DeviceRecord = { id: string; room_name: string; connection_status: string; battery_level?: number | null; is_active: boolean };

export default function DashboardPage() {
  const auth = useSignalValue(auth_signal);
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  const visitsQuery = use_query({ api_tag: "visits", api_method: "visitsControllerFindAll", api_query: [{ page: 1, limit: 100 } as never] });
  const pendingQuery = use_query({ api_tag: "visits", api_method: "visitsControllerFindAll", api_query: [{ page: 1, limit: 1, status: "PENDING_APPROVAL" } as never] });
  const devicesQuery = use_query({ api_tag: "roomDevices", api_method: "devicesControllerFindAll", api_query: [] });
  const visitResult = visitsQuery.response as VisitListResponse | null;
  const visits = visitResult?.data ?? [];
  const pendingResult = pendingQuery.response as VisitListResponse | null;
  const devices = (devicesQuery.response as DeviceRecord[] | null) ?? [];
  const pendingCount = pendingResult?.pagination.total ?? visits.filter((visit) => visit.status === "PENDING_APPROVAL").length;
  const dayRange = getJakartaDayRange();
  const todayVisits = visits.filter((visit) => {
    const start = new Date(visit.scheduled_start);
    return start >= dayRange.start && start <= dayRange.end;
  });
  const activeAccess = visits.filter((visit) => ["PROVISIONED", "OFFLINE_FALLBACK", "CHECKED_IN"].includes(visit.status)).length;
  const onlineDevices = devices.filter((device) => device.is_active && device.connection_status?.toLowerCase() === "online").length;
  const lowBattery = devices.filter((device) => device.is_active && device.battery_level != null && device.battery_level < 20);
  const recentVisits = [...visits].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6);

  return (
    <>
      <PageHeading
        eyebrow="Portal operasional"
        title="Ringkasan kunjungan"
        description="Pantau permohonan, akses tamu, dan kondisi perangkat Ruang Telematika."
        action={auth.user?.role !== "AUDITOR" ? <Link to="/app/walk-in"><Button className="gap-2"><Plus className="size-4" />Daftarkan tamu</Button></Link> : undefined}
      />

      {lowBattery.length > 0 && <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5"><BatteryWarning className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><p className="text-sm font-semibold text-amber-900">Periksa baterai smart lock</p><p className="mt-1 text-sm text-amber-800">{lowBattery.map((device) => `${device.room_name} (${device.battery_level}%)`).join(" · ")}</p></div><Link to="/app/devices" className="ml-auto hidden text-sm font-medium text-amber-900 underline decoration-amber-300 underline-offset-4 sm:block">Lihat perangkat</Link></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Menunggu persetujuan" value={pendingQuery.is_loading && !pendingResult ? "—" : pendingCount.toLocaleString("id-ID")} caption="Perlu ditinjau PIC" icon={<Clock3 className="size-[18px]" />} tone="amber" />
        <MetricCard label="Jadwal hari ini" value={visitsQuery.is_loading && !visitResult ? "—" : todayVisits.length.toLocaleString("id-ID")} caption={visitResult && visitResult.pagination.total > 100 ? "Dari 100 kunjungan terbaru" : "Kunjungan terjadwal"} icon={<CalendarCheck2 className="size-[18px]" />} tone="teal" />
        <MetricCard label="Akses aktif" value={visitsQuery.is_loading && !visitResult ? "—" : activeAccess.toLocaleString("id-ID")} caption="PIN aktif atau tamu check-in" icon={<ShieldAlert className="size-[18px]" />} tone="blue" />
        <MetricCard label="Smart lock online" value={devicesQuery.is_loading && !devicesQuery.response ? "—" : `${onlineDevices}/${devices.length}`} caption="Perangkat aktif terhubung" icon={<Smartphone className="size-[18px]" />} tone="green" />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-sm font-semibold text-slate-900">Kunjungan terbaru</h2><p className="mt-1 text-xs text-slate-500">Permohonan dan jadwal yang paling baru diperbarui.</p></div>
            <Link to="/app/visits" className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-950">Semua kunjungan<ArrowRight className="size-4" /></Link>
          </div>
          <VisitTable visits={recentVisits} isLoading={visitsQuery.is_loading} onSelect={setSelectedVisit} emptyTitle="Belum ada kunjungan" emptyDescription="Pengajuan baru akan tercatat di daftar ini." />
        </Panel>

        <div className="grid content-start gap-6">
          <Panel className="p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Kondisi perangkat</p><h2 className="mt-1 text-base font-semibold text-slate-900">Smart lock ruangan</h2></div><div className="grid size-10 place-items-center rounded-lg bg-teal-50 text-teal-800"><Smartphone className="size-[18px]" /></div></div>
            {devicesQuery.is_loading && !devicesQuery.response ? <div className="mt-5 h-16 animate-pulse rounded-lg bg-slate-100" /> : devices.length === 0 ? <p className="mt-4 rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">Belum ada perangkat terdaftar.</p> : <div className="mt-4 divide-y divide-slate-100">{devices.slice(0, 3).map((device) => <div key={device.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{device.room_name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><span className={`size-1.5 rounded-full ${device.connection_status?.toLowerCase() === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />{device.connection_status ?? "Status tidak diketahui"}</p></div><span className={`shrink-0 text-sm font-semibold ${device.battery_level != null && device.battery_level < 20 ? "text-amber-700" : "text-slate-700"}`}>{device.battery_level == null ? "—" : `${device.battery_level}%`}<span className="ml-1 text-xs font-normal text-slate-400">baterai</span></span></div>)}</div>}
            <Link to="/app/devices" className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium text-teal-800">Lihat semua perangkat<ArrowRight className="size-4" /></Link>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Akses cepat</h2><p className="mt-1 text-xs text-slate-500">Tindakan untuk operasional hari ini.</p></div>
            <div className="grid divide-y divide-slate-100">
              <QuickLink to="/app/visits?status=PENDING_APPROVAL" icon={<UsersRound className="size-4" />} title="Tinjau permohonan" caption={`${pendingCount} permohonan menunggu`} />
              {auth.user?.role !== "AUDITOR" && <QuickLink to="/app/walk-in" icon={<CalendarClock className="size-4" />} title="Daftarkan tamu walk-in" caption="Input kunjungan yang datang langsung" />}
              {(auth.user?.role === "ADMIN" || auth.user?.role === "AUDITOR") && <QuickLink to="/app/reports" icon={<Activity className="size-4" />} title="Buka laporan aktivitas" caption="Ekspor data kunjungan dan audit pintu" />}
            </div>
          </Panel>
        </div>
      </div>
      {selectedVisit && <VisitDetailsPanel visit={selectedVisit} onClose={() => setSelectedVisit(null)} onChanged={() => { visitsQuery.call_back(); pendingQuery.call_back(); devicesQuery.call_back(); }} />}
    </>
  );
}

function MetricCard({ label, value, caption, icon, tone }: { label: string; value: string; caption: string; icon: ReactNode; tone: "amber" | "teal" | "blue" | "green" }) {
  const toneClasses = { amber: "bg-amber-50 text-amber-800", teal: "bg-teal-50 text-teal-800", blue: "bg-sky-50 text-sky-800", green: "bg-emerald-50 text-emerald-800" };
  return <Panel className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">{value}</p></div><div className={`grid size-10 place-items-center rounded-lg ${toneClasses[tone]}`}>{icon}</div></div><p className="mt-3 text-xs text-slate-500">{caption}</p></Panel>;
}

function QuickLink({ to, icon, title, caption }: { to: string; icon: ReactNode; title: string; caption: string }) {
  return <Link to={to} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-teal-50 group-hover:text-teal-800">{icon}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-slate-800">{title}</p><p className="mt-1 truncate text-xs text-slate-500">{caption}</p></div><ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" /></Link>;
}
