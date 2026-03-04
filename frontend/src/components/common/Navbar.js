import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };
  const dashLink = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'owner' ? '/owner/dashboard' : '/dashboard';
  const isActive = p => pathname === p;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="brand-logo">🏠</div>
          <div className="brand-text">
            <span className="brand-main">BWU Rooms</span>
            <span className="brand-sub">Brainware University</span>
          </div>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/rooms" className={isActive('/rooms') ? 'active-nav' : ''} onClick={() => setMenuOpen(false)}>
            Browse Rooms
          </Link>
          {!user && <Link to="/register?role=owner" onClick={() => setMenuOpen(false)}>List Property</Link>}
          {user?.role === 'owner' && <Link to="/owner/rooms/add" onClick={() => setMenuOpen(false)}>+ Add Room</Link>}
          {user?.role === 'admin' && <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Admin</Link>}
        </div>

        <div className="navbar-right">
          <ThemeToggle />

          {user ? (
            <div className="user-menu" onClick={() => setDropOpen(!dropOpen)}>
              <div className="user-avatar">
                {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
              </div>
              <span>{user.name?.split(' ')[0]}</span>
              <span className="chevron">▾</span>
              {dropOpen && (
                <div className="user-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-role">{user.role}</div>
                  </div>
                  <Link to={dashLink} onClick={() => setDropOpen(false)}>📊 Dashboard</Link>
                  {user.role === 'student' && <>
                    <Link to="/dashboard" onClick={() => setDropOpen(false)}>📋 My Bookings</Link>
                    <Link to="/saved-rooms" onClick={() => setDropOpen(false)}>🔖 Saved Rooms</Link>
                  </>}
                  {user.role === 'owner' && <>
                    <Link to="/owner/rooms" onClick={() => setDropOpen(false)}>🏠 My Properties</Link>
                    <Link to="/owner/bookings" onClick={() => setDropOpen(false)}>📋 Bookings</Link>
                  </>}
                  {user.role === 'admin' && <>
                    <Link to="/admin/rooms" onClick={() => setDropOpen(false)}>🏘️ Rooms</Link>
                    <Link to="/admin/users" onClick={() => setDropOpen(false)}>👥 Users</Link>
                  </>}
                  <button className="dropdown-logout" onClick={handleLogout}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </nav>
  );
}
