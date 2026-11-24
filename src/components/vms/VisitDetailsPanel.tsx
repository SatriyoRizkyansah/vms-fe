import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Battery, CalendarClock, Check, CheckCheck, Clock3, KeyRound, Mail, Phone, RefreshCw, ShieldAlert, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, LoadingLine, StatusBadge, TextInput } from "@/components/vms/primitives";
import use_mutation from "@/hook/api-use-mutation";
import use_query from "@/hook/api-use-query";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";
import { formatDateTime, type VisitRecord } from "@/utils/vms";

export default function VisitDetailsPanel({ visit, onClose, onChanged }: { visit: VisitRecord; onClose: () => void; onChanged: () => void }) {
  const auth = useSignalValue(auth_signal);
  const [isWorking, setIsWorking] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
  const canManage = auth.user?.role !== "AUDITOR";
  const detailQuery = use_query({ api_tag: "visits", api_method: "visitsControllerFindOne", api_query: [visit.id] });
  const refresh = () => { onChanged(); detailQuery.call_back(); };
  const sharedOptions = { should_disable_loading: true, call_back: refresh };
  const approveMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerApprove", options: { ...sharedOptions, success_message_text: "Permohonan disetujui." } });
  const rejectMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerReject", options: { ...sharedOptions, success_message_text: "Permohonan ditolak." } });
  const provisionMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerRetryProvision", options: { ...sharedOptions, success_message_text: "Provisioning PIN dimulai." } });
  const checkInMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerManualCheckIn", options: { ...sharedOptions, success_message_text: "Check-in tamu dicatat." } });
  const checkOutMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerCheckOut", options: { ...sharedOptions, success_message_text: "Tamu berhasil check-out." } });
  const extendMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerExtend", options: { ...sharedOptions, success_message_text: "Waktu kunjungan berhasil diperpanjang." } });
  const revokeMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerRevoke", options: { ...sharedOptions, success_message_text: "Akses kunjungan dicabut." } });
  const retryNotificationMutation = use_mutation({ api_tag: "visits", api_method: "visitsControllerRetryNotifications", options: { ...sharedOptions, success_message_text: "Pengiriman notifikasi diulang." } });
  const current = (detailQuery.response as VisitRecord | null) ?? visit;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function run(action: () => Promise<unknown>) {
    if (isWorking) return;
    setIsWorking(true);
    await action();
    setIsWorking(false);
  }

  async function rejectVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectReason.trim()) return;
    await run(() => rejectMutation([current.id, { reason: rejectReason.trim() }]));
    setShowReject(false);
  }

  const canApprove = current.status === "PENDING_APPROVAL";
  const canProvision = current.status === "APPROVED";
  const canCheckIn = ["APPROVED", "PROVISIONED", "OFFLINE_FALLBACK"].includes(current.status);
  const canCheckOut = current.status === "CHECKED_IN";
  const canRevoke = ["PENDING_APPROVAL", "APPROVED", "PROVISIONED"].includes(current.status);
  const canExtend = current.status === "CHECKED_IN";
  const canRetryNotification = ["PROVISIONED", "OFFLINE_FALLBACK"].includes(current.status);
  const isActive = canApprove || canProvision || canCheckIn || canCheckOut;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="visit-detail-title" className="flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
          <div><p className="font-mono text-xs text-slate-400">{current.visit_code}</p><h2 id="visit-detail-title" className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">Detail kunjungan</h2></div>
          <Button variant="ghost" size="icon" aria-label="Tutup detail" onClick={onClose}><X className="size-4" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {detailQuery.is_loading && !detailQuery.response && <LoadingLine label="Memuat detail kunjungan…" />}
          {detailQuery.error && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Detail belum dimuat; informasi ringkas ditampilkan.</div>}
          <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={current.status} />{current.is_emergency && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"><ShieldAlert className="size-3.5" />Darurat</span>}</div>

          <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Informasi tamu</h3>
            <div className="mt-4 grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <DetailField icon={<UserRound />} label="Nama lengkap" value={current.visitor_name} />
              <DetailField icon={<span className="text-xs font-semibold">ID</span>} label="Nomor identitas" value={current.visitor_identity_no} />
              <DetailField icon={<Phone />} label="Nomor WhatsApp" value={current.visitor_phone} />
              <DetailField icon={<Mail />} label="Email" value={current.visitor_email} />
              <DetailField icon={<UserRound />} label="Asal instansi" value={current.visitor_institution} />
              <DetailField icon={<UserRound />} label="PIC tujuan" value={current.pic?.full_name ?? "PIC Telematika"} />
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4"><p className="text-xs text-slate-500">Tujuan kunjungan</p><p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-800">{current.purpose}</p></div>
          </section>

          <section className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Jadwal dan akses</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailField icon={<CalendarClock />} label="Mulai" value={formatDateTime(current.scheduled_start)} />
              <DetailField icon={<Clock3 />} label="Selesai" value={formatDateTime(current.scheduled_end)} />
              <DetailField icon={<KeyRound />} label="PIN tamu" value={current.credential?.pin_code_masked ?? (current.status === "PENDING_APPROVAL" ? "Belum tersedia" : "Tidak tersedia")} />
              <DetailField icon={<Battery />} label="Perangkat" value={current.room?.room_name ?? "Smart lock Ruang Telematika"} />
            </div>
            {current.rejection_reason && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-800">Alasan penolakan: {current.rejection_reason}</p>}
            {current.provisioning_error && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">Provisioning: {current.provisioning_error}</p>}
          </section>

          {showReject && canApprove && <form onSubmit={rejectVisit} className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4"><h3 className="text-sm font-semibold text-rose-900">Tolak permohonan</h3><div className="mt-3"><FormField label="Alasan penolakan" htmlFor="reject-reason" required><TextInput id="reject-reason" required value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Jelaskan alasan kepada pemohon" /></FormField></div><div className="mt-3 flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setShowReject(false)}>Batal</Button><Button type="submit" size="sm" variant="destructive" disabled={isWorking}>Tolak permohonan</Button></div></form>}

          {showRevokeConfirmation && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-900">Cabut akses kunjungan ini?</p><p className="mt-1 text-xs leading-5 text-rose-800">PIN yang sudah dibuat akan dicabut dari smart lock.</p><div className="mt-3 flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setShowRevokeConfirmation(false)}>Batal</Button><Button variant="destructive" size="sm" disabled={isWorking} onClick={() => run(() => revokeMutation([current.id])).then(() => setShowRevokeConfirmation(false))}>Ya, cabut akses</Button></div></div>}
        </div>

        <footer className="border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          {!canManage ? <p className="text-center text-xs text-slate-500">Akun auditor memiliki akses baca saja.</p> : isActive ? <div className="flex flex-wrap gap-2">
            {canApprove && <Button disabled={isWorking} onClick={() => run(() => approveMutation([current.id]))}><Check className="size-4" />Setujui</Button>}
            {canApprove && <Button variant="outline" disabled={isWorking} onClick={() => setShowReject(true)}>Tolak</Button>}
            {canProvision && <Button disabled={isWorking} onClick={() => run(() => provisionMutation([current.id]))}><RefreshCw className="size-4" />Coba buat PIN</Button>}
            {canCheckIn && <Button variant="secondary" disabled={isWorking} onClick={() => run(() => checkInMutation([current.id, { reason: "Kehadiran tamu diverifikasi langsung oleh petugas." }]))}><CheckCheck className="size-4" />Catat check-in</Button>}
            {canExtend && <><Button variant="outline" disabled={isWorking} onClick={() => run(() => extendMutation([current.id, { minutes: 30 }]))}>Tambah 30 menit</Button><Button variant="outline" disabled={isWorking} onClick={() => run(() => extendMutation([current.id, { minutes: 60 }]))}>Tambah 60 menit</Button><Button variant="destructive" disabled={isWorking} onClick={() => run(() => checkOutMutation([current.id]))}>Check-out</Button></>}
            {canRetryNotification && <Button variant="outline" disabled={isWorking} onClick={() => run(() => retryNotificationMutation([current.id]))}>Ulangi notifikasi</Button>}
            {canRevoke && <Button variant="ghost" disabled={isWorking} onClick={() => setShowRevokeConfirmation(true)} className="ml-auto text-rose-700 hover:bg-rose-50 hover:text-rose-800">Cabut akses</Button>}
          </div> : <p className="text-center text-xs text-slate-500">Tidak ada tindakan lanjutan untuk status kunjungan ini.</p>}
        </footer>
      </aside>
    </div>
  );
}

function DetailField({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return <div className="flex min-w-0 gap-2.5"><span className="mt-0.5 shrink-0 text-slate-400 [&_svg]:size-4">{icon}</span><div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-800">{value || "—"}</p></div></div>;
}
