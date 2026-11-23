import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ThemeProvider } from "./theme";
import { AlertSnackbar } from "@Signal/components/AlertSnackbar";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
        <AlertSnackbar />
      </BrowserRouter>
    </ThemeProvider>
  );
}
