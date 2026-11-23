import type { ReactNode } from "react";
import { signal } from "@Signal/signal";

export type DialogSignalType = {
  open?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  render_component?: ReactNode;
};

export const dialog_signal = signal<DialogSignalType>({ open: false });
