import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyResumes from './pages/MyResumes';
import Templates from './pages/Templates';
import Builder from './pages/Builder';
import AnalysisHub from './pages/AnalysisHub';
import AnalysisDashboard from './pages/AnalysisDashboard';
import DetailedAnalysis from './pages/DetailedAnalysis';
import JobDescription from './pages/JobDescription';
import Reanalyze from './pages/Reanalyze';
import ExportResume from './pages/ExportResume';
import AnalysisHistory from './pages/AnalysisHistory';
import ProfileSettings from './pages/ProfileSettings';

function Loading() {
  return (
    <div className="center-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--slate-500)' }}>
        <span className="spinner dark" />
        Loading your workspace…
      </div>
    </div>
  );
}

function PublicOnly({ children }) {
  const { ready, isAuthed } = useAuth();
  if (!ready) return <Loading />;
  if (isAuthed) return <Navigate to="/" replace />;
  return children;
}

function Protected({ children }) {
  const { ready, isAuthed } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function HomeRoute() {
  const { ready, isAuthed } = useAuth();
  if (!ready) return <Loading />;
  return isAuthed ? <Dashboard /> : <Landing />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignUp /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
      <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />

      {/* Authenticated */}
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/resumes" element={<MyResumes />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/builder/:id" element={<Builder />} />
        <Route path="/analysis" element={<AnalysisHub />} />
        <Route path="/analysis/:id" element={<AnalysisDashboard />} />
        <Route path="/analysis/:id/details" element={<DetailedAnalysis />} />
        <Route path="/analysis/:id/job-description" element={<JobDescription />} />
        <Route path="/analysis/:id/reanalyze" element={<Reanalyze />} />
        <Route path="/analysis/:id/export" element={<ExportResume />} />
        <Route path="/history" element={<AnalysisHistory />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}