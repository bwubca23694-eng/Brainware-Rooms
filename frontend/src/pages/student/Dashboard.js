import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

const statusColors = { pending: 'yellow', confirmed: 'green', rejected: 'red', cancelled: 'gray', completed: 'blue' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(res => setBookings(res.data.bookings || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="student-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Manage your room bookings and saved properties</p>
          </div>
          <Link to="/rooms" className="btn btn-primary">Browse Rooms</Link>
        </div>

        {/* Stats */}
        <div className="student-stats">
          <div className="stat-card">
            <div className="stat-num">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{bookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{bookings.filter(b => b.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{user?.savedRooms?.length || 0}</div>
            <div className="stat-label">Saved Rooms</div>
          </div>
        </div>

        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.[0]}
          </div>
          <div className="profile-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            {user?.studentId && <p>ID: {user.studentId}</p>}
            {user?.department && <p>Dept: {user.department}</p>}
          </div>
          {!user?.isVerified && (
            <div className="badge badge-yellow" style={{ marginLeft: 'auto' }}>Email not verified</div>
          )}
        </div>

        {/* Bookings */}
        <div className="bookings-section">
          <h2 style={{ marginBottom: '20px' }}>My Booking Requests</h2>
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '48px' }}>🏠</div>
              <h3>No bookings yet</h3>
              <p>Find your perfect room and send a booking request</p>
              <Link to="/rooms" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Rooms</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map(b => (
                <div key={b._id} className="booking-item">
                  <div className="booking-room-img">
                    <img src={b.room?.images?.[0]?.url || 'https://via.placeholder.com/100'} alt="" />
                  </div>
                  <div className="booking-info">
                    <h4>{b.room?.title}</h4>
                    <p>{b.room?.address?.area}, {b.room?.address?.city}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      Move-in: {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-IN') : '—'} · {b.duration} month(s)
                    </p>
                    {b.ownerNote && <p style={{ color: 'var(--accent)', fontSize: '13px', marginTop: '4px' }}>Note: {b.ownerNote}</p>}
                  </div>
                  <div className="booking-right">
                    <span className={`badge badge-${statusColors[b.status]}`}>{b.status}</span>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginTop: '8px' }}>₹{b.totalAmount?.toLocaleString()}</div>
                    <Link to={`/rooms/${b.room?._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }}>View Room</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
