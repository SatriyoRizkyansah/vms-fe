import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Battery, BatteryWarning, CircleHelp, Plus, Radio, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, FormField, PageHeading, Panel, SelectField, TextInput } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";
import { getAvailableDoors, getDeviceLocationLabel, type BuildingRecord } from "@/utils/location";

type DeviceRecord = {
  id: string;
  room_name: string;
  tuya_device_id: string;
  pin_length: number;
  connection_status: string;
  battery_level?: number | null;
  is_active: boolean;
  last_health_check_at?: string | null;
  door?: {
    id: string;
    name: string;
    room: { name: string; floor: { name: string; building: { name: string } } };
  } | null;
};

type DevicePayload = { door_id: string; tuya_device_id: string; pin_length: 6 | 7 };

export default function DevicesPage() {
  const auth = useSignalValue(auth_signal);
  const [showCreate, setShowCreate] = useState(false);
  const query = use_query({ api_tag: "roomDevices", api_method: "devicesControllerFindAll", api_query: [] });
  const locationsQuery = use_query({ api_tag: "locations", api_method: "locationsControllerFindAll", api_query: [] });
  const devices = (query.response as DeviceRecord[] | null) ?? [];
  const buildings = (locationsQuery.response as BuildingRecord[] | null) ?? [];
  const availableDoors = getAvailableDoors(buildings);
  const createMutation = use_mutation({ api_tag: "roomDevices", api_method: "devicesControllerCreate", options: { call_back: query.call_back, success_message_text: "Smart lock berhasil didaftarkan." } });
  const updateMutation = use_mutation({ api_tag: "roomDevices", api_method: "devicesControllerUpdate", options: { call_back: query.call_back, success_message_text: "Status perangkat diperbarui." } });
  const isAdmin = auth.user?.role === "ADMIN";
  const onlineCount = devices.filter((device) => device.connection_status?.toLowerCase() === "online").length;
  const lowBatteryCount = devices.filter((device) => device.battery_level != null && device.battery_level < 20).length;

  return (
    <>
      <PageHeading
        eyebrow="Infrastruktur akses"
        title="Perangkat"
        description="Pantau status smart lock dan hubungkan perangkat ke pintu yang sudah terdaftar."
        action={isAdmin ? (
          <Button onClick={() => setShowCreate(true)} className="gap-2" disabled={locationsQuery.is_loading || availableDoors.length === 0}>
            <Plus className="size-4" />Daftarkan perangkat
          </Button>
        ) : undefined}
      />

      {locationsQuery.error && <Alert variant="destructive" className="mb-5"><AlertDescription>Daftar lokasi belum dapat dimuat. Periksa koneksi API lalu coba lagi.</AlertDescription></Alert>}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <DeviceMetric label="Perangkat terdaftar" value={devices.length} icon={<Smartphone className="size-4" />} />
        <DeviceMetric label="Online" value={onlineCount} icon={<Radio className="size-4" />} />
        <DeviceMetric label="Baterai rendah" value={lowBatteryCount} icon={<BatteryWarning className="size-4" />} />
      </div>

      {isAdmin && availableDoors.length === 0 && !locationsQuery.is_loading && (
        <Alert className="mb-5">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{buildings.length === 0 ? "Buat struktur gedung dan pintu terlebih dahulu." : "Semua pintu aktif sudah memiliki perangkat atau belum ada pintu aktif."}</span>
            <Button size="sm" variant="outline" render={<Link to="/app/locations" />}>Kelola lokasi</Button>
          </AlertDescription>
        </Alert>
      )}

      {query.error && <Alert variant="destructive" className="mb-5"><AlertDescription>Status perangkat belum dapat dimuat.</AlertDescription></Alert>}
      {query.is_loading && devices.length === 0 ? (
        <div className="grid gap-3 xl:grid-cols-2"><div className="h-36 animate-pulse rounded-xl bg-muted" /><div className="h-36 animate-pulse rounded-xl bg-muted" /></div>
      ) : devices.length === 0 ? (
        <Panel><EmptyState icon={<Smartphone className="size-5" />} title="Belum ada smart lock" description="Perangkat akan tampil di sini setelah didaftarkan dan dihubungkan ke pintu." /></Panel>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {devices.map((device) => {
            const isOnline = device.connection_status?.toLowerCase() === "online";
            const battery = device.battery_level;
            const lowBattery = battery != null && battery < 20;
            return (
              <Panel key={device.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><Smartphone className="size-5" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{getDeviceLocationLabel(device)}</p>
                      <p className="mt-1 truncate font-mono text-xs text-muted-foreground">Tuya ID: {device.tuya_device_id}</p>
                    </div>
                  </div>
                  <Badge variant={isOnline ? "default" : "secondary"} className="shrink-0 gap-1.5 rounded-full">
                    <span className={`size-1.5 rounded-full ${isOnline ? "bg-current" : "bg-muted-foreground"}`} />
                    {device.connection_status || "Unknown"}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Baterai</p>
                    <div className="mt-1.5 flex items-center gap-2"><Battery className="size-4 text-muted-foreground" /><span className="text-base font-semibold text-foreground">{battery == null ? "Belum diketahui" : `${battery}%`}</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(battery ?? 0, 100))}%` }} /></div>
                    {lowBattery && <p className="mt-2 text-[11px] font-medium text-muted-foreground">Perlu penggantian baterai</p>}
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Panjang PIN</p>
                    <p className="mt-1.5 text-base font-semibold text-foreground">{device.pin_length} digit</p>
                    <p className="mt-1 text-xs text-muted-foreground">PIN akses tamu</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground"><span className={`size-1.5 rounded-full ${device.is_active ? "bg-primary" : "bg-muted-foreground"}`} />{device.is_active ? "Aktif di sistem" : "Nonaktif"}</span>
                  {isAdmin && <Button size="sm" variant="outline" disabled={query.is_loading} onClick={() => updateMutation([device.id, { is_active: !device.is_active }])}>{device.is_active ? "Nonaktifkan" : "Aktifkan"}</Button>}
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {!isAdmin && <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><CircleHelp className="size-4" />Pengelolaan perangkat hanya tersedia untuk admin.</p>}
      {showCreate && <RegisterDeviceDialog doors={availableDoors} onClose={() => setShowCreate(false)} onSubmit={async (payload) => {
        const response = await createMutation([payload]);
        if (response?.statusCode && response.statusCode < 300) setShowCreate(false);
      }} />}
    </>
  );
}

function DeviceMetric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <Panel className="flex min-h-24 items-center justify-between p-4"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p></div><div className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">{icon}</div></Panel>;
}

function RegisterDeviceDialog({ doors, onClose, onSubmit }: { doors: Array<{ id: string; label: string }>; onClose: () => void; onSubmit: (payload: DevicePayload) => Promise<void> }) {
  const [doorId, setDoorId] = useState(doors[0]?.id ?? "");
  const [deviceId, setDeviceId] = useState("");
  const [pinLength, setPinLength] = useState<"6" | "7">("7");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit({ door_id: doorId, tuya_device_id: deviceId.trim(), pin_length: Number(pinLength) as 6 | 7 });
    setIsSaving(false);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Daftarkan smart lock</DialogTitle>
            <DialogDescription>Pilih pintu yang sudah dibuat, lalu masukkan ID perangkat Tuya.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <FormField label="Pintu" htmlFor="device-door" required>
              <SelectField id="device-door" value={doorId || undefined} onValueChange={setDoorId} placeholder="Pilih lokasi pintu" options={doors.map((door) => ({ value: door.id, label: door.label }))} />
            </FormField>
            <FormField label="Tuya device ID" htmlFor="device-id" required><TextInput id="device-id" required value={deviceId} onChange={(event) => setDeviceId(event.target.value)} placeholder="ID perangkat dari Tuya" /></FormField>
            <FormField label="Panjang PIN" htmlFor="pin-length" required><SelectField id="pin-length" value={pinLength} onValueChange={(value) => setPinLength(value as "6" | "7")} placeholder="Pilih panjang PIN" options={[{ value: "6", label: "6 digit" }, { value: "7", label: "7 digit" }]} /></FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving || !doorId}>{isSaving ? "Menyimpan..." : "Simpan perangkat"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
