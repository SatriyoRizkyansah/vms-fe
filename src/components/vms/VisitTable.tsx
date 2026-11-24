import { ArrowUpRight, Building2, CalendarClock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <Table className="min-w-[760px] text-left">
        <TableHeader>
          <TableRow className="bg-muted/50 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:bg-muted/50">
            <TableHead className="px-5 py-3.5">Tamu</TableHead>
            <TableHead className="px-5 py-3.5">Jadwal</TableHead>
            <TableHead className="px-5 py-3.5">PIC tujuan</TableHead>
            <TableHead className="px-5 py-3.5">Status</TableHead>
            <TableHead className="px-5 py-3.5"><span className="sr-only">Detail</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id} onClick={() => onSelect(visit)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(visit); } }} tabIndex={0} role="button" className="cursor-pointer focus-visible:bg-muted/70 focus-visible:outline-none">
              <TableCell className="px-5 py-4">
                <p className="text-sm font-semibold text-foreground">{visit.visitor_name}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="size-3.5" />{visit.visitor_institution}</div>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">{visit.visit_code}</p>
              </TableCell>
              <TableCell className="px-5 py-4">
                <p className="text-sm font-medium text-foreground">{formatDate(visit.scheduled_start)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatTime(visit.scheduled_start)}–{formatTime(visit.scheduled_end)} WIB</p>
              </TableCell>
              <TableCell className="px-5 py-4"><span className="text-sm text-foreground">{visit.pic?.full_name ?? "PIC Telematika"}</span></TableCell>
              <TableCell className="px-5 py-4"><StatusBadge status={visit.status} /></TableCell>
              <TableCell className="px-5 py-4 text-right"><ArrowUpRight className="ml-auto size-4 text-muted-foreground" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
    </Table>
  );
}
