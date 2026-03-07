import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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

import Roommates from './pages/Roommates';
import Navbar from './components/common/Navbar';
import InstallBanner from './components/common/InstallBanner';
import Footer from './components/common/Footer';
import BottomNav from './components/common/BottomNav';

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
  const { loading } = useAuth();

  // Show full-page spinner while auth token is being verified
  // This prevents blank flashes on page navigation / refresh
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-0)', overflow: 'hidden', position: 'relative',
    }}>
      <style>{`
        @keyframes cubeRotate {
          0%   { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          33%  { transform: rotateX(120deg) rotateY(80deg) rotateZ(40deg); }
          66%  { transform: rotateX(220deg) rotateY(170deg) rotateZ(90deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }
        @keyframes face1 { 0%,100%{opacity:.9} 50%{opacity:.4} }
        @keyframes face2 { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes splash-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes splash-ring {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes msg-fade { 0%{opacity:0;transform:translateY(6px)} 20%,80%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
        @keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .splash-cube-scene { perspective: 400px; width: 80px; height: 80px; animation: splash-float 3s ease-in-out infinite; }
        .splash-cube {
          width: 80px; height: 80px;
          transform-style: preserve-3d;
          animation: cubeRotate 4s cubic-bezier(0.4,0,0.2,1) infinite;
        }
        .splash-face {
          position: absolute; width: 80px; height: 80px;
          border-radius: 14px;
          border: 2px solid rgba(255,107,43,0.6);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px;
          backface-visibility: visible;
        }
        .f-front  { background: rgba(255,107,43,0.18); transform: translateZ(40px); animation: face1 4s infinite; }
        .f-back   { background: rgba(255,107,43,0.08); transform: rotateY(180deg) translateZ(40px); animation: face2 4s infinite; }
        .f-right  { background: rgba(255,107,43,0.12); transform: rotateY(90deg) translateZ(40px); animation: face1 4s 0.3s infinite; }
        .f-left   { background: rgba(255,107,43,0.06); transform: rotateY(-90deg) translateZ(40px); animation: face2 4s 0.3s infinite; }
        .f-top    { background: rgba(255,107,43,0.15); transform: rotateX(90deg) translateZ(40px); animation: face1 4s 0.6s infinite; }
        .f-bottom { background: rgba(255,107,43,0.05); transform: rotateX(-90deg) translateZ(40px); animation: face2 4s 0.6s infinite; }
        .splash-ring {
          position: absolute;
          width: 110px; height: 110px;
          border-radius: 50%;
          border: 2px solid rgba(255,107,43,0.3);
          animation: splash-ring 2s ease-out infinite;
        }
        .splash-ring-2 { animation-delay: 0.7s; }
        .splash-msg { animation: msg-fade 2s ease-in-out infinite; }
        .splash-dot { display: inline-block; animation: dot-bounce 1.2s ease-in-out infinite; }
        .splash-dot:nth-child(2) { animation-delay: 0.15s; }
        .splash-dot:nth-child(3) { animation-delay: 0.3s; }
        .splash-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,107,43,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,43,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
      <div className="splash-grid" />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
        {/* 3D cube with pulse rings */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '140px', height: '140px' }}>
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-2" />
          <div className="splash-cube-scene">
            <div className="splash-cube">
              <div className="splash-face f-front">🏠</div>
              <div className="splash-face f-back">🔑</div>
              <div className="splash-face f-right">🎓</div>
              <div className="splash-face f-left">📍</div>
              <div className="splash-face f-top">⭐</div>
              <div className="splash-face f-bottom">💬</div>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: '#f1f5ff', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            BWU <span style={{ color: '#ff6b2b' }}>Rooms</span>
          </div>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a5878', fontWeight: 600 }}>
            Brainware University
          </div>
        </div>

        {/* Animated dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} className="splash-dot" style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#ff6b2b', animationDelay: `${i * 0.15}s`
            }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/roommates" element={<Roommates />} />
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
      <BottomNav />
      <InstallBanner />
      <ToastContainer position="top-right" theme="dark" />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
