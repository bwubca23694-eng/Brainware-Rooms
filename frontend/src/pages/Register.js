import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';
  const navigate = useNavigate();
  const [role, setRole] = useState(defaultRole);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', studentId: '', department: '', year: '', businessName: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role });
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo"><span className="brand-dot"></span> Brainware Rooms</Link>
          <h1>Create Account</h1>
          <p>Join the Brainware Rooms community</p>
        </div>

        <div className="role-tabs">
          <button className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
            🎓 Student
          </button>
          <button className={`role-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => setRole('owner')}>
            🏠 Room Owner
          </button>
        </div>

        <button className="google-btn" style={{ marginTop: 16 }} onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or fill in details</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" placeholder="Your name"
                value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-input" placeholder="10-digit number"
                value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          {role === 'student' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input type="text" name="studentId" className="form-input" placeholder="BWU/..."
                  value={form.studentId} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" className="form-input" value={form.department} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>CSE</option><option>ECE</option><option>ME</option><option>CE</option>
                  <option>BCA</option><option>MCA</option><option>MBA</option><option>B.Pharma</option>
                  <option>LLB</option><option>Other</option>
                </select>
              </div>
            </div>
          )}

          {role === 'owner' && (
            <div className="form-group">
              <label className="form-label">Business / Property Name</label>
              <input type="text" name="businessName" className="form-input" placeholder="e.g., Sharma PG, Dutta Hostel"
                value={form.businessName} onChange={handleChange} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : `Create ${role === 'owner' ? 'Owner' : 'Student'} Account`}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="auth-terms">By registering, you agree to our <a href="#terms">Terms of Service</a>.</p>
      </div>
    </div>
  );
}
