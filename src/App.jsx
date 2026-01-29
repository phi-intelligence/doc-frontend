import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import EditorPage from './pages/EditorPage';
import HRIntegrationPage from './pages/HRIntegrationPage';
import FinancialManagementPage from './pages/FinancialManagementPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AppShell from './pages/app/AppShell';
import DashboardPage from './pages/app/DashboardPage';
import HRDashboard from './pages/app/hr/HRDashboard';
import HRSectionEditor from './pages/app/hr/HRSectionEditor';
import EmployeesDirectory from './pages/app/hr/EmployeesDirectory';
import OnboardingQueue from './pages/app/hr/OnboardingQueue';
import OnboardingDetail from './pages/app/hr/OnboardingDetail';
import FinanceDashboard from './pages/app/finance/FinanceDashboard';
import FinanceSectionEditor from './pages/app/finance/FinanceSectionEditor';
import ReportsQueue from './pages/app/finance/ReportsQueue';
import ReportDetail from './pages/app/finance/ReportDetail';
import LegalDashboard from './pages/app/legal/LegalDashboard';
import LegalSectionEditor from './pages/app/legal/LegalSectionEditor';
import DocsDashboard from './pages/app/DocsDashboard';

import './index.css';

/**
 * App - Main application component with routing
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Tools Grid */}
        <Route path="/" element={<LandingPage />} />

        {/* Chatbot Interface - supports ?skill= query param */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Dedicated Editor Interface */}
        <Route path="/editor" element={<EditorPage />} />


        {/* Connect - Redirect to chat with connect skill */}
        <Route path="/connect" element={<Navigate to="/chat?skill=connect" replace />} />

        {/* Demo Sections */}
        <Route path="/demo/hr" element={<Navigate to="/app/hr/editor" replace />} />
        <Route path="/demo/finance" element={<Navigate to="/app/finance/editor" replace />} />
        <Route path="/demo/legal" element={<Navigate to="/app/legal/editor" replace />} />

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
          
          {/* HR Workspace */}
          <Route path="hr" element={<HRDashboard />} />
          <Route path="hr/employees" element={<EmployeesDirectory />} />
          <Route path="hr/editor" element={<HRSectionEditor />} />
          <Route path="hr/onboarding" element={<OnboardingQueue />} />
          <Route path="hr/onboarding/:id" element={<OnboardingDetail />} />

          {/* Finance Workspace */}
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/editor" element={<FinanceSectionEditor />} />
          <Route path="finance/reports" element={<ReportsQueue />} />
          <Route path="finance/reports/:id" element={<ReportDetail />} />

          {/* Legal Workspace */}
          <Route path="legal" element={<LegalDashboard />} />
          <Route path="legal/editor" element={<LegalSectionEditor />} />
          
          <Route path="docs" element={<DocsDashboard />} />

          <Route index element={<Navigate to="/app/dashboard" replace />} />
        </Route>

        {/* Fallback - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;