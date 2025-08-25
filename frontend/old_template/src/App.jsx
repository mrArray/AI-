import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
 import * as bootstrap from 'bootstrap';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ChatPage from './pages/chat/ChatPage';
import FormattingPage from './pages/formatting/FormattingPage';
import CreditsHistoryPage from './pages/formatting/CreditsHistoryPage';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/UserManagement';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('accessToken') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('accessToken') !== null;
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isAdmin = user.isAdmin === true;
  return !isAuthenticated ? <Navigate to="/login" /> : !isAdmin ? <Navigate to="/" /> : children;
};

const App = () => {

useEffect(() => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(el => new bootstrap.Tooltip(el));

  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(el => new bootstrap.Popover(el));

  return () => {
    tooltipTriggerList.forEach(el => bootstrap.Tooltip.getInstance(el)?.dispose());
    popoverTriggerList.forEach(el => bootstrap.Popover.getInstance(el)?.dispose());
  };
}, []);


  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />

      <Route path="/" element={<ProtectedRoute><FormattingPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><CreditsHistoryPage /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
