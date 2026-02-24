import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>;

  const stats = data?.stats || {};

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '8px' }}>Admin Dashboard</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>System overview for Brainware Rooms</p>

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', link: '/admin/users', color: '#818cf8' },
            { label: 'Total Rooms', value: stats.totalRooms, icon: '🏠', link: '/admin/rooms', color: 'var(--accent)' },
            { label: 'Pending Reviews', value: stats.pendingRooms, icon: '⏳', link: '/admin/rooms?status=pending', color: '#f5a623' },
            { label: 'Pending Owners', value: stats.pendingOwners, icon: '👤', link: '/admin/users?role=owner', color: '#f5a623' },
            { label: 'Total Bookings', value: stats.totalBookings, icon: '📋', link: '/admin/bookings', color: '#34d399' },
          ].map(s => (
            <Link key={s.label} to={s.link} className="admin-stat-card">
              <div className="admin-stat-icon">{s.icon}</div>
              <div className="admin-stat-val" style={{ color: s.color }}>{s.value ?? '—'}</div>
              <div className="admin-stat-label">{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="admin-grid">
          {/* Pending Rooms */}
          <div className="admin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Pending Room Reviews</h3>
              <Link to="/admin/rooms" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {data?.recentRooms?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No pending rooms</p>
            ) : (
              data?.recentRooms?.map(room => (
                <div key={room._id} className="admin-list-item">
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{room.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>by {room.owner?.name} · {room.owner?.email}</div>
                  </div>
                  <Link to={`/rooms/${room._id}`} className="btn btn-ghost btn-sm">Review →</Link>
                </div>
              ))
            )}
          </div>

          {/* Recent Bookings */}
          <div className="admin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Recent Bookings</h3>
              <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {data?.recentBookings?.map(b => (
              <div key={b._id} className="admin-list-item">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{b.room?.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>by {b.student?.name}</div>
                </div>
                <span className={`badge badge-${b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'yellow' : 'gray'}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="admin-quick-links">
          <Link to="/admin/rooms?status=pending" className="quick-link-card">
            <div style={{ fontSize: '32px' }}>🔍</div>
            <div style={{ fontWeight: 700 }}>Review Rooms</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats.pendingRooms} pending</div>
          </Link>
          <Link to="/admin/users?role=owner" className="quick-link-card">
            <div style={{ fontSize: '32px' }}>✅</div>
            <div style={{ fontWeight: 700 }}>Approve Owners</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats.pendingOwners} pending</div>
          </Link>
          <Link to="/admin/users" className="quick-link-card">
            <div style={{ fontSize: '32px' }}>👥</div>
            <div style={{ fontWeight: 700 }}>Manage Users</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats.totalUsers} total</div>
          </Link>
          <Link to="/admin/bookings" className="quick-link-card">
            <div style={{ fontSize: '32px' }}>📋</div>
            <div style={{ fontWeight: 700 }}>All Bookings</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats.totalBookings} total</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
