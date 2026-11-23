import { useEffect } from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { useSignalValue } from "@Signal/hooks";
import { alert_signal, close_alert } from "@Signal/use-signal/snackbar_signal";

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

export function AlertSnackbar() {
  const alert = useSignalValue(alert_signal);

  useEffect(() => {
    if (!alert.open) return;
    const timeout = window.setTimeout(close_alert, alert.autoHideDuration);
    return () => window.clearTimeout(timeout);
  }, [alert.open, alert.message, alert.autoHideDuration]);

  if (!alert.open) return null;
  const Icon = icons[alert.severity];

  return (
    <div role="status" className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-lg">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-sm">{alert.message}</p>
      <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={close_alert} aria-label="Tutup notifikasi">
        <X className="size-4" />
      </button>
    </div>
  );
}
