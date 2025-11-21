import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import RequestAccountPage from './features/auth/pages/RequestAccountPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import LandingPage from './features/auth/pages/LandingPage';
import AuthenticatedLandingPage from './features/dashboard/components/AuthenticatedLandingPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { color } from './shared/utils/utils';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b8169]"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/landingpage" /> : <LoginPage />} />
      <Route path="/request-account" element={<RequestAccountPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/landingpage" element={isAuthenticated ? <AuthenticatedLandingPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Router>
            <div className="min-h-screen" style={{ backgroundColor: color.primary.background }}>
              <AppRoutes />
            </div>
          </Router>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;