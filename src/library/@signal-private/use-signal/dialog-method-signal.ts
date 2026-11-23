import { dialog_signal, type DialogSignalType } from "./dialog-init-signal";

export type OpenDialogProps = DialogSignalType;

export function show_dialog(props: OpenDialogProps) {
  dialog_signal.value = { ...dialog_signal.value, ...props, open: true };
}

export function close_dialog() {
  dialog_signal.value = { ...dialog_signal.value, open: false, render_component: undefined };
}
