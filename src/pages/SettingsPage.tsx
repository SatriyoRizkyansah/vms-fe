import { useState, type FormEvent } from "react";
import { Clock3, Save, ShieldCheck, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, PageHeading, Panel, TextInput } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

type SettingsValue = { access_buffer_before_minutes: number; access_buffer_after_minutes: number; operating_hours_start: string | null; operating_hours_end: string | null; timezone: string };
type SettingsDraft = Pick<SettingsValue, "access_buffer_before_minutes" | "access_buffer_after_minutes" | "operating_hours_start" | "operating_hours_end">;

export default function SettingsPage() {
  const auth = useSignalValue(auth_signal);
  const settingsQuery = use_query({ api_tag: "settings", api_method: "settingsControllerGetSettings", api_query: [] });
  const settings = settingsQuery.response as SettingsValue | null;
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isAdmin = auth.user?.role === "ADMIN";

  const values: SettingsDraft = draft ?? settings ?? {
    access_buffer_before_minutes: 15,
    access_buffer_after_minutes: 15,
    operating_hours_start: null,
    operating_hours_end: null,
  };
  const start = values.operating_hours_start ?? "";
  const end = values.operating_hours_end ?? "";
  const beforeMinutes = String(values.access_buffer_before_minutes);
  const afterMinutes = String(values.access_buffer_after_minutes);

  const updateMutation = use_mutation({ api_tag: "settings", api_method: "settingsControllerUpdateSettings", options: { should_disable_loading: true, call_back: settingsQuery.call_back, success_message_text: "Pengaturan berhasil disimpan.", will_exec_after_error: (error) => setErrorMessage(error?.error?.message ?? error?.message ?? "Pengaturan belum dapat disimpan.") } });

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (Boolean(start) !== Boolean(end)) {
      setErrorMessage("Jam mulai dan jam selesai harus diisi bersama.");
      return;
    }
    if (start && end && start >= end) {
      setErrorMessage("Jam selesai harus setelah jam mulai.");
      return;
    }
    setIsSaving(true);
    const payload = {
      access_buffer_before_minutes: Number(beforeMinutes),
      access_buffer_after_minutes: Number(afterMinutes),
      operating_hours_start: start ? start as unknown as object : null,
      operating_hours_end: end ? end as unknown as object : null,
    };
    await updateMutation([payload]);
    setIsSaving(false);
  }

  return (
    <>
      <PageHeading eyebrow="Konfigurasi VMS" title="Pengaturan kunjungan" description="Atur batas waktu akses dan jam operasional Ruang Telematika." />
      {settingsQuery.is_loading && !settings ? <Panel className="p-8"><div className="h-5 w-48 animate-pulse rounded bg-muted" /><div className="mt-5 h-24 animate-pulse rounded bg-muted" /></Panel> : (
        <form onSubmit={saveSettings} className="grid max-w-4xl gap-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><TimerReset className="size-[18px]" /></div><div><h2 className="text-sm font-semibold text-foreground">Buffer masa akses</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Tambahan waktu sebelum dan sesudah jadwal untuk menyiapkan akses PIN tamu.</p></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Sebelum jadwal (menit)" htmlFor="buffer-before"><TextInput id="buffer-before" type="number" min={0} max={180} required disabled={!isAdmin} value={beforeMinutes} onChange={(event) => setDraft((current) => ({ ...values, ...current, access_buffer_before_minutes: Number(event.target.value) }))} /></FormField>
              <FormField label="Sesudah jadwal (menit)" htmlFor="buffer-after"><TextInput id="buffer-after" type="number" min={0} max={180} required disabled={!isAdmin} value={afterMinutes} onChange={(event) => setDraft((current) => ({ ...values, ...current, access_buffer_after_minutes: Number(event.target.value) }))} /></FormField>
            </div>
          </Panel>
          <Panel className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><Clock3 className="size-[18px]" /></div><div><h2 className="text-sm font-semibold text-foreground">Jam operasional</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Kosongkan keduanya jika kunjungan tidak dibatasi jam kerja.</p></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Jam mulai" htmlFor="operating-start"><TextInput id="operating-start" type="time" disabled={!isAdmin} value={start} onChange={(event) => setDraft((current) => ({ ...values, ...current, operating_hours_start: event.target.value || null }))} /></FormField>
              <FormField label="Jam selesai" htmlFor="operating-end"><TextInput id="operating-end" type="time" disabled={!isAdmin} value={end} onChange={(event) => setDraft((current) => ({ ...values, ...current, operating_hours_end: event.target.value || null }))} /></FormField>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Zona waktu sistem: <span className="font-medium text-foreground">{settings?.timezone ?? "Asia/Jakarta"}</span></p>
          </Panel>
          {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
          {isAdmin ? <div className="flex justify-end"><Button type="submit" disabled={isSaving || settingsQuery.is_loading} className="gap-2"><Save className="size-4" />{isSaving ? "Menyimpan…" : "Simpan pengaturan"}</Button></div> : <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5"><ShieldCheck className="mt-0.5 size-4 text-foreground" /><p className="text-xs leading-5 text-muted-foreground">Pengaturan hanya dapat diubah oleh administrator. Akun ini memiliki akses baca saja.</p></div>}
        </form>
      )}
    </>
  );
}
