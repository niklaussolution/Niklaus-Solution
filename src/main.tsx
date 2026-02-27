import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import App from "./app/App";
import { AuthProvider } from "./admin/context/AuthContext";
import { ProtectedRoute } from "./admin/components/ProtectedRoute";
import { LoginPage } from "./admin/pages/LoginPage";
import { WorkshopsManagement } from "./admin/pages/WorkshopManagement";
import { PricingManagement } from "./admin/pages/PricingManagement";
import { RegistrationsManagement } from "./admin/pages/RegistrationsManagement";
import { TrainersManagement } from "./admin/pages/TrainersManagement";
import { TestimonialsManagement } from "./admin/pages/TestimonialsManagement";
import { StudentProjectsManagement } from "./admin/pages/StudentProjectsManagement";
import { FeaturesManagement } from "./admin/pages/FeaturesManagement";
import { ScholarshipsManagement } from "./admin/pages/ScholarshipsManagement";
import { CompaniesManagement } from "./admin/pages/CompaniesManagement";
import { FAQManagement } from "./admin/pages/FAQManagement";
import { ContentManagement } from "./admin/pages/ContentManagement";
import { VideoManagement } from "./admin/pages/VideoManagement";
import { CertificatesManagement } from "./admin/pages/CertificatesManagement";

import { AdminManagement } from "./admin/pages/AdminManagement";
import { Settings } from "./admin/pages/Settings";
import { JourneyManagement } from "./admin/pages/JourneyManagement";
import { ContactSubmissionsManagement } from "./admin/pages/ContactSubmissionsManagement";
import { ShippingPolicy } from "./app/pages/ShippingPolicy";
import { TermsAndConditions } from "./app/pages/TermsAndConditions";
import { CancellationsAndRefunds } from "./app/pages/CancellationsAndRefunds";
import { PrivacyPolicy } from "./app/pages/PrivacyPolicy";
import { Contact } from "./app/pages/Contact";
import { StudentLogin } from "./app/pages/StudentLogin";
import { StudentSignup } from "./app/pages/StudentSignup";
import { StudentDashboard } from "./app/pages/StudentDashboard";
import { StudentProvider } from "./app/context/StudentContext";
import { StudentProtectedRoute } from "./app/components/StudentProtectedRoute";
/* import MyCertificates from "./app/pages/MyCertificates"; */
import "./styles/index.css";

// ScrollToTop component to handle route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <StudentProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/contact" element={<Contact />} />
          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route
            path="/student/dashboard"
            element={
              <StudentProtectedRoute>
                <StudentDashboard />
              </StudentProtectedRoute>
            }
          />
        {/* Redirect legacy /my-certificates route to the Certificates section on Home */}
        <Route path="/my-certificates" element={<Navigate to="/#certificates" replace />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cancellations-and-refunds" element={<CancellationsAndRefunds />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/admin" element={<Navigate to="/admin/workshops" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
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
          path="/admin/student-projects"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <StudentProjectsManagement />
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
        />
        <Route
          path="/admin/journeys"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <JourneyManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <VideoManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <CertificatesManagement />
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
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contact-submissions"
          element={
            <ProtectedRoute requiredRole={["super_admin", "editor"]}>
              <ContactSubmissionsManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
      </StudentProvider>
    </AuthProvider>
  </BrowserRouter>
);
  