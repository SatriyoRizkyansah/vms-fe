import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("@/pages/HomePage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat...</div>}>
      <Routes>
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
