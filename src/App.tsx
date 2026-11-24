import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { AlertSnackbar } from "@Signal/components/AlertSnackbar";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <AlertSnackbar />
    </BrowserRouter>
  );
}
