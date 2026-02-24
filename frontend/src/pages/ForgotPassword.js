import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><span className="brand-dot"></span> Brainware Rooms</Link>
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h3>Check your inbox</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>We sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" className="btn btn-ghost btn-block" style={{ marginTop: '20px' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link to="/login" className="btn btn-ghost btn-block">Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}
