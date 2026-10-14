import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { StudentResumeSubmissionPage } from './pages/StudentResumeSubmissionPage';
import { ManagerLoginPage } from './pages/ManagerLoginPage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';
import { ManagerCollegesPage } from './pages/ManagerCollegesPage';
import { ManagerJobRolesPage } from './pages/ManagerJobRolesPage';
import { ManagerCandidatesPage } from './pages/ManagerCandidatesPage';
import { ManagerShortlistedPage } from './pages/ManagerShortlistedPage';
import { ManagerAssessmentsPage } from './pages/ManagerAssessmentsPage';
import { ManagerReportsPage } from './pages/ManagerReportsPage';
import { ManagerSettingsPage } from './pages/ManagerSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit-resume" element={<StudentResumeSubmissionPage />} />
          <Route path="/manager/login" element={<ManagerLoginPage />} />

          {/* Protected Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <ManagerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/colleges"
            element={
              <ProtectedRoute>
                <ManagerCollegesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/job-roles"
            element={
              <ProtectedRoute>
                <ManagerJobRolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/candidates"
            element={
              <ProtectedRoute>
                <ManagerCandidatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/shortlisted"
            element={
              <ProtectedRoute>
                <ManagerShortlistedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/assessments"
            element={
              <ProtectedRoute>
                <ManagerAssessmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/reports"
            element={
              <ProtectedRoute>
                <ManagerReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/settings"
            element={
              <ProtectedRoute>
                <ManagerSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
