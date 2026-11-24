import { useState, type FormEvent, type ReactNode } from "react";
import { Battery, BatteryWarning, Check, CircleHelp, PencilLine, Plus, Radio, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, FormField, PageHeading, Panel, SelectInput, TextInput } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

type DeviceRecord = {
  id: string;
  room_name: string;
  tuya_device_id: string;
  pin_length: number;
  connection_status: string;
  battery_level?: number | null;
  is_active: boolean;
  last_health_check_at?: string | null;
};

export default function DevicesPage() {
  const auth = useSignalValue(auth_signal);
  const [showCreate, setShowCreate] = useState(false);
  const query = use_query({ api_tag: "roomDevices", api_method: "devicesControllerFindAll", api_query: [] });
  const devices = (query.response as DeviceRecord[] | null) ?? [];
  const createMutation = use_mutation({ api_tag: "roomDevices", api_method: "devicesControllerCreate", options: { call_back: query.call_back, success_message_text: "Smart lock berhasil didaftarkan." } });
  const updateMutation = use_mutation({ api_tag: "roomDevices", api_method: "devicesControllerUpdate", options: { call_back: query.call_back, success_message_text: "Status perangkat diperbarui." } });
  const isAdmin = auth.user?.role === "ADMIN";
  const onlineCount = devices.filter((device) => device.connection_status?.toLowerCase() === "online").length;
  const lowBatteryCount = devices.filter((device) => device.battery_level != null && device.battery_level < 20).length;

  return (
    <>
      <PageHeading eyebrow="Infrastruktur akses" title="Perangkat ruangan" description="Pantau koneksi dan level baterai smart lock yang terhubung ke VMS." action={isAdmin ? <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="size-4" />Daftarkan perangkat</Button> : undefined} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <DeviceMetric label="Terdaftar" value={devices.length} icon={<Smartphone className="size-4" />} />
        <DeviceMetric label="Online" value={onlineCount} icon={<Radio className="size-4" />} tone="green" />
        <DeviceMetric label="Baterai rendah" value={lowBatteryCount} icon={<BatteryWarning className="size-4" />} tone={lowBatteryCount ? "amber" : "default"} />
      </div>
      {devices.length === 0 && !query.is_loading ? <Panel><EmptyState icon={<Smartphone className="size-5" />} title="Belum ada smart lock" description="Perangkat ruangan yang didaftarkan akan tampil bersama status koneksi dan baterainya." /></Panel> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {devices.map((device) => {
            const isOnline = device.connection_status?.toLowerCase() === "online";
            const battery = device.battery_level;
            const lowBattery = battery != null && battery < 20;
            return (
              <Panel key={device.id} className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3.5"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Smartphone className="size-5" /></div><div className="min-w-0"><p className="truncate text-base font-semibold text-slate-900">{device.room_name}</p><p className="mt-1 truncate font-mono text-xs text-slate-500">ID Tuya · {device.tuya_device_id}</p></div></div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${isOnline ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-100 text-slate-600"}`}><span className={`size-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />{device.connection_status || "Unknown"}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3.5"><p className="text-xs text-slate-500">Baterai</p><div className="mt-2 flex items-center gap-2"><Battery className={`size-4 ${lowBattery ? "text-amber-700" : "text-slate-500"}`} /><span className={`text-lg font-semibold ${lowBattery ? "text-amber-800" : "text-slate-900"}`}>{battery == null ? "—" : `${battery}%`}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${lowBattery ? "bg-amber-500" : "bg-teal-600"}`} style={{ width: `${Math.max(0, Math.min(battery ?? 0, 100))}%` }} /></div>{lowBattery && <p className="mt-2 text-[11px] font-medium text-amber-800">Perlu penggantian baterai</p>}</div>
                  <div className="rounded-lg border border-slate-200 p-3.5"><p className="text-xs text-slate-500">Konfigurasi akses</p><p className="mt-2 text-lg font-semibold text-slate-900">{device.pin_length} digit</p><p className="mt-1 text-xs text-slate-500">Panjang PIN tamu</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><span className={`size-1.5 rounded-full ${device.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />{device.is_active ? "Aktif di sistem" : "Nonaktif"}</div>
                  {isAdmin && <Button size="sm" variant="outline" disabled={query.is_loading} onClick={() => updateMutation([device.id, { is_active: !device.is_active }])}><PencilLine className="size-3.5" />{device.is_active ? "Nonaktifkan" : "Aktifkan"}</Button>}
                </div>
              </Panel>
            );
          })}
          {query.is_loading && <Panel className="grid min-h-40 animate-pulse place-items-center bg-slate-50"><span className="text-sm text-slate-400">Memuat status perangkat…</span></Panel>}
        </div>
      )}
      {!isAdmin && <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CircleHelp className="size-4" />Hanya admin yang dapat mendaftarkan atau mengubah perangkat.</p>}
      {showCreate && <RegisterDeviceDialog onClose={() => setShowCreate(false)} onSubmit={async (payload) => { await createMutation([payload]); setShowCreate(false); }} />}
    </>
  );
}

function DeviceMetric({ label, value, icon, tone = "default" }: { label: string; value: number; icon: ReactNode; tone?: "default" | "green" | "amber" }) {
  const colors = { default: "bg-slate-100 text-slate-600", green: "bg-emerald-50 text-emerald-800", amber: "bg-amber-50 text-amber-800" };
  return <Panel className="flex items-center justify-between p-4"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p></div><div className={`grid size-9 place-items-center rounded-lg ${colors[tone]}`}>{icon}</div></Panel>;
}

function RegisterDeviceDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (payload: { room_name: string; tuya_device_id: string; pin_length: 6 | 7 }) => Promise<void> }) {
  const [roomName, setRoomName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [pinLength, setPinLength] = useState<"6" | "7">("7");
  const [isSaving, setIsSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit({ room_name: roomName.trim(), tuya_device_id: deviceId.trim(), pin_length: Number(pinLength) as 6 | 7 });
    setIsSaving(false);
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"><div className="flex items-start justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="text-base font-semibold text-slate-950">Daftarkan smart lock</h2><p className="mt-1 text-xs text-slate-500">Masukkan identitas perangkat Tuya ruangan.</p></div><Button type="button" size="icon" variant="ghost" aria-label="Tutup dialog" onClick={onClose}><X className="size-4" /></Button></div><div className="grid gap-4 px-5 py-5"><FormField label="Nama ruangan" htmlFor="device-room" required><TextInput id="device-room" required value={roomName} onChange={(event) => setRoomName(event.target.value)} placeholder="Ruangan Telematika" /></FormField><FormField label="Tuya device ID" htmlFor="device-id" required><TextInput id="device-id" required value={deviceId} onChange={(event) => setDeviceId(event.target.value)} placeholder="ID perangkat dari Tuya" /></FormField><FormField label="Panjang PIN" htmlFor="pin-length" required><SelectInput id="pin-length" value={pinLength} onChange={(event) => setPinLength(event.target.value as "6" | "7")}><option value="6">6 digit</option><option value="7">7 digit</option></SelectInput></FormField></div><div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan…" : "Simpan perangkat"}<Check className="size-4" /></Button></div></form></div>;
}
