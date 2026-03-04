import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getPushStatus, subscribeToPush } from '../../utils/pwa';
import './StudentDashboard.css';

const statusColors = { pending: 'yellow', confirmed: 'green', rejected: 'red', cancelled: 'gray', completed: 'blue' };
const statusEmoji  = { pending: '⏳', confirmed: '✅', rejected: '❌', cancelled: '🚫', completed: '🎉' };

const ROOM_TYPES = ['single', 'double', 'triple', '1bhk', '2bhk', 'hostel', 'dormitory'];
const AREAS = ['Nabapally', 'Barasat', 'Madhyamgram', 'Birati', 'Jessore Road', 'Duttabad', 'Any'];

const emptyAlert = { name: '', maxRent: '', type: '', gender: 'any', area: '', notifyEmail: true, notifyPush: true };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertForm, setAlertForm] = useState(emptyAlert);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [pushStatus, setPushStatus] = useState({ supported: false, subscribed: false });
  const [enablingPush, setEnablingPush] = useState(false);

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data.bookings || [])).finally(() => setLoading(false));
    api.get('/alerts').then(r => setAlerts(r.data.alerts || [])).catch(() => {});
    getPushStatus().then(setPushStatus);
  }, []);

  const handleEnablePush = async () => {
    setEnablingPush(true);
    const ok = await subscribeToPush(api);
    if (ok) { toast.success('🔔 Push notifications enabled!'); setPushStatus(s => ({ ...s, subscribed: true })); }
    else toast.error('Could not enable notifications — please allow in browser settings');
    setEnablingPush(false);
  };

  const handleCreateAlert = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/alerts', alertForm);
      setAlerts(a => [res.data.alert, ...a]);
      setAlertForm(emptyAlert);
      setShowAlertForm(false);
      toast.success('🔔 Alert created! We\'ll notify you when a matching room is listed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create alert'); }
  };

  const toggleAlert = async (id) => {
    try {
      const res = await api.patch(`/alerts/${id}/toggle`);
      setAlerts(a => a.map(al => al._id === id ? res.data.alert : al));
    } catch { toast.error('Failed to update alert'); }
  };

  const deleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(a => a.filter(al => al._id !== id));
      toast.success('Alert removed');
    } catch { toast.error('Failed to delete alert'); }
  };

  return (
    <div className="student-dashboard">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Manage your bookings, alerts, and saved rooms</p>
          </div>
          <Link to="/rooms" className="btn btn-primary">🔍 Browse Rooms</Link>
        </div>

        {/* Stats */}
        <div className="student-stats">
          {[
            { num: bookings.length, label: 'Total Bookings', icon: '📋' },
            { num: bookings.filter(b => b.status === 'confirmed').length, label: 'Confirmed', icon: '✅' },
            { num: bookings.filter(b => b.status === 'pending').length, label: 'Pending', icon: '⏳' },
            { num: user?.savedRooms?.length || 0, label: 'Saved Rooms', icon: '🔖' },
            { num: alerts.filter(a => a.isActive).length, label: 'Active Alerts', icon: '🔔' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          {[
            { id: 'bookings', label: '📋 My Bookings', count: bookings.length },
            { id: 'alerts', label: '🔔 Room Alerts', count: alerts.filter(a=>a.isActive).length },
            { id: 'profile', label: '👤 Profile' },
          ].map(t => (
            <button key={t.id} className={`dashboard-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.label}
              {t.count > 0 && <span className="tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <div className="bookings-section">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏠</div>
                <h3>No bookings yet</h3>
                <p style={{ color: 'var(--text-2)', marginTop: '8px' }}>Find your perfect room and send a booking request</p>
                <Link to="/rooms" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Rooms</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map(b => (
                  <div key={b._id} className="booking-item">
                    <div className="booking-room-img">
                      {b.room?.images?.[0]?.url
                        ? <img src={b.room.images[0].url} alt="" />
                        : <span style={{ fontSize: '28px' }}>🏠</span>
                      }
                    </div>
                    <div className="booking-info">
                      <h4>{b.room?.title}</h4>
                      <p>📍 {b.room?.address?.area}, {b.room?.address?.city}</p>
                      <p style={{ color: 'var(--text-3)', fontSize: '13px', marginTop: '4px' }}>
                        📅 Move-in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-IN') : '—'} · {b.duration} month(s)
                      </p>
                      {b.ownerNote && (
                        <p style={{ color: 'var(--accent)', fontSize: '13px', marginTop: '6px', fontStyle: 'italic' }}>
                          💬 Owner: "{b.ownerNote}"
                        </p>
                      )}
                    </div>
                    <div className="booking-right">
                      <span className={`badge badge-${statusColors[b.status]}`}>
                        {statusEmoji[b.status]} {b.status}
                      </span>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', marginTop: '8px', color: 'var(--accent)' }}>
                        ₹{b.totalAmount?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                        ₹{b.room?.rent?.toLocaleString()}/mo × {b.duration}mo
                      </div>
                      <Link to={`/rooms/${b.room?._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: '10px' }}>
                        View Room →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {tab === 'alerts' && (
          <div className="alerts-section">

            {/* Push notification CTA */}
            {pushStatus.supported && !pushStatus.subscribed && (
              <div className="push-cta">
                <div className="push-cta-icon">🔔</div>
                <div className="push-cta-text">
                  <strong>Enable push notifications</strong>
                  <span>Get instant alerts on your phone when a matching room is listed — even when the app is closed</span>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleEnablePush} disabled={enablingPush}>
                  {enablingPush ? '...' : 'Enable'}
                </button>
              </div>
            )}
            {pushStatus.subscribed && (
              <div className="push-cta push-cta-active">
                <div className="push-cta-icon">✅</div>
                <div className="push-cta-text">
                  <strong>Push notifications are on</strong>
                  <span>You'll get instant alerts on this device</span>
                </div>
              </div>
            )}

            {/* Alert form */}
            <div className="alerts-header">
              <div>
                <h3 style={{ fontWeight: 800 }}>Your Room Alerts</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', marginTop: '4px' }}>
                  Up to 5 alerts. We notify you by email + push when a matching room is listed.
                </p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAlertForm(!showAlertForm)}
                disabled={alerts.filter(a=>a.isActive).length >= 5}>
                {showAlertForm ? '✕ Cancel' : '+ New Alert'}
              </button>
            </div>

            {showAlertForm && (
              <form onSubmit={handleCreateAlert} className="alert-form">
                <div className="alert-form-grid">
                  <div className="form-group">
                    <label className="form-label">Alert Name *</label>
                    <input className="form-input" placeholder='e.g. "Budget room near BWU"'
                      value={alertForm.name} onChange={e => setAlertForm(f=>({...f,name:e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Rent (₹/month)</label>
                    <input className="form-input" type="number" placeholder="e.g. 4000"
                      value={alertForm.maxRent} onChange={e => setAlertForm(f=>({...f,maxRent:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Type</label>
                    <select className="form-input" value={alertForm.type} onChange={e => setAlertForm(f=>({...f,type:e.target.value}))}>
                      <option value="">Any Type</option>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Area</label>
                    <select className="form-input" value={alertForm.area} onChange={e => setAlertForm(f=>({...f,area:e.target.value}))}>
                      <option value="">Any Area</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender Preference</label>
                    <select className="form-input" value={alertForm.gender} onChange={e => setAlertForm(f=>({...f,gender:e.target.value}))}>
                      <option value="any">Any</option>
                      <option value="male">Boys Only</option>
                      <option value="female">Girls Only</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
                    <label className="checkbox-group">
                      <input type="checkbox" checked={alertForm.notifyEmail} onChange={e => setAlertForm(f=>({...f,notifyEmail:e.target.checked}))} />
                      📧 Email notifications
                    </label>
                    <label className="checkbox-group">
                      <input type="checkbox" checked={alertForm.notifyPush} onChange={e => setAlertForm(f=>({...f,notifyPush:e.target.checked}))} />
                      🔔 Push notifications
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">🔔 Create Alert</button>
              </form>
            )}

            {/* Active alerts list */}
            {alerts.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
                <h3>No alerts yet</h3>
                <p style={{ color: 'var(--text-2)' }}>Set up an alert and we'll notify you the moment a matching room is listed</p>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert._id} className={`alert-item ${alert.isActive ? '' : 'alert-inactive'}`}>
                    <div className="alert-item-left">
                      <div className="alert-name">{alert.name}</div>
                      <div className="alert-criteria">
                        {alert.maxRent && <span className="alert-tag">💰 Max ₹{Number(alert.maxRent).toLocaleString()}/mo</span>}
                        {alert.type && <span className="alert-tag">🏠 {alert.type}</span>}
                        {alert.area && <span className="alert-tag">📍 {alert.area}</span>}
                        {alert.gender !== 'any' && <span className="alert-tag">{alert.gender === 'male' ? '👨' : '👩'} {alert.gender}</span>}
                        <span className="alert-tag">{alert.notifyEmail ? '📧' : ''}{alert.notifyPush ? '🔔' : ''}</span>
                      </div>
                      {alert.matchCount > 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>
                          {alert.matchCount} match{alert.matchCount !== 1 ? 'es' : ''} found
                          {alert.lastNotified && ` · Last: ${new Date(alert.lastNotified).toLocaleDateString('en-IN')}`}
                        </div>
                      )}
                    </div>
                    <div className="alert-actions">
                      <button className={`alert-toggle ${alert.isActive ? 'on' : 'off'}`} onClick={() => toggleAlert(alert._id)}
                        title={alert.isActive ? 'Pause alert' : 'Resume alert'}>
                        {alert.isActive ? '🟢' : '⚫'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteAlert(alert._id)}
                        style={{ color: '#f87171', padding: '6px 10px' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="profile-section">
            <div className="profile-card">
              <div className="profile-avatar">
                {user?.avatar ? <img src={user.avatar} alt="" /> : <span>{user?.name?.[0]}</span>}
              </div>
              <div className="profile-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                {user?.studentId && <p>🎓 Student ID: {user.studentId}</p>}
                {user?.department && <p>📚 Dept: {user.department}</p>}
                {user?.year && <p>📅 Year: {user.year}</p>}
                {user?.phone && <p>📞 {user.phone}</p>}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                {user?.isVerified
                  ? <span className="badge badge-green">✅ Verified</span>
                  : <span className="badge badge-yellow">⚠️ Email not verified</span>
                }
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/saved-rooms" className="btn btn-ghost">🔖 View Saved Rooms</Link>
              <Link to="/roommates" className="btn btn-ghost">🤝 Roommate Finder</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
