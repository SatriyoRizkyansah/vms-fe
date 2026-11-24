import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const AppLayout = lazy(() => import("@/pages/AppLayout"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const DevicesPage = lazy(() => import("@/pages/DevicesPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const LocationsPage = lazy(() => import("@/pages/LocationsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const VisitRequestFormPage = lazy(() => import("@/pages/VisitRequestFormPage"));
const VisitsPage = lazy(() => import("@/pages/VisitsPage"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Memuat halaman…</div>}>
      <Routes>
        <Route path="/" element={<VisitRequestFormPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="walk-in" element={<VisitRequestFormPage walkIn />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<VisitRequestFormPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
