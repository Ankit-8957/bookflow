import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './layouts/ProtectedRoute';
import AuthorLayout from './layouts/AuthorLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Author Pages
import AuthorDashboard from './pages/author/AuthorDashboard';
import MyBooksPage from './pages/author/MyBooksPage';
import MyTicketsPage from './pages/author/MyTicketsPage';
import CreateTicketPage from './pages/author/CreateTicketPage';
import AuthorTicketDetailPage from './pages/author/AuthorTicketDetailPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTicketQueuePage from './pages/admin/AdminTicketQueuePage';
import AdminTicketDetailPage from './pages/admin/AdminTicketDetailPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Author Workspace (Protected) */}
            <Route element={<ProtectedRoute allowedRoles={['AUTHOR']} />}>
              <Route path="/author" element={<AuthorLayout />}>
                <Route index element={<Navigate to="/author/dashboard" replace />} />
                <Route path="dashboard" element={<AuthorDashboard />} />
                <Route path="books" element={<MyBooksPage />} />
                <Route path="tickets" element={<MyTicketsPage />} />
                <Route path="tickets/create" element={<CreateTicketPage />} />
                <Route path="tickets/:ticketId" element={<AuthorTicketDetailPage />} />
              </Route>
            </Route>

            {/* Admin Workspace (Protected) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="tickets" element={<AdminTicketQueuePage />} />
                <Route path="tickets/:ticketId" element={<AdminTicketDetailPage />} />
              </Route>
            </Route>

            {/* Root & Catch-all Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;