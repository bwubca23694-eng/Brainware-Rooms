import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      api.get('/auth/me')
        .then(res => {
          login(token, res.data.user);
          toast.success(`Welcome, ${res.data.user.name}!`);
          const redirects = { admin: '/admin/dashboard', owner: '/owner/dashboard', student: '/dashboard' };
          navigate(redirects[res.data.user.role] || '/');
        })
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p>Signing you in with Google...</p>
      </div>
    </div>
  );
}
