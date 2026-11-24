import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AlertSnackbar } from "@Signal/components/AlertSnackbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppRoutes />
        <AlertSnackbar />
      </TooltipProvider>
    </BrowserRouter>
  );
}
