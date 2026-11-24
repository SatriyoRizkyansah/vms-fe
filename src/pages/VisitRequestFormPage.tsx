import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, FileCheck2, MapPin, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState, FormField, Panel, SelectField, TextInput, Textarea, VmsMark } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { localDateTimeValue, toIsoDateTime, type PicOption, type VisitRecord } from "@/utils/vms";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

type FormValues = {
  visitor_name: string;
  visitor_identity_no: string;
  visitor_institution: string;
  visitor_phone: string;
  visitor_email: string;
  purpose: string;
  pic_user_id: string;
  room_device_id: string;
  scheduled_start: string;
  scheduled_end: string;
};

function initialValues(picId = ""): FormValues {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    visitor_name: "",
    visitor_identity_no: "",
    visitor_institution: "",
    visitor_phone: "",
    visitor_email: "",
    purpose: "",
    pic_user_id: picId,
    room_device_id: "",
    scheduled_start: localDateTimeValue(start),
    scheduled_end: localDateTimeValue(end),
  };
}

function isPastVisitStart(value: string) {
  return new Date(value).getTime() < Date.now();
}

export default function VisitRequestFormPage({ walkIn = false }: { walkIn?: boolean }) {
  const navigate = useNavigate();
  const auth = useSignalValue(auth_signal);
  const [values, setValues] = useState<FormValues>(() => initialValues(walkIn && auth.user?.role === "PIC" ? auth.user.id : ""));
  const [autoApprove, setAutoApprove] = useState(true);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedVisit, setCompletedVisit] = useState<VisitRecord | null>(null);
  const picsQuery = use_query({
    api_tag: "visits",
    api_method: "visitsControllerListActivePics",
    api_query: [],
    is_public: true,
    options: { should_disable_error_message: true },
  });
  const locationsQuery = use_query({
    api_tag: "locations",
    api_method: "locationsControllerVisitOptions",
    api_query: [],
    is_public: true,
    options: { should_disable_error_message: true },
  });
  const publicMutation = use_mutation({
    api_tag: "visits",
    api_method: "visitsControllerCreate",
    options: {
      should_disable_loading: true,
      should_disable_success_message: true,
      should_disable_error_message: true,
      will_exec_after_error: (error) => setErrorMessage(error?.error?.message ?? error?.message ?? "Permohonan belum dapat dikirim."),
    },
  });
  const walkInMutation = use_mutation({
    api_tag: "visits",
    api_method: "visitsControllerCreateWalkIn",
    options: {
      should_disable_loading: true,
      should_disable_success_message: true,
      should_disable_error_message: true,
      will_exec_after_error: (error) => setErrorMessage(error?.error?.message ?? error?.message ?? "Pendaftaran tamu belum dapat disimpan."),
    },
  });
  const allPics = (picsQuery.response as PicOption[] | null) ?? [];
  const pics = walkIn && auth.user?.role === "PIC" ? allPics.filter((pic) => pic.id === auth.user?.id) : allPics;
  const locations = (locationsQuery.response as Array<{ room_device_id: string; label: string }> | null) ?? [];
  const selectedRoomDeviceId = values.room_device_id || locations[0]?.room_device_id || "";

  if (walkIn && auth.user?.role === "AUDITOR") {
    return <Panel className="mx-auto max-w-xl p-8 text-center"><ShieldCheck className="mx-auto size-7 text-muted-foreground" /><h1 className="mt-3 text-base font-semibold text-foreground">Pendaftaran walk-in terbatas</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Fitur ini hanya tersedia untuk akun PIC dan Admin.</p><Link to="/app/visits" className="mt-5 inline-flex text-sm font-medium text-foreground">Kembali ke kunjungan<ArrowRight className="ml-1 size-4" /></Link></Panel>;
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const start = new Date(values.scheduled_start);
    const end = new Date(values.scheduled_end);
    if (!(start < end)) {
      setErrorMessage("Waktu selesai harus setelah waktu mulai.");
      return;
    }
    if (!walkIn && isPastVisitStart(values.scheduled_start)) {
      setErrorMessage("Pilih waktu kunjungan yang belum lewat.");
      return;
    }
    if (!selectedRoomDeviceId) {
      setErrorMessage("Belum ada pintu dengan smart lock aktif. Hubungi administrator untuk mengatur lokasi kunjungan.");
      return;
    }
    setIsSubmitting(true);
    const dto = {
      ...values,
      visitor_name: values.visitor_name.trim(),
      visitor_identity_no: values.visitor_identity_no.trim(),
      visitor_institution: values.visitor_institution.trim(),
      visitor_phone: values.visitor_phone.trim(),
      visitor_email: values.visitor_email.trim(),
      purpose: values.purpose.trim(),
      room_device_id: selectedRoomDeviceId,
      scheduled_start: toIsoDateTime(values.scheduled_start),
      scheduled_end: toIsoDateTime(values.scheduled_end),
    };
    const response = walkIn
      ? await walkInMutation([{
          ...dto,
          auto_approve: autoApprove,
          is_emergency: isEmergency,
        }])
      : await publicMutation([dto]);
    setIsSubmitting(false);
    const visit = (response as { data?: VisitRecord } | undefined)?.data;
    if (visit) setCompletedVisit(visit);
  }

  if (completedVisit) {
    return (
      <div className={walkIn ? "mx-auto max-w-3xl" : "min-h-screen bg-background px-4 py-8 sm:px-8 lg:px-12"}>
        {!walkIn && <header className="mx-auto mb-10 flex max-w-6xl items-center justify-between"><Link to="/"><VmsMark /></Link><Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Portal staf <ArrowRight className="ml-1 inline size-4" /></Link></header>}
        <Panel className="mx-auto max-w-xl overflow-hidden">
          <div className="bg-primary px-7 py-8 text-white sm:px-9">
            <div className="grid size-12 place-items-center rounded-full bg-card/15"><Check className="size-6" /></div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-200">{walkIn ? "Pendaftaran tercatat" : "Permohonan terkirim"}</p>
            <h1 className="mt-2 text-2xl font-semibold">{completedVisit.visit_code}</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-neutral-300">{walkIn && autoApprove ? "Tamu telah didaftarkan dan proses persetujuan langsung dimulai." : "Simpan kode kunjungan ini. PIC yang dipilih akan meninjau permohonan Anda."}</p>
          </div>
          <div className="grid gap-4 p-7 sm:px-9">
            <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 text-foreground" /><div><p className="text-xs text-muted-foreground">Jadwal kunjungan</p><p className="mt-1 text-sm font-medium text-foreground">{new Date(completedVisit.scheduled_start).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })} WIB</p></div></div>
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 text-foreground" /><div><p className="text-xs text-muted-foreground">Lokasi kunjungan</p><p className="mt-1 text-sm font-medium text-foreground">{locations.find((location) => location.room_device_id === selectedRoomDeviceId)?.label ?? "Lokasi terpilih"}</p></div></div>
            {!walkIn && <div className="flex items-start gap-3"><UserRoundCheck className="mt-0.5 size-4 text-foreground" /><div><p className="text-xs text-muted-foreground">PIC tujuan</p><p className="mt-1 text-sm font-medium text-foreground">{completedVisit.pic?.full_name ?? "PIC Telematika"}</p></div></div>}
            <Button className="mt-3 w-full" onClick={() => walkIn ? navigate("/app/visits", { replace: true }) : setCompletedVisit(null)}>{walkIn ? "Kembali ke daftar kunjungan" : "Ajukan kunjungan lain"}<ArrowRight className="ml-auto size-4" /></Button>
          </div>
        </Panel>
      </div>
    );
  }

  return walkIn ? (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6"><Link to="/app/visits" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Kembali ke kunjungan</Link></div>
      <FormContent {...{ values, update, pics, picsLoading: picsQuery.is_loading, locations, locationsLoading: locationsQuery.is_loading, errorMessage, isSubmitting, handleSubmit, walkIn, autoApprove, setAutoApprove, isEmergency, setIsEmergency }} />
    </div>
  ) : (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8 lg:px-12 lg:py-9">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/"><VmsMark /></Link>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">Masuk sebagai staf<ArrowRight className="size-4" /></Link>
      </header>
      <div className="mx-auto mt-9 grid max-w-6xl gap-8 lg:mt-14 lg:grid-cols-[0.76fr_1.24fr] lg:gap-12">
        <section className="lg:sticky lg:top-10 lg:self-start">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"><span className="size-1.5 rounded-full bg-primary" />Pendaftaran kunjungan</p>
          <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">Ajukan kunjungan ke LEMIGAS.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">Isi informasi tamu, pilih lokasi, dan tentukan jadwal. PIC tujuan akan meninjau permohonan sebelum akses diberikan.</p>
          <div className="mt-8 grid gap-4">
            <div className="flex gap-3 rounded-xl border border-border bg-card p-4"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><ShieldCheck className="size-4" /></div><div><h2 className="text-sm font-semibold text-foreground">Persetujuan sebelum akses</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Akses diberikan setelah PIC menyetujui permohonan.</p></div></div>
            <div className="flex gap-3 rounded-xl border border-border bg-card p-4"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Clock3 className="size-4" /></div><div><h2 className="text-sm font-semibold text-foreground">Pilih waktu dan lokasi</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Lokasi yang tersedia mengikuti gedung, lantai, ruangan, dan pintu aktif.</p></div></div>
          </div>
          {locations.length > 0 && <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="size-4 text-foreground" />{locations.length} lokasi aktif</div>}
        </section>
        <FormContent {...{ values, update, pics, picsLoading: picsQuery.is_loading, locations, locationsLoading: locationsQuery.is_loading, errorMessage, isSubmitting, handleSubmit, walkIn, autoApprove, setAutoApprove, isEmergency, setIsEmergency }} />
      </div>
      <footer className="mx-auto mt-12 max-w-6xl border-t border-border pt-5 text-xs text-muted-foreground">Visitor Management System · LEMIGAS</footer>
    </main>
  );
}

function FormContent({
  values,
  update,
  pics,
  picsLoading,
  locations,
  locationsLoading,
  errorMessage,
  isSubmitting,
  handleSubmit,
  walkIn,
  autoApprove,
  setAutoApprove,
  isEmergency,
  setIsEmergency,
}: {
  values: FormValues;
  update: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  pics: PicOption[];
  picsLoading: boolean;
  locations: Array<{ room_device_id: string; label: string }>;
  locationsLoading: boolean;
  errorMessage: string;
  isSubmitting: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  walkIn: boolean;
  autoApprove: boolean;
  setAutoApprove: (value: boolean) => void;
  isEmergency: boolean;
  setIsEmergency: (value: boolean) => void;
}) {
  const picUnavailable = !picsLoading && pics.length === 0;
  const locationUnavailable = !locationsLoading && locations.length === 0;
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><FileCheck2 className="size-[18px]" /></div>
          <div><h2 className="text-base font-semibold text-foreground">{walkIn ? "Data tamu walk-in" : "Formulir kunjungan"}</h2><p className="mt-1 text-sm text-muted-foreground">{walkIn ? "Lengkapi identitas dan jadwal akses tamu." : "Informasi bertanda bintang wajib diisi."}</p></div>
        </div>
      </div>
      {locationUnavailable ? (
        <EmptyState icon={<MapPin className="size-5" />} title="Lokasi kunjungan belum tersedia" description="Belum ada pintu dengan smart lock aktif. Hubungi administrator untuk mengatur gedung, lantai, ruangan, dan pintu." />
      ) : picUnavailable ? (
        <EmptyState icon={<UserRoundCheck className="size-5" />} title="PIC belum tersedia" description="Belum ada PIC aktif untuk dipilih. Hubungi administrator Ruang Telematika." />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 px-5 py-6 sm:px-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nama lengkap" htmlFor="visitor_name" required><TextInput id="visitor_name" required maxLength={160} autoComplete="name" value={values.visitor_name} onChange={(event) => update("visitor_name", event.target.value)} placeholder="Nama sesuai identitas" /></FormField>
            <FormField label="Nomor identitas" htmlFor="visitor_identity_no" required><TextInput id="visitor_identity_no" required maxLength={80} value={values.visitor_identity_no} onChange={(event) => update("visitor_identity_no", event.target.value)} placeholder="NIK atau nomor identitas" /></FormField>
            <FormField label="Asal instansi" htmlFor="visitor_institution" required><TextInput id="visitor_institution" required maxLength={160} autoComplete="organization" value={values.visitor_institution} onChange={(event) => update("visitor_institution", event.target.value)} placeholder="Nama perusahaan atau instansi" /></FormField>
            <FormField label="Nomor WhatsApp" htmlFor="visitor_phone" required><TextInput id="visitor_phone" required type="tel" maxLength={32} autoComplete="tel" value={values.visitor_phone} onChange={(event) => update("visitor_phone", event.target.value)} placeholder="+62 812 3456 7890" /></FormField>
            <FormField label="Email" htmlFor="visitor_email" required><TextInput id="visitor_email" required type="email" maxLength={254} autoComplete="email" value={values.visitor_email} onChange={(event) => update("visitor_email", event.target.value)} placeholder="nama@instansi.co.id" /></FormField>
            <FormField label="Lokasi kunjungan" htmlFor="room_device_id" required>
              <SelectField id="room_device_id" disabled={locationsLoading} value={values.room_device_id || locations[0]?.room_device_id} onValueChange={(value) => update("room_device_id", value)} placeholder={locationsLoading ? "Memuat lokasi..." : "Pilih pintu"} options={locations.map((location) => ({ value: location.room_device_id, label: location.label }))} />
            </FormField>
            <FormField label="PIC tujuan" htmlFor="pic_user_id" required>
              <SelectField id="pic_user_id" disabled={picsLoading} value={values.pic_user_id || undefined} onValueChange={(value) => update("pic_user_id", value)} placeholder={picsLoading ? "Memuat daftar PIC…" : "Pilih PIC Telematika"} options={pics.map((pic) => ({ value: pic.id, label: pic.full_name }))} />
            </FormField>
          </div>
          <FormField label="Tujuan kunjungan" htmlFor="purpose" required hint="Jelaskan kebutuhan atau agenda kunjungan secara singkat.">
            <Textarea id="purpose" required maxLength={4000} rows={3} value={values.purpose} onChange={(event) => update("purpose", event.target.value)} placeholder="Contoh: Koordinasi pemeliharaan perangkat jaringan" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Waktu mulai" htmlFor="scheduled_start" required><TextInput id="scheduled_start" type="datetime-local" required value={values.scheduled_start} onChange={(event) => update("scheduled_start", event.target.value)} /></FormField>
            <FormField label="Waktu selesai" htmlFor="scheduled_end" required><TextInput id="scheduled_end" type="datetime-local" required value={values.scheduled_end} onChange={(event) => update("scheduled_end", event.target.value)} /></FormField>
          </div>
          {walkIn && <div className="grid gap-3 rounded-lg border border-border bg-muted p-4 sm:grid-cols-2">
            <label className="flex items-start gap-2.5 text-sm text-foreground"><input type="checkbox" checked={autoApprove} onChange={(event) => setAutoApprove(event.target.checked)} className="mt-0.5 size-4 accent-foreground" /><span><span className="font-medium">Setujui langsung</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Mulai proses pembuatan PIN setelah data disimpan.</span></span></label>
            <label className="flex items-start gap-2.5 text-sm text-foreground"><input type="checkbox" checked={isEmergency} onChange={(event) => setIsEmergency(event.target.checked)} className="mt-0.5 size-4 accent-foreground" /><span><span className="font-medium">Kunjungan darurat</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Gunakan hanya untuk pemeliharaan darurat di luar jam operasional.</span></span></label>
          </div>}
          {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-xs leading-5 text-muted-foreground">Data digunakan untuk verifikasi kunjungan dan pengelolaan akses ruangan.</p>
          <Button type="submit" disabled={isSubmitting || picsLoading || locationsLoading || !values.pic_user_id || locations.length === 0} className="min-w-48 justify-between">{isSubmitting ? "Menyimpan…" : walkIn ? "Simpan pendaftaran" : "Kirim permohonan"}<ArrowRight className="size-4" /></Button>
          </div>
        </form>
      )}
    </Panel>
  );
}
