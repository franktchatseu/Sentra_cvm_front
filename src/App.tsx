import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RequestAccountPage from './pages/RequestAccountPage';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/request-account" element={<RequestAccountPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/dashboard/*" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/landing" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;