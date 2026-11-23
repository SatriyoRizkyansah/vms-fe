import { signal } from "@Signal/signal";

export type AlertSignalType = {
  open: boolean;
  severity: "success" | "error" | "warning" | "info";
  message: string;
  autoHideDuration: number;
  anchorOrigin: { vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" };
};

export const alert_signal = signal<AlertSignalType>({
  open: false,
  severity: "info",
  message: "",
  autoHideDuration: 3000,
  anchorOrigin: { vertical: "bottom", horizontal: "right" },
});

export function show_alert_snackbar(props: Partial<AlertSignalType>) {
  alert_signal.value = { ...alert_signal.value, ...props, open: true };
}

export function close_alert() {
  alert_signal.value = { ...alert_signal.value, open: false };
}
