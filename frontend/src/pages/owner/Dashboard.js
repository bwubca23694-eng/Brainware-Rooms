import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>;

  const stats = data?.stats || {};

  return (
    <div className="owner-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Owner Dashboard</h1>
            <p className="page-subtitle">Manage your listed properties</p>
          </div>
          <Link to="/owner/rooms/add" className="btn btn-primary">+ Add New Room</Link>
        </div>

        {!user?.isOwnerApproved && (
          <div className="pending-notice">
            ⚠️ Your account is pending admin approval. Your rooms will be reviewed once approved.
          </div>
        )}

        <div className="owner-stats">
          {[
            { label: 'Total Properties', value: stats.totalRooms || 0, color: 'var(--accent)' },
            { label: 'Approved', value: stats.approvedRooms || 0, color: '#34d399' },
            { label: 'Pending Review', value: stats.pendingRooms || 0, color: '#f5a623' },
            { label: 'Total Bookings', value: stats.totalBookings || 0, color: '#818cf8' },
            { label: 'Pending Bookings', value: stats.pendingBookings || 0, color: '#f5a623' },
            { label: 'Total Views', value: stats.totalViews || 0, color: 'var(--text-secondary)' },
          ].map(s => (
            <div key={s.label} className="owner-stat-card">
              <div className="owner-stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="owner-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent rooms */}
        <div className="section-header" style={{ marginTop: '40px' }}>
          <h2>My Properties</h2>
          <Link to="/owner/rooms" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="owner-rooms-list">
          {data?.rooms?.slice(0, 5).map(room => (
            <div key={room._id} className="owner-room-row">
              <div className="owner-room-img">
                <img src={room.images?.[0]?.url || 'https://via.placeholder.com/80'} alt="" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{room.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{room.address?.area} · ₹{room.rent?.toLocaleString()}/mo</p>
              </div>
              <span className={`badge badge-${room.status === 'approved' ? 'green' : room.status === 'pending' ? 'yellow' : 'red'}`}>
                {room.status}
              </span>
              <span className={`badge ${room.availability ? 'badge-green' : 'badge-gray'}`}>
                {room.availability ? 'Available' : 'Occupied'}
              </span>
              <Link to={`/owner/rooms/edit/${room._id}`} className="btn btn-ghost btn-sm">Edit</Link>
            </div>
          ))}
          {(!data?.rooms || data.rooms.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>No rooms listed yet.</p>
              <Link to="/owner/rooms/add" className="btn btn-primary" style={{ marginTop: '16px' }}>Add Your First Room</Link>
            </div>
          )}
        </div>

        <div style={{ marginTop: '32px' }}>
          <Link to="/owner/bookings" className="btn btn-outline">View All Bookings ({stats.pendingBookings} pending) →</Link>
        </div>
      </div>
    </div>
  );
}
