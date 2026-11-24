export type VisitStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PROVISIONED"
  | "OFFLINE_FALLBACK"
  | "CHECKED_IN"
  | "REJECTED"
  | "COMPLETED"
  | "REVOKED"
  | "EXPIRED";

export type VisitRecord = {
  id: string;
  visit_code: string;
  visitor_name: string;
  visitor_identity_no: string;
  visitor_institution: string;
  visitor_phone: string;
  visitor_email: string;
  purpose: string;
  pic_user_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: VisitStatus;
  is_emergency?: boolean;
  created_at: string;
  approved_at?: string | null;
  checked_in_at?: string | null;
  completed_at?: string | null;
  rejection_reason?: string | null;
  provisioning_error?: string | null;
  pic?: { id: string; full_name: string; email?: string };
  room?: { id: string; room_name: string; connection_status: string; battery_level?: number | null };
  credential?: { pin_code_masked?: string; effective_from?: string; effective_until?: string; is_revoked?: boolean } | null;
};

export type VisitListResponse = {
  data: VisitRecord[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
};

export type PicOption = { id: string; full_name: string };

export const statusLabels: Record<VisitStatus, string> = {
  PENDING_APPROVAL: "Menunggu persetujuan",
  APPROVED: "Disetujui",
  PROVISIONED: "PIN aktif",
  OFFLINE_FALLBACK: "PIN offline",
  CHECKED_IN: "Sedang berkunjung",
  REJECTED: "Ditolak",
  COMPLETED: "Selesai",
  REVOKED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export const statusClasses: Record<VisitStatus, string> = {
  PENDING_APPROVAL: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-sky-200 bg-sky-50 text-sky-800",
  PROVISIONED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  OFFLINE_FALLBACK: "border-orange-200 bg-orange-50 text-orange-800",
  CHECKED_IN: "border-teal-200 bg-teal-50 text-teal-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
  COMPLETED: "border-slate-200 bg-slate-100 text-slate-700",
  REVOKED: "border-slate-200 bg-slate-100 text-slate-700",
  EXPIRED: "border-slate-200 bg-slate-100 text-slate-600",
};

const jakartaDate = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...options });

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : jakartaDate({ day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : jakartaDate({ hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return `${formatDate(value)} · ${formatTime(value)} WIB`;
}

export function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

export function getJakartaDayRange() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const date = `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`;
  return {
    start: new Date(`${date}T00:00:00+07:00`),
    end: new Date(`${date}T23:59:59.999+07:00`),
  };
}

export function getInitials(name?: string) {
  if (!name) return "VM";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
