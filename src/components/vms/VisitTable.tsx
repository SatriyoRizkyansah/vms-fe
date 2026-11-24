import { ArrowUpRight, Building2, CalendarClock } from "lucide-react";
import { EmptyState, LoadingLine, StatusBadge } from "@/components/vms/primitives";
import { formatDate, formatTime, type VisitRecord } from "@/utils/vms";

export function VisitTable({
  visits,
  isLoading,
  onSelect,
  emptyTitle = "Belum ada kunjungan",
  emptyDescription = "Permohonan kunjungan akan muncul di sini.",
}: {
  visits: VisitRecord[];
  isLoading: boolean;
  onSelect: (visit: VisitRecord) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isLoading && visits.length === 0) return <LoadingLine label="Memuat daftar kunjungan…" />;
  if (visits.length === 0) return <EmptyState icon={<CalendarClock className="size-5" />} title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            <th className="px-5 py-3.5">Tamu</th>
            <th className="px-5 py-3.5">Jadwal</th>
            <th className="px-5 py-3.5">PIC tujuan</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5"><span className="sr-only">Detail</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visits.map((visit) => (
            <tr key={visit.id} onClick={() => onSelect(visit)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(visit); } }} tabIndex={0} role="button" className="cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-teal-50/50 focus-visible:outline-none">
              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">{visit.visitor_name}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Building2 className="size-3.5" />{visit.visitor_institution}</div>
                <p className="mt-1.5 font-mono text-[11px] text-slate-400">{visit.visit_code}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-slate-800">{formatDate(visit.scheduled_start)}</p>
                <p className="mt-1 text-xs text-slate-500">{formatTime(visit.scheduled_start)}–{formatTime(visit.scheduled_end)} WIB</p>
              </td>
              <td className="px-5 py-4"><span className="text-sm text-slate-700">{visit.pic?.full_name ?? "PIC Telematika"}</span></td>
              <td className="px-5 py-4"><StatusBadge status={visit.status} /></td>
              <td className="px-5 py-4 text-right"><ArrowUpRight className="ml-auto size-4 text-slate-400" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
