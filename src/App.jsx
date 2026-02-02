import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import EditorPage from './pages/EditorPage';
import CompanyRegistrationPage from './pages/CompanyRegistrationPage';
import HRIntegrationPage from './pages/HRIntegrationPage';
import FinancialManagementPage from './pages/FinancialManagementPage';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';
import AppShell from './pages/app/AppShell';
import DashboardPage from './pages/app/DashboardPage';
import HRDashboard from './pages/app/hr/HRDashboard';
import RoleEditorPage from './pages/app/shared/RoleEditorPage';
import EmployeesDirectory from './pages/app/hr/EmployeesDirectory';
import OnboardingQueue from './pages/app/hr/OnboardingQueue';
import OnboardingDetail from './pages/app/hr/OnboardingDetail';
import OnboardingNew from './pages/app/hr/OnboardingNew';
import CandidatesList from './pages/app/hr/CandidatesList';
import CandidateDetail from './pages/app/hr/CandidateDetail';
import CandidateNew from './pages/app/hr/CandidateNew';
import FinanceDashboard from './pages/app/finance/FinanceDashboard';
import ReportsQueue from './pages/app/finance/ReportsQueue';
import ReportDetail from './pages/app/finance/ReportDetail';
import LegalDashboard from './pages/app/legal/LegalDashboard';
import DocsDashboard from './pages/app/DocsDashboard';
import ChatWorkspacePage from './pages/app/ChatWorkspacePage';
import MarketingDashboard from './pages/app/marketing/MarketingDashboard';

// Insurance pages
import InsuranceDashboard from './pages/app/insurance/InsuranceDashboard';
import PoliciesPage from './pages/app/insurance/PoliciesPage';
import ClaimsPage from './pages/app/insurance/ClaimsPage';
import ClaimDetail from './pages/app/insurance/ClaimDetail';

// Medical pages
import MedicalDashboard from './pages/app/medical/MedicalDashboard';
import PatientsPage from './pages/app/medical/PatientsPage';
import PatientDetail from './pages/app/medical/PatientDetail';
import AppointmentsPage from './pages/app/medical/AppointmentsPage';
import ScheduleView from './pages/app/medical/ScheduleView';

import './index.css';

/** Redirect /app to /app/dashboard or /app/{module} based on user.module */
function AppIndexRedirect() {
  const { user } = useAuth();
  const module = user?.module;
  if (module && ['hr', 'finance', 'legal', 'marketing', 'insurance', 'medical'].includes(module)) {
    return <Navigate to={`/app/${module}`} replace />;
  }
  return <Navigate to="/app/dashboard" replace />;
}

/**
 * App - Main application component with routing
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Tools Grid */}
        <Route path="/" element={<LandingPage />} />

        {/* Company Registration */}
        <Route path="/register" element={<CompanyRegistrationPage />} />

        {/* Chatbot Interface - supports ?skill= query param */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Dedicated Editor Interface */}
        <Route path="/editor" element={<EditorPage />} />


        {/* Connect - Redirect to chat with connect skill */}
        <Route path="/connect" element={<Navigate to="/chat?skill=connect" replace />} />

        {/* Demo Sections - redirect to standalone editor routes */}
        <Route path="/demo/hr" element={<Navigate to="/hr/editor" replace />} />
        <Route path="/demo/finance" element={<Navigate to="/finance/editor" replace />} />
        <Route path="/demo/legal" element={<Navigate to="/legal/editor" replace />} />
        <Route path="/demo/marketing" element={<Navigate to="/marketing/editor" replace />} />
        <Route path="/demo/insurance" element={<Navigate to="/insurance/editor" replace />} />
        <Route path="/demo/medical" element={<Navigate to="/medical/editor" replace />} />

        {/* Standalone Editor Routes (full-page, outside AppShell) */}
        <Route path="/hr/editor" element={<ProtectedRoute><RoleEditorPage module="hr" /></ProtectedRoute>} />
        <Route path="/finance/editor" element={<ProtectedRoute><RoleEditorPage module="finance" /></ProtectedRoute>} />
        <Route path="/legal/editor" element={<ProtectedRoute><RoleEditorPage module="legal" /></ProtectedRoute>} />
        <Route path="/marketing/editor" element={<ProtectedRoute><RoleEditorPage module="marketing" /></ProtectedRoute>} />
        <Route path="/insurance/editor" element={<ProtectedRoute><RoleEditorPage module="insurance" /></ProtectedRoute>} />
        <Route path="/medical/editor" element={<ProtectedRoute><RoleEditorPage module="medical" /></ProtectedRoute>} />

        {/* General Page (standalone, protected) - Full ChatPage experience */}
        <Route path="/general" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Company App (protected) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatWorkspacePage />} />

          {/* HR Workspace */}
          <Route path="hr" element={<HRDashboard />} />
          <Route path="hr/employees" element={<EmployeesDirectory />} />
          <Route path="hr/candidates" element={<CandidatesList />} />
          <Route path="hr/candidates/new" element={<CandidateNew />} />
          <Route path="hr/candidates/:id" element={<CandidateDetail />} />
          {/* HR editor moved to standalone route /hr/editor */}
          <Route path="hr/onboarding" element={<OnboardingQueue />} />
          <Route path="hr/onboarding/new" element={<OnboardingNew />} />
          <Route path="hr/onboarding/:id" element={<OnboardingDetail />} />

          {/* Finance Workspace */}
          <Route path="finance" element={<FinanceDashboard />} />
          {/* Finance editor moved to standalone route /finance/editor */}
          <Route path="finance/reports" element={<ReportsQueue />} />
          <Route path="finance/reports/:id" element={<ReportDetail />} />

          {/* Legal Workspace */}
          <Route path="legal" element={<LegalDashboard />} />
          {/* Legal editor moved to standalone route /legal/editor */}
          
          <Route path="docs" element={<DocsDashboard />} />

          {/* Marketing (sidebar entry for module users) */}
          <Route path="marketing" element={<MarketingDashboard />} />
          {/* Marketing editor moved to standalone route /marketing/editor */}

          {/* Insurance Workspace */}
          <Route path="insurance" element={<InsuranceDashboard />} />
          <Route path="insurance/policies" element={<PoliciesPage />} />
          <Route path="insurance/policies/:policyId" element={<ClaimDetail />} />
          <Route path="insurance/claims" element={<ClaimsPage />} />
          <Route path="insurance/claims/:claimId" element={<ClaimDetail />} />
          {/* Insurance editor moved to standalone route /insurance/editor */}

          {/* Medical Workspace */}
          <Route path="medical" element={<MedicalDashboard />} />
          <Route path="medical/patients" element={<PatientsPage />} />
          <Route path="medical/patients/new" element={<PatientsPage />} />
          <Route path="medical/patients/:patientId" element={<PatientDetail />} />
          <Route path="medical/appointments" element={<AppointmentsPage />} />
          <Route path="medical/appointments/new" element={<AppointmentsPage />} />
          <Route path="medical/schedule" element={<ScheduleView />} />
          {/* Medical editor moved to standalone route /medical/editor */}

          <Route index element={<AppIndexRedirect />} />
        </Route>

        {/* Fallback - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;