import { useState } from "react";
import { Download, FileSpreadsheet, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField, PageHeading, Panel, TextInput } from "@/components/vms/primitives";
import { auth_signal } from "@Signal/use-signal/auth-init-signal";
import { useSignalValue } from "@Signal/hooks";

const reportTypes = [
  { id: "visits.csv", title: "Data kunjungan", description: "Daftar permohonan, status, PIC, dan jadwal kunjungan.", format: "CSV", icon: FileSpreadsheet },
  { id: "visits.pdf", title: "Ringkasan kunjungan", description: "Dokumen ringkasan kunjungan yang siap dibagikan.", format: "PDF", icon: FileText },
  { id: "door-audit.csv", title: "Audit akses pintu", description: "Event pembukaan pintu dan status smart lock.", format: "CSV", icon: FileSpreadsheet },
  { id: "door-audit.pdf", title: "Laporan audit akses", description: "Ringkasan event akses pintu untuk kebutuhan tinjauan.", format: "PDF", icon: FileText },
];

export default function ReportsPage() {
  const auth = useSignalValue(auth_signal);
  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
  const [to, setTo] = useState(now.toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function downloadReport(reportId: string) {
    setErrorMessage("");
    setDownloading(reportId);
    try {
      const fromDate = new Date(`${from}T00:00:00+07:00`).toISOString();
      const toDate = new Date(`${to}T23:59:59.999+07:00`).toISOString();
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const response = await fetch(`/api/v1/reports/${reportId}?${params.toString()}`, {
        headers: { authorization: `Bearer ${auth.selectedToken ?? ""}` },
      });
      if (!response.ok) {
        let message = "Laporan belum dapat diunduh.";
        try { const body = await response.json(); message = body.message ?? message; } catch { /* response may not be JSON */ }
        throw new Error(Array.isArray(message) ? message.join(", ") : message);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? `vms-${reportId.replace(".", "-")}`;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat mengunduh laporan.");
    } finally {
      setDownloading("");
    }
  }

  const invalidDateRange = !from || !to || from > to;
  if (auth.user?.role !== "ADMIN" && auth.user?.role !== "AUDITOR") {
    return <Panel className="p-8 text-center"><ShieldCheck className="mx-auto size-7 text-muted-foreground" /><h1 className="mt-3 text-base font-semibold text-foreground">Akses laporan terbatas</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Laporan operasional hanya tersedia untuk akun Admin dan Auditor.</p></Panel>;
  }
  return (
    <>
      <PageHeading eyebrow="Pelaporan dan audit" title="Laporan operasional" description="Unduh data kunjungan atau event akses pintu sesuai rentang waktu yang dipilih." />
      <Panel className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="text-sm font-semibold text-foreground">Rentang laporan</h2><p className="mt-1 text-xs text-muted-foreground">Waktu menggunakan zona Asia/Jakarta (WIB).</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:w-[440px]">
            <FormField label="Dari tanggal" htmlFor="report-from"><TextInput id="report-from" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></FormField>
            <FormField label="Sampai tanggal" htmlFor="report-to"><TextInput id="report-to" type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></FormField>
          </div>
        </div>
      </Panel>
      {errorMessage && <Alert variant="destructive" className="mb-5"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
      <div className="grid gap-4 xl:grid-cols-2">
        {reportTypes.map(({ id, title, description, format, icon: Icon }) => <Panel key={id} className="flex flex-col justify-between p-5 sm:p-6"><div className="flex items-start gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground"><Icon className="size-5" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold text-foreground">{title}</h2><span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">{format}</span></div><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p></div></div><div className="mt-6 flex items-center justify-between border-t border-border pt-4"><span className="text-xs text-muted-foreground">{from} — {to}</span><Button size="sm" variant="outline" disabled={invalidDateRange || Boolean(downloading)} onClick={() => downloadReport(id)}>{downloading === id ? "Menyiapkan…" : "Unduh laporan"}{downloading === id ? <span className="ml-1 size-3.5 animate-spin rounded-full border-2 border-border border-t-primary" /> : <Download className="size-3.5" />}</Button></div></Panel>)}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5"><ShieldCheck className="mt-0.5 size-4 text-foreground" /><p className="text-xs leading-5 text-muted-foreground">Ekspor laporan mengikuti hak akses akun dan menyertakan data sesuai periode yang dipilih.</p></div>
    </>
  );
}
