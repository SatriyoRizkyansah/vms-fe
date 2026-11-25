import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, FormField, PageHeading, TextInput } from "@/components/vms/primitives";
import { LocationBrowser, type CreateLocationTarget, type LocationKind } from "@/components/locations/LocationBrowser";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";
import type { BuildingRecord } from "@/utils/location";

type LocationFormValues = { name: string; code: string; address: string; floor_number: string; description: string };

export default function LocationsPage() {
  const auth = useSignalValue(auth_signal);
  const isAdmin = auth.user?.role === "ADMIN";
  const [createDialog, setCreateDialog] = useState<CreateLocationTarget | null>(null);
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

  async function updateStatus(kind: LocationKind, id: string, isActive: boolean) {
    if (kind === "building") await updateBuilding([id, { is_active: isActive }]);
    if (kind === "floor") await updateFloor([id, { is_active: isActive }]);
    if (kind === "room") await updateRoom([id, { is_active: isActive }]);
    if (kind === "door") await updateDoor([id, { is_active: isActive }]);
  }

  return (
    <>
      <PageHeading
        eyebrow="Administrasi lokasi"
        title="Struktur lokasi"
        description="Atur gedung, lantai, ruangan, dan pintu sebagai satu hierarki akses."
        action={isAdmin ? <Button className="gap-2" onClick={() => setCreateDialog({ kind: "building" })}><Plus className="size-4" />Tambah gedung</Button> : undefined}
      />
      {!isAdmin && <Alert className="mb-5"><AlertDescription>Akun Anda hanya dapat melihat lokasi. Pengelolaan lokasi dilakukan oleh administrator.</AlertDescription></Alert>}
      {query.error && <Alert variant="destructive" className="mb-5"><AlertDescription>Data lokasi belum dapat dimuat.</AlertDescription></Alert>}

      {query.is_loading && buildings.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]"><div className="h-[34rem] animate-pulse rounded-xl bg-muted" /><div className="h-[34rem] animate-pulse rounded-xl bg-muted" /></div>
      ) : query.error ? (
        <Card><EmptyState icon={<Building2 className="size-5" />} title="Lokasi belum dapat dimuat" description="Periksa koneksi API, lalu muat ulang halaman ini." /></Card>
      ) : buildings.length === 0 ? (
        <Card><EmptyState icon={<Building2 className="size-5" />} title="Belum ada gedung" description={isAdmin ? "Mulai dengan membuat gedung, lalu tambahkan lantai, ruangan, dan pintunya." : "Administrator belum menambahkan lokasi ke VMS."} /></Card>
      ) : (
        <LocationBrowser buildings={buildings} isAdmin={isAdmin} onCreate={setCreateDialog} onStatusChange={updateStatus} />
      )}

      {isAdmin && <p className="mt-5 text-xs text-muted-foreground">Smart lock ditautkan ke pintu melalui halaman <Link to="/app/devices" className="font-medium underline underline-offset-4">Perangkat</Link>. Lokasi nonaktif tidak tersedia untuk kunjungan baru.</p>}
      {createDialog && <CreateLocationDialog target={createDialog} onClose={() => setCreateDialog(null)} onSave={saveLocation} />}
    </>
  );
}
function CreateLocationDialog({ target, onClose, onSave }: { target: CreateLocationTarget; onClose: () => void; onSave: (values: LocationFormValues) => Promise<void> }) {
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
            <Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : `Simpan ${kindLabel}`}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}