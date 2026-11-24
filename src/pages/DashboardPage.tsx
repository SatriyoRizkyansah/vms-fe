import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BatteryWarning,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Plus,
  ShieldAlert,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { PageHeading, Panel } from "@/components/vms/primitives";
import { VisitTable } from "@/components/vms/VisitTable";
import use_query from "@/hook/api-use-query";
import { getJakartaDayRange, type VisitListResponse, type VisitRecord } from "@/utils/vms";
import { getDeviceLocationLabel } from "@/utils/location";
import VisitDetailsPanel from "@/components/vms/VisitDetailsPanel";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

type DeviceRecord = {
  id: string;
  room_name: string;
  connection_status: string;
  battery_level?: number | null;
  is_active: boolean;
  door?: { name: string; room: { name: string; floor: { name: string; building: { name: string } } } } | null;
};

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

      {lowBattery.length > 0 && <Alert className="mb-6 items-center gap-3 bg-muted px-4 py-3.5"><BatteryWarning className="size-5 shrink-0" /><div><AlertTitle>Periksa baterai smart lock</AlertTitle><AlertDescription className="mt-1">{lowBattery.map((device) => `${getDeviceLocationLabel(device)} (${device.battery_level}%)`).join(" · ")}</AlertDescription></div><AlertAction className="hidden sm:block"><Link to="/app/devices" className="text-sm font-medium underline underline-offset-4">Lihat perangkat</Link></AlertAction></Alert>}

      <SectionCards metrics={[
        {
          label: "Menunggu persetujuan",
          value: pendingQuery.is_loading && !pendingResult ? "—" : pendingCount.toLocaleString("id-ID"),
          badge: pendingCount ? `${pendingCount} menunggu` : "Tidak ada antrean",
          description: "Permohonan yang perlu ditinjau PIC.",
          icon: <Clock3 className="size-3.5" />,
        },
        {
          label: "Jadwal hari ini",
          value: visitsQuery.is_loading && !visitResult ? "—" : todayVisits.length.toLocaleString("id-ID"),
          badge: "Hari ini",
          description: "Kunjungan terjadwal hari ini.",
          icon: <CalendarCheck2 className="size-3.5" />,
        },
        {
          label: "Akses aktif",
          value: visitsQuery.is_loading && !visitResult ? "—" : activeAccess.toLocaleString("id-ID"),
          badge: "PIN / check-in",
          description: "PIN aktif atau tamu sudah check-in.",
          icon: <ShieldAlert className="size-3.5" />,
        },
        {
          label: "Smart lock online",
          value: devicesQuery.is_loading && !devicesQuery.response ? "—" : `${onlineDevices}/${devices.length}`,
          badge: "Online",
          description: "Perangkat aktif yang terhubung.",
          icon: <Smartphone className="size-3.5" />,
        },
      ]} />

      <div className="mt-6">
        <ChartAreaInteractive visits={visits} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base">Kunjungan terbaru</CardTitle>
              <CardDescription className="mt-1">Permohonan dan jadwal yang paling baru diperbarui.</CardDescription>
            </div>
            <Link to="/app/visits" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium hover:underline">Semua kunjungan<ArrowRight className="size-4" /></Link>
          </CardHeader>
          <VisitTable visits={recentVisits} isLoading={visitsQuery.is_loading} onSelect={setSelectedVisit} emptyTitle="Belum ada kunjungan" emptyDescription="Pengajuan baru akan tercatat di daftar ini." />
        </Card>

        <div className="grid content-start gap-6">
          <Panel className="p-5">
            <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">Kondisi perangkat</p><h2 className="mt-1 text-base font-semibold text-foreground">Smart lock ruangan</h2></div><div className="grid size-10 place-items-center rounded-lg bg-muted text-foreground"><Smartphone className="size-[18px]" /></div></div>
            {devicesQuery.is_loading && !devicesQuery.response ? <div className="mt-5 h-16 animate-pulse rounded-lg bg-muted" /> : devices.length === 0 ? <p className="mt-4 rounded-lg bg-muted px-3 py-4 text-sm text-muted-foreground">Belum ada perangkat terdaftar.</p> : <div className="mt-4 divide-y divide-border">{devices.slice(0, 3).map((device) => <div key={device.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{getDeviceLocationLabel(device)}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`size-1.5 rounded-full ${device.connection_status?.toLowerCase() === "online" ? "bg-primary" : "bg-muted-foreground"}`} />{device.connection_status ?? "Status tidak diketahui"}</p></div><span className="shrink-0 text-sm font-semibold text-foreground">{device.battery_level == null ? "—" : `${device.battery_level}%`}<span className="ml-1 text-xs font-normal text-muted-foreground">baterai</span></span></div>)}</div>}
            <Link to="/app/devices" className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm font-medium hover:underline">Lihat semua perangkat<ArrowRight className="size-4" /></Link>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold text-foreground">Akses cepat</h2><p className="mt-1 text-xs text-muted-foreground">Tindakan untuk operasional hari ini.</p></div>
            <div className="grid divide-y divide-border">
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

function QuickLink({ to, icon, title, caption }: { to: string; icon: ReactNode; title: string; caption: string }) {
  return <Link to={to} className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">{icon}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground">{title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p></div><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" /></Link>;
}
