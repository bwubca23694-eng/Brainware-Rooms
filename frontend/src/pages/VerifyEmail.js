// VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(res => {
        login(res.data.token, res.data.user);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ padding: '40px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        {status === 'verifying' && <><div className="spinner" style={{ margin: '0 auto 20px' }}></div><p>Verifying your email...</p></>}
        {status === 'success' && <><div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div><h2>Email Verified!</h2><p style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p></>}
        {status === 'error' && <><div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div><h2>Verification Failed</h2><p style={{ color: 'var(--text-muted)' }}>Invalid or expired link.</p></>}
      </div>
    </div>
  );
}
