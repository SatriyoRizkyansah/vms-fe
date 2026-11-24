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
  room?: {
    id: string;
    room_name: string;
    connection_status: string;
    battery_level?: number | null;
    door?: {
      name: string;
      room?: {
        name: string;
        floor?: { name: string; building?: { name: string } | null } | null;
      } | null;
    } | null;
  } | null;
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

export const statusVariants: Record<VisitStatus, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING_APPROVAL: "secondary",
  APPROVED: "outline",
  PROVISIONED: "default",
  OFFLINE_FALLBACK: "outline",
  CHECKED_IN: "default",
  REJECTED: "destructive",
  COMPLETED: "secondary",
  REVOKED: "secondary",
  EXPIRED: "outline",
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
