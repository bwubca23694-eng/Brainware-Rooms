import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'owner' ? '/owner/dashboard' : '/dashboard';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-dot"></span>
          <span>Brainware<span className="brand-accent"> Rooms</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/rooms" onClick={() => setMenuOpen(false)}>Browse Rooms</Link>
          {!user && <Link to="/register?role=owner" onClick={() => setMenuOpen(false)}>List Property</Link>}
          {user && user.role === 'owner' && <Link to="/owner/rooms/add" onClick={() => setMenuOpen(false)}>+ Add Room</Link>}
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="user-menu" onClick={() => setDropOpen(!dropOpen)}>
              <div className="user-avatar">
                {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
              </div>
              <span className="user-name">{user.name?.split(' ')[0]}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 4l4 4 4-4"/>
              </svg>
              {dropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-role">{user.role}</div>
                  </div>
                  <Link to={dashboardLink} onClick={() => setDropOpen(false)}>Dashboard</Link>
                  {user.role === 'student' && <Link to="/saved-rooms" onClick={() => setDropOpen(false)}>Saved Rooms</Link>}
                  {user.role === 'owner' && <>
                    <Link to="/owner/rooms" onClick={() => setDropOpen(false)}>My Properties</Link>
                    <Link to="/owner/bookings" onClick={() => setDropOpen(false)}>Bookings</Link>
                  </>}
                  {user.role === 'admin' && <>
                    <Link to="/admin/rooms" onClick={() => setDropOpen(false)}>Manage Rooms</Link>
                    <Link to="/admin/users" onClick={() => setDropOpen(false)}>Manage Users</Link>
                  </>}
                  <button className="dropdown-logout" onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
