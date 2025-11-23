import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { color } from './shared/utils/utils';

// Lazy load all pages for better performance
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RequestAccountPage = lazy(() => import('./features/auth/pages/RequestAccountPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'));
const LandingPage = lazy(() => import('./features/auth/pages/LandingPage'));
const AuthenticatedLandingPage = lazy(() => import('./features/dashboard/components/AuthenticatedLandingPage'));
const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b8169]"></div>
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/landingpage" /> : <LoginPage />} />
        <Route path="/request-account" element={<RequestAccountPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/landingpage" element={isAuthenticated ? <AuthenticatedLandingPage /> : <Navigate to="/login" />} />
        <Route path="/dashboard/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
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