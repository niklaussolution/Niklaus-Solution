import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./app/App";
import { AuthProvider } from "./admin/context/AuthContext";
import { ProtectedRoute } from "./admin/components/ProtectedRoute";
import { LoginPage } from "./admin/pages/LoginPage";
import { Dashboard } from "./admin/pages/Dashboard";
import { WorkshopsManagement } from "./admin/pages/WorkshopManagement";
import { PricingManagement } from "./admin/pages/PricingManagement";
import { RegistrationsManagement } from "./admin/pages/RegistrationsManagement";
import { TrainersManagement } from "./admin/pages/TrainersManagement";
import { TestimonialsManagement } from "./admin/pages/TestimonialsManagement";
import { FeaturesManagement } from "./admin/pages/FeaturesManagement";
import { ScholarshipsManagement } from "./admin/pages/ScholarshipsManagement";
import { CompaniesManagement } from "./admin/pages/CompaniesManagement";
import { FAQManagement } from "./admin/pages/FAQManagement";
import { ContentManagement } from "./admin/pages/ContentManagement";
import { VideoManagement } from "./admin/pages/VideoManagement";
import { UserManagement } from "./admin/pages/UserManagement";
import { AdminManagement } from "./admin/pages/AdminManagement";
import { Settings } from "./admin/pages/Settings";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/workshops"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <WorkshopsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <PricingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <RegistrationsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <TrainersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <TestimonialsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/features"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <FeaturesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/scholarships"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <ScholarshipsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <CompaniesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faqs"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <FAQManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <ContentManagement />
            </ProtectedRoute>
          }
        /><Route
          path="/admin/videos"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <VideoManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <ProtectedRoute requiredRole={["super_admin"]}>
              <AdminManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole={["super_admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
  