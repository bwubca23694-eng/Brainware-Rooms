import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">🏠</div>
          <div>
            <div className="footer-name">BWU Rooms</div>
            <div className="footer-tagline">Find your home near Brainware University</div>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-col-title">For Students</div>
            <Link to="/rooms">Browse Rooms</Link>
            <Link to="/rooms?type=hostel">Hostels</Link>
            <Link to="/rooms?type=single">Single Rooms</Link>
            <Link to="/rooms?type=double">Shared Rooms</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">For Owners</div>
            <Link to="/register?role=owner">List Property</Link>
            <Link to="/owner/dashboard">Owner Dashboard</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} BWU Rooms • Built for Brainware University Students, Barasat</span>
          <span style={{ color: 'var(--text-3)' }}>Made with ❤️ in West Bengal</span>
        </div>
      </div>
    </footer>
  );
}
