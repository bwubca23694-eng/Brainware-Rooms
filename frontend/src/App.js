import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import GoogleSuccess from './pages/GoogleSuccess';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import SavedRooms from './pages/student/SavedRooms';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import ManageRooms from './pages/owner/ManageRooms';
import AddRoom from './pages/owner/AddRoom';
import EditRoom from './pages/owner/EditRoom';
import OwnerBookings from './pages/owner/Bookings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import AdminUsers from './pages/admin/Users';
import AdminBookings from './pages/admin/Bookings';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleSuccess />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Student */}
        <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/saved-rooms" element={<ProtectedRoute role="student"><SavedRooms /></ProtectedRoute>} />

        {/* Owner */}
        <Route path="/owner/dashboard" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/rooms" element={<ProtectedRoute role="owner"><ManageRooms /></ProtectedRoute>} />
        <Route path="/owner/rooms/add" element={<ProtectedRoute role="owner"><AddRoom /></ProtectedRoute>} />
        <Route path="/owner/rooms/edit/:id" element={<ProtectedRoute role="owner"><EditRoom /></ProtectedRoute>} />
        <Route path="/owner/bookings" element={<ProtectedRoute role="owner"><OwnerBookings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute role="admin"><AdminRooms /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <ToastContainer position="top-right" theme="dark" />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
