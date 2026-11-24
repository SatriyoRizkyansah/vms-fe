import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, Panel, SelectField, TextInput } from "@/components/vms/primitives";
import { VisitTable } from "@/components/vms/VisitTable";
import VisitDetailsPanel from "@/components/vms/VisitDetailsPanel";
import use_query from "@/hook/api-use-query";
import { statusLabels, type VisitListResponse, type VisitRecord, type VisitStatus } from "@/utils/vms";

const statusOptions: Array<{ value: VisitStatus | "all"; label: string }> = [
  { value: "all", label: "Semua status" },
  { value: "PENDING_APPROVAL", label: statusLabels.PENDING_APPROVAL },
  { value: "APPROVED", label: statusLabels.APPROVED },
  { value: "PROVISIONED", label: statusLabels.PROVISIONED },
  { value: "OFFLINE_FALLBACK", label: statusLabels.OFFLINE_FALLBACK },
  { value: "CHECKED_IN", label: statusLabels.CHECKED_IN },
  { value: "COMPLETED", label: statusLabels.COMPLETED },
  { value: "REJECTED", label: statusLabels.REJECTED },
  { value: "REVOKED", label: statusLabels.REVOKED },
  { value: "EXPIRED", label: statusLabels.EXPIRED },
];

export default function VisitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") as VisitStatus | null;
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState<VisitStatus | "">(statusOptions.some((option) => option.value === initialStatus) ? initialStatus ?? "" : "");
  const [page, setPage] = useState(1);
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSubmittedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = use_query({
    api_tag: "visits",
    api_method: "visitsControllerFindAll",
    api_query: [{ page, limit: 20, ...(status ? { status } : {}), ...(submittedSearch ? { search: submittedSearch } : {}) } as never],
  });
  const result = query.response as VisitListResponse | null;
  const visits = result?.data ?? [];
  const pagination = result?.pagination;
  const pageCount = pagination?.total_pages ?? 1;

  function changeStatus(value: VisitStatus | "") {
    setStatus(value);
    setPage(1);
    if (value) setSearchParams({ status: value }); else setSearchParams({});
  }

  return (
    <>
      <PageHeading eyebrow="Operasional" title="Daftar kunjungan" description="Cari pengunjung, tinjau status permohonan, dan kelola akses ruangan." action={<Link to="/app/walk-in"><Button className="gap-2"><Plus className="size-4" />Tamu walk-in</Button></Link>} />

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-[310px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <TextInput value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari nama, instansi, atau kode…" className="pl-9 pr-9" aria-label="Cari kunjungan" />
              {search && <button onClick={() => setSearch("")} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
            </div>
            <div className="relative min-w-0 sm:w-56">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <SelectField ariaLabel="Filter status" value={status || "all"} onValueChange={(value) => changeStatus(value === "all" ? "" : value as VisitStatus)} options={statusOptions} placeholder="Semua status" className="pl-9" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{pagination ? <>{pagination.total.toLocaleString("id-ID")} kunjungan · Halaman {pagination.page} dari {Math.max(pageCount, 1)}</> : "Memuat data kunjungan…"}</div>
        </div>
        <VisitTable visits={visits} isLoading={query.is_loading} onSelect={setSelectedVisit} emptyTitle="Kunjungan tidak ditemukan" emptyDescription={submittedSearch || status ? "Ubah kata kunci atau filter status untuk melihat hasil lain." : "Belum ada kunjungan yang terdaftar."} />
        <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-foreground">Menampilkan {visits.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, pagination?.total ?? 0)} dari {(pagination?.total ?? 0).toLocaleString("id-ID")}</p>
          <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || query.is_loading} onClick={() => setPage((value) => Math.max(value - 1, 1))}><ChevronLeft className="size-4" /><span className="hidden sm:inline">Sebelumnya</span></Button><Button variant="outline" size="sm" disabled={page >= pageCount || query.is_loading} onClick={() => setPage((value) => value + 1)}><span className="hidden sm:inline">Berikutnya</span><ChevronRight className="size-4" /></Button></div>
        </div>
      </Panel>
      {selectedVisit && <VisitDetailsPanel visit={selectedVisit} onClose={() => setSelectedVisit(null)} onChanged={query.call_back} />}
    </>
  );
}
