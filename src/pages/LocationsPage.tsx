import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  DoorOpen,
  Layers3,
  MapPin,
  Plus,
  Power,
  Smartphone,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, FormField, PageHeading, TextInput } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";
import type { BuildingRecord } from "@/utils/location";

type CreateDialogState =
  | { kind: "building" }
  | { kind: "floor"; parentId: string; parentName: string }
  | { kind: "room"; parentId: string; parentName: string }
  | { kind: "door"; parentId: string; parentName: string };

type LocationFormValues = { name: string; code: string; address: string; floor_number: string; description: string };

export default function LocationsPage() {
  const auth = useSignalValue(auth_signal);
  const isAdmin = auth.user?.role === "ADMIN";
  const [createDialog, setCreateDialog] = useState<CreateDialogState | null>(null);
  const query = use_query({ api_tag: "locations", api_method: "locationsControllerFindAll", api_query: [] });
  const buildings = (query.response as BuildingRecord[] | null) ?? [];

  const createBuilding = use_mutation({ api_tag: "locations", api_method: "locationsControllerCreateBuilding", options: { call_back: query.call_back, success_message_text: "Gedung berhasil dibuat." } });
  const updateBuilding = use_mutation({ api_tag: "locations", api_method: "locationsControllerUpdateBuilding", options: { call_back: query.call_back, success_message_text: "Status gedung diperbarui." } });
  const createFloor = use_mutation({ api_tag: "locations", api_method: "locationsControllerCreateFloor", options: { call_back: query.call_back, success_message_text: "Lantai berhasil dibuat." } });
  const updateFloor = use_mutation({ api_tag: "locations", api_method: "locationsControllerUpdateFloor", options: { call_back: query.call_back, success_message_text: "Status lantai diperbarui." } });
  const createRoom = use_mutation({ api_tag: "locations", api_method: "locationsControllerCreateRoom", options: { call_back: query.call_back, success_message_text: "Ruangan berhasil dibuat." } });
  const updateRoom = use_mutation({ api_tag: "locations", api_method: "locationsControllerUpdateRoom", options: { call_back: query.call_back, success_message_text: "Status ruangan diperbarui." } });
  const createDoor = use_mutation({ api_tag: "locations", api_method: "locationsControllerCreateDoor", options: { call_back: query.call_back, success_message_text: "Pintu berhasil dibuat." } });
  const updateDoor = use_mutation({ api_tag: "locations", api_method: "locationsControllerUpdateDoor", options: { call_back: query.call_back, success_message_text: "Status pintu diperbarui." } });

  async function saveLocation(values: LocationFormValues) {
    if (!createDialog) return;
    let response;
    if (createDialog.kind === "building") {
      response = await createBuilding([{ name: values.name.trim(), code: values.code.trim().toUpperCase(), address: values.address.trim() || undefined }]);
    } else if (createDialog.kind === "floor") {
      response = await createFloor([createDialog.parentId, { name: values.name.trim(), floor_number: values.floor_number ? Number(values.floor_number) : undefined }]);
    } else if (createDialog.kind === "room") {
      response = await createRoom([createDialog.parentId, { name: values.name.trim(), code: values.code.trim() || undefined, description: values.description.trim() || undefined }]);
    } else {
      response = await createDoor([createDialog.parentId, { name: values.name.trim(), code: values.code.trim() || undefined }]);
    }
    if (response && "statusCode" in response && typeof response.statusCode === "number" && response.statusCode < 300) setCreateDialog(null);
  }

  return (
    <>
      <PageHeading
        eyebrow="Administrasi lokasi"
        title="Gedung dan akses"
        description="Susun lokasi VMS dari gedung, lantai, ruangan, hingga pintu dan smart lock."
        action={isAdmin ? <Button className="gap-2" onClick={() => setCreateDialog({ kind: "building" })}><Plus className="size-4" />Tambah gedung</Button> : undefined}
      />

      {!isAdmin && <Alert className="mb-5"><AlertDescription>Akun Anda hanya dapat melihat lokasi. Pengelolaan lokasi dilakukan oleh administrator.</AlertDescription></Alert>}
      {query.error && <Alert variant="destructive" className="mb-5"><AlertDescription>Data lokasi belum dapat dimuat.</AlertDescription></Alert>}
      {query.is_loading && buildings.length === 0 ? <div className="grid gap-4"><div className="h-32 animate-pulse rounded-xl bg-muted" /><div className="h-32 animate-pulse rounded-xl bg-muted" /></div> : query.error ? (
        <Card><EmptyState icon={<Building2 className="size-5" />} title="Lokasi belum dapat dimuat" description="Periksa koneksi API, lalu muat ulang halaman ini." /></Card>
      ) : buildings.length === 0 ? (
        <Card>
          <EmptyState icon={<Building2 className="size-5" />} title="Belum ada gedung" description={isAdmin ? "Mulai dengan membuat gedung, lalu tambahkan lantai, ruangan, dan pintunya." : "Administrator belum menambahkan lokasi ke VMS."} />
        </Card>
      ) : (
        <div className="grid gap-4">
          {buildings.map((building) => (
            <Card key={building.id} size="sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><Building2 className="size-5" /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><CardTitle>{building.name}</CardTitle><Badge variant={building.is_active ? "secondary" : "outline"}>{building.is_active ? "Aktif" : "Nonaktif"}</Badge></div>
                    <CardDescription className="mt-1">{building.code}{building.address ? ` · ${building.address}` : ""} · {building.floors.length} lantai</CardDescription>
                  </div>
                </div>
                <CardAction className="flex items-center gap-2">
                  {isAdmin && <Button size="sm" variant="outline" disabled={!building.is_active} onClick={() => setCreateDialog({ kind: "floor", parentId: building.id, parentName: building.name })}><Plus className="size-3.5" />Tambah lantai</Button>}
                  {isAdmin && <Button size="icon-sm" variant="ghost" aria-label={building.is_active ? "Nonaktifkan gedung" : "Aktifkan gedung"} title={building.is_active ? "Nonaktifkan gedung" : "Aktifkan gedung"} onClick={() => updateBuilding([building.id, { is_active: !building.is_active }])}><Power className="size-4" /></Button>}
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3 pt-3">
                {building.floors.length === 0 ? <p className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">Belum ada lantai di gedung ini.</p> : building.floors.map((floor) => {
                  const parentActive = building.is_active && floor.is_active;
                  return (
                    <section key={floor.id} className="rounded-lg border bg-muted/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2"><Layers3 className="size-4 shrink-0 text-muted-foreground" /><h3 className="text-sm font-semibold">{floor.name}</h3>{floor.floor_number != null && <span className="text-xs text-muted-foreground">Lantai {floor.floor_number}</span>}<Badge variant={floor.is_active ? "outline" : "secondary"}>{floor.is_active ? "Aktif" : "Nonaktif"}</Badge></div>
                        <div className="flex items-center gap-2">
                          {isAdmin && <Button size="sm" variant="ghost" disabled={!floor.is_active && !building.is_active} onClick={() => updateFloor([floor.id, { is_active: !floor.is_active }])}>{floor.is_active ? "Nonaktifkan" : "Aktifkan"}</Button>}
                          {isAdmin && <Button size="sm" variant="outline" disabled={!parentActive} onClick={() => setCreateDialog({ kind: "room", parentId: floor.id, parentName: `${building.name} / ${floor.name}` })}><Plus className="size-3.5" />Tambah ruangan</Button>}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {floor.rooms.map((room) => {
                          const roomActive = parentActive && room.is_active;
                          return (
                            <div key={room.id} className="min-w-0 rounded-lg border bg-card p-3.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2"><MapPin className="size-4 text-muted-foreground" /><h4 className="truncate text-sm font-semibold">{room.name}</h4><Badge variant={room.is_active ? "secondary" : "outline"}>{room.is_active ? "Aktif" : "Nonaktif"}</Badge></div>
                                  {room.code && <p className="ml-6 mt-1 text-xs text-muted-foreground">Kode {room.code}</p>}
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  {isAdmin && <Button size="icon-sm" variant="ghost" aria-label={room.is_active ? "Nonaktifkan ruangan" : "Aktifkan ruangan"} disabled={!room.is_active && !parentActive} onClick={() => updateRoom([room.id, { is_active: !room.is_active }])}><Power className="size-3.5" /></Button>}
                                  {isAdmin && <Button size="sm" variant="outline" disabled={!roomActive} onClick={() => setCreateDialog({ kind: "door", parentId: room.id, parentName: room.name })}><Plus className="size-3.5" />Pintu</Button>}
                                </div>
                              </div>
                              <div className="mt-3 grid gap-2">
                                {room.doors.length === 0 ? <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">Belum ada pintu.</p> : room.doors.map((door) => {
                                  const device = door.devices[0];
                                  return (
                                    <div key={door.id} className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2.5">
                                      <div className="flex min-w-0 items-center gap-2"><DoorOpen className="size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="truncate text-sm font-medium">{door.name}</p><p className="truncate text-xs text-muted-foreground">{door.code ?? (device ? `Smart lock · ${device.connection_status}` : "Belum ada smart lock")}</p></div></div>
                                      <div className="flex shrink-0 items-center gap-2">{device && <Badge variant={device.is_active ? "secondary" : "outline"}><Smartphone className="mr-1 size-3" />{device.is_active ? "Terhubung" : "Nonaktif"}</Badge>}{isAdmin && <Button size="icon-sm" variant="ghost" aria-label={door.is_active ? "Nonaktifkan pintu" : "Aktifkan pintu"} disabled={!door.is_active && !roomActive} onClick={() => updateDoor([door.id, { is_active: !door.is_active }])}><Power className="size-3.5" /></Button>}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {floor.rooms.length === 0 && <p className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground md:col-span-2">Belum ada ruangan di lantai ini.</p>}
                      </div>
                    </section>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAdmin && <p className="mt-5 text-xs text-muted-foreground">Smart lock ditautkan ke pintu melalui halaman <Link to="/app/devices" className="font-medium underline underline-offset-4">Perangkat</Link>. Lokasi yang dinonaktifkan tidak tersedia untuk kunjungan baru.</p>}
      {createDialog && <CreateLocationDialog target={createDialog} onClose={() => setCreateDialog(null)} onSave={saveLocation} />}
    </>
  );
}

function CreateLocationDialog({ target, onClose, onSave }: { target: CreateDialogState; onClose: () => void; onSave: (values: LocationFormValues) => Promise<void> }) {
  const [values, setValues] = useState<LocationFormValues>({ name: "", code: "", address: "", floor_number: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const kindLabel = target.kind === "building" ? "gedung" : target.kind === "floor" ? "lantai" : target.kind === "room" ? "ruangan" : "pintu";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    await onSave(values);
    setIsSaving(false);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Tambah {kindLabel}</DialogTitle>
            <DialogDescription>{target.kind === "building" ? "Buat lokasi utama untuk mengelola akses." : `Lokasi induk: ${target.parentName}`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <FormField label={target.kind === "building" ? "Nama gedung" : `Nama ${kindLabel}`} htmlFor="location-name" required>
              <TextInput id="location-name" required maxLength={target.kind === "floor" ? 80 : 160} autoFocus value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} placeholder={target.kind === "door" ? "Pintu utama" : target.kind === "room" ? "Ruang Telematika" : target.kind === "floor" ? "Lantai 1" : "Nama gedung"} />
            </FormField>
            {(target.kind === "building" || target.kind === "room" || target.kind === "door") && <FormField label="Kode" htmlFor="location-code" required={target.kind === "building"}><TextInput id="location-code" required={target.kind === "building"} maxLength={40} value={values.code} onChange={(event) => setValues((current) => ({ ...current, code: event.target.value }))} placeholder={target.kind === "building" ? "GEDUNG-UTAMA" : "Opsional"} /></FormField>}
            {target.kind === "building" && <FormField label="Alamat" htmlFor="location-address"><TextInput id="location-address" maxLength={255} value={values.address} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} placeholder="Alamat gedung (opsional)" /></FormField>}
            {target.kind === "floor" && <FormField label="Nomor lantai" htmlFor="floor-number" hint="Gunakan angka negatif untuk basement."><TextInput id="floor-number" type="number" step={1} min={-99} max={999} value={values.floor_number} onChange={(event) => setValues((current) => ({ ...current, floor_number: event.target.value }))} placeholder="Contoh: 2" /></FormField>}
            {target.kind === "room" && <FormField label="Keterangan" htmlFor="location-description"><TextInput id="location-description" maxLength={500} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} placeholder="Keterangan ruangan (opsional)" /></FormField>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan…" : `Simpan ${kindLabel}`}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
