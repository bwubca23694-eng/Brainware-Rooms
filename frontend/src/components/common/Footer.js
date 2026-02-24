import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="brand-dot"></span>
            Brainware<span style={{ color: 'var(--accent)' }}> Rooms</span>
          </div>
          <p>The easiest way to find rooms and hostels near Brainware University, Barasat.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Students</h4>
            <Link to="/rooms">Browse Rooms</Link>
            <Link to="/register">Create Account</Link>
          </div>
          <div>
            <h4>Property Owners</h4>
            <Link to="/register?role=owner">List Property</Link>
            <Link to="/login">Owner Login</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:noreplysoftsensepvtltd@gmail.com">Email Support</a>
            <span>Brainware University, Barasat</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Brainware Rooms. Built for Brainware University Students.</p>
      </div>
    </footer>
  );
}
