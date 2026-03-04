import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Roommates.css';

const LIFESTYLE_OPTIONS = [
  { key: 'vegetarian', label: '🥗 Vegetarian' },
  { key: 'non-veg', label: '🍗 Non-Veg OK' },
  { key: 'early-riser', label: '🌅 Early Riser' },
  { key: 'night-owl', label: '🦉 Night Owl' },
  { key: 'studious', label: '📚 Studious' },
  { key: 'social', label: '🎉 Social' },
  { key: 'quiet', label: '🤫 Quiet' },
  { key: 'non-smoker', label: '🚭 Non-Smoker' },
];

const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
const AREAS = ['Nabapally', 'Barasat', 'Madhyamgram', 'Birati', 'Jessore Road', 'Duttabad', 'New Barrackpore'];

const emptyForm = {
  title: '', description: '', lookingFor: 'roommate',
  preferredArea: '', budget: '', roomType: 'any',
  gender: 'male', genderPreference: 'any',
  semester: '', department: '', lifestyle: [],
  whatsapp: '', moveInDate: '',
};

export default function Roommates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [myPost, setMyPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ gender: 'any', lookingFor: '', maxBudget: '' });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.gender !== 'any') params.set('gender', filters.gender);
      if (filters.lookingFor) params.set('lookingFor', filters.lookingFor);
      if (filters.maxBudget) params.set('maxBudget', filters.maxBudget);
      const res = await api.get(`/roommates?${params}`);
      setPosts(res.data.posts || []);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/roommates/my').then(r => {
        if (r.data.post) { setMyPost(r.data.post); setForm({ ...emptyForm, ...r.data.post }); }
      }).catch(() => {});
    }
  }, [user]);

  const toggleLifestyle = key => {
    setForm(f => ({
      ...f,
      lifestyle: f.lifestyle.includes(key) ? f.lifestyle.filter(l => l !== key) : [...f.lifestyle, key]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      if (myPost) {
        const res = await api.put(`/roommates/${myPost._id}`, form);
        setMyPost(res.data.post);
        toast.success('✅ Post updated!');
      } else {
        const res = await api.post('/roommates', form);
        setMyPost(res.data.post);
        toast.success('🎉 Post live! Students can see it now');
      }
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!myPost) return;
    if (!window.confirm('Remove your roommate listing?')) return;
    try {
      await api.delete(`/roommates/${myPost._id}`);
      setMyPost(null);
      setForm(emptyForm);
      toast.success('Post removed');
      fetchPosts();
    } catch { toast.error('Failed to remove'); }
  };

  return (
    <div className="roommates-page">
      <div className="container">

        {/* Header */}
        <div className="rm-header">
          <div className="rm-header-text">
            <div className="rm-pill">🤝 BWU Community</div>
            <h1 className="page-title">Roommate Finder</h1>
            <p className="page-subtitle">Find compatible roommates or share your room with fellow BWU students. Safe, verified, free.</p>
          </div>
          {user?.role === 'student' && (
            <div className="rm-header-actions">
              {myPost && (
                <span className="badge badge-green" style={{ padding: '8px 14px', fontSize: '12px' }}>
                  ✅ Your Post is Live
                </span>
              )}
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? '✕ Cancel' : myPost ? '✏️ Edit My Post' : '+ Post Your Request'}
              </button>
            </div>
          )}
          {!user && (
            <Link to="/register" className="btn btn-primary">Join to Post →</Link>
          )}
        </div>

        {/* Post Form */}
        {showForm && user?.role === 'student' && (
          <div className="rm-form-card">
            <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>
              {myPost ? '✏️ Update Your Listing' : '📝 Create Roommate Listing'}
            </h3>
            <form onSubmit={handleSubmit} className="rm-form">

              {/* Looking for toggle */}
              <div className="form-group">
                <label className="form-label">I am looking for...</label>
                <div className="rm-toggle-group">
                  <button type="button"
                    className={`rm-toggle ${form.lookingFor === 'roommate' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, lookingFor: 'roommate' }))}>
                    🤝 A Roommate to share with me
                  </button>
                  <button type="button"
                    className={`rm-toggle ${form.lookingFor === 'room' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, lookingFor: 'room' }))}>
                    🏠 A Room to share with others
                  </button>
                </div>
              </div>

              <div className="rm-form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Listing Title *</label>
                  <input className="form-input" placeholder='e.g. "CSE student looking for quiet roommate near BWU"'
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Area *</label>
                  <select className="form-input" value={form.preferredArea}
                    onChange={e => setForm(f => ({ ...f, preferredArea: e.target.value }))} required>
                    <option value="">Select area...</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    <option value="any">Any area near BWU</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Budget / person (₹/month) *</label>
                  <input className="form-input" type="number" placeholder="e.g. 4000"
                    value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Room Type Preferred</label>
                  <select className="form-input" value={form.roomType}
                    onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))}>
                    {['any', 'single', 'double', 'triple', '1bhk', '2bhk', 'hostel'].map(t => (
                      <option key={t} value={t}>{t === 'any' ? 'Any Type' : t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Gender *</label>
                  <select className="form-input" value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} required>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Roommate Gender</label>
                  <select className="form-input" value={form.genderPreference}
                    onChange={e => setForm(f => ({ ...f, genderPreference: e.target.value }))}>
                    <option value="any">Any Gender</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select className="form-input" value={form.semester}
                    onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                    <option value="">Select semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" placeholder="e.g. Computer Science"
                    value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Move-in Date</label>
                  <input className="form-input" type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.moveInDate} onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input className="form-input" placeholder="+91 98765 43210"
                    value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">About You / What You're Looking For *</label>
                  <textarea className="form-input" rows={4}
                    placeholder="Tell potential roommates about yourself — your schedule, habits, study hours, what you're looking for in a roommate..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Lifestyle Tags (select all that apply)</label>
                  <div className="rm-lifestyle-tags">
                    {LIFESTYLE_OPTIONS.map(l => (
                      <button key={l.key} type="button"
                        className={`rm-lifestyle-tag ${form.lifestyle.includes(l.key) ? 'active' : ''}`}
                        onClick={() => toggleLifestyle(l.key)}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rm-form-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  {submitting ? '⏳ Posting...' : myPost ? '✅ Update Post' : '🚀 Post Listing'}
                </button>
                {myPost && (
                  <button type="button" className="btn btn-ghost" onClick={handleDelete}
                    style={{ color: '#f87171' }}>
                    🗑️ Remove Post
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="rm-filters">
          <div className="rm-filter-group">
            <span className="rm-filter-label">Filter:</span>
            {['any', 'male', 'female'].map(g => (
              <button key={g} onClick={() => setFilters(f => ({ ...f, gender: g }))}
                className={`filter-chip ${filters.gender === g ? 'active' : ''}`}>
                {g === 'any' ? '👥 All' : g === 'male' ? '👨 Boys' : '👩 Girls'}
              </button>
            ))}
          </div>
          <div className="rm-filter-group">
            {[{ v: '', l: '📋 All Posts' }, { v: 'roommate', l: '🤝 Need Roommate' }, { v: 'room', l: '🏠 Need Room' }].map(opt => (
              <button key={opt.v} onClick={() => setFilters(f => ({ ...f, lookingFor: opt.v }))}
                className={`filter-chip ${filters.lookingFor === opt.v ? 'active' : ''}`}>
                {opt.l}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Max Budget:</span>
            <input className="form-input" type="number" placeholder="₹/month"
              style={{ width: '110px', padding: '7px 12px', fontSize: '13px' }}
              value={filters.maxBudget} onChange={e => setFilters(f => ({ ...f, maxBudget: e.target.value }))} />
          </div>
        </div>

        {/* Posts grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="rm-empty">
            <div className="rm-empty-icon">🤝</div>
            <h3>No roommate listings yet</h3>
            <p>Be the first BWU student to post! It takes 2 minutes.</p>
            {user?.role === 'student' && (
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowForm(true)}>
                Post First Listing
              </button>
            )}
          </div>
        ) : (
          <div className="rm-grid">
            {posts.map(post => (
              <RoommateCard key={post._id} post={post} isOwn={myPost?._id === post._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoommateCard({ post, isOwn }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(post.expiresAt) - Date.now()) / 86400000));

  return (
    <div className={`rm-card ${isOwn ? 'rm-card-own' : ''}`}>
      {isOwn && <div className="rm-card-own-badge">✏️ Your Post</div>}

      <div className="rm-card-top">
        <div className="rm-card-avatar">
          {post.student?.avatar
            ? <img src={post.student.avatar} alt={post.student.name} />
            : <span>{post.student?.name?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div className="rm-card-meta">
          <div className="rm-card-name">{post.student?.name}</div>
          <div className="rm-card-dept">
            {post.student?.department || post.department || 'BWU Student'}
            {post.semester && ` · ${post.semester}`}
          </div>
        </div>
        <div className="rm-card-type">
          <span className={`badge ${post.lookingFor === 'roommate' ? 'badge-blue' : 'badge-orange'}`}>
            {post.lookingFor === 'roommate' ? '🤝 Need Roommate' : '🏠 Need Room'}
          </span>
        </div>
      </div>

      <h3 className="rm-card-title">{post.title}</h3>
      <p className="rm-card-desc">{post.description}</p>

      <div className="rm-card-details">
        <div className="rm-detail">📍 {post.preferredArea}</div>
        <div className="rm-detail">💰 Up to ₹{Number(post.budget).toLocaleString()}/mo</div>
        {post.roomType !== 'any' && <div className="rm-detail">🏠 {post.roomType.toUpperCase()}</div>}
        <div className="rm-detail">
          {post.gender === 'male' ? '👨 Male' : '👩 Female'}
          {post.genderPreference !== 'any' && ` · Prefers ${post.genderPreference}`}
        </div>
        {post.moveInDate && (
          <div className="rm-detail">📅 From {new Date(post.moveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
        )}
      </div>

      {post.lifestyle?.length > 0 && (
        <div className="rm-lifestyle">
          {post.lifestyle.map(l => {
            const opt = LIFESTYLE_OPTIONS.find(o => o.key === l);
            return opt ? <span key={l} className="rm-lifestyle-pill">{opt.label}</span> : null;
          })}
        </div>
      )}

      <div className="rm-card-footer">
        <span className="rm-expires">⏳ {daysLeft}d left</span>
        {post.whatsapp && (
          <a href={`https://wa.me/${post.whatsapp.replace(/\D/g,'')}`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-sm">
            💬 WhatsApp
          </a>
        )}
        {post.contactEmail && (
          <a href={`mailto:${post.contactEmail}`} className="btn btn-ghost btn-sm">📧 Email</a>
        )}
      </div>
    </div>
  );
}
