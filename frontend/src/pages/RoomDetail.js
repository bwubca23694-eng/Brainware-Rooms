import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './RoomDetail.css';

const amenityIcons = {
  wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '🧺', mess: '🍽️',
  security: '🔒', cctv: '📷', gym: '💪', furnished: '🛋️', kitchen: '🍳',
  bathroom: '🚿', balcony: '🌿', tv: '📺', geyser: '🔥', lift: '🛗',
  semifurnished: '🪑', purifier: '💧', powerbackup: '🔋',
};

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [booking, setBooking] = useState({ moveInDate: '', duration: 1, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    api.get(`/rooms/${id}`)
      .then(res => { setRoom(res.data.room); setReviews(res.data.reviews || []); })
      .catch(() => toast.error('Room not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'student') return toast.error('Only students can book rooms');
    setSubmitting(true);
    try {
      await api.post(`/bookings/room/${id}`, booking);
      toast.success('Booking request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/rooms/${id}/reviews`, review);
      setReviews(prev => [res.data.review, ...prev]);
      setReview({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  if (!room) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><h2>Room not found</h2><Link to="/rooms" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Rooms</Link></div>;

  const imgs = room.images?.length ? room.images : [{ url: 'https://via.placeholder.com/800x500?text=No+Image' }];

  return (
    <div className="room-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/rooms">Rooms</Link> / <span>{room.title}</span>
        </nav>

        <div className="room-detail-layout">
          <div className="room-detail-main">
            {/* Image gallery */}
            <div className="gallery">
              <div className="gallery-main">
                <img src={imgs[activeImg]?.url} alt={room.title} />
                {room.distanceFromCollege && (
                  <div className="gallery-badge">📍 {room.distanceFromCollege.toFixed(1)} km from college</div>
                )}
              </div>
              {imgs.length > 1 && (
                <div className="gallery-thumbs">
                  {imgs.map((img, i) => (
                    <button key={i} className={`gallery-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={img.url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room info */}
            <div className="room-info-section">
              <div className="room-info-header">
                <div>
                  <div className="room-badges">
                    <span className={`badge ${room.availability ? 'badge-green' : 'badge-red'}`}>
                      {room.availability ? 'Available' : 'Occupied'}
                    </span>
                    <span className="badge badge-blue">{room.type}</span>
                    {room.rating > 0 && <span className="badge badge-yellow">⭐ {room.rating.toFixed(1)}</span>}
                  </div>
                  <h1 style={{ fontSize: '28px', margin: '10px 0 6px' }}>{room.title}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    📍 {room.address?.street}, {room.address?.area}, {room.address?.city} - {room.address?.pincode}
                  </p>
                </div>
                <div className="room-price-box">
                  <span className="room-price">₹{room.rent?.toLocaleString()}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/month</span>
                  {room.deposit > 0 && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>₹{room.deposit?.toLocaleString()} deposit</div>}
                </div>
              </div>

              <div className="divider"></div>

              <div>
                <h3 style={{ marginBottom: '12px' }}>Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{room.description}</p>
              </div>

              {room.amenities?.length > 0 && (
                <div>
                  <h3 style={{ margin: '24px 0 12px' }}>Amenities</h3>
                  <div className="amenities-grid">
                    {room.amenities.map(a => (
                      <div key={a} className="amenity-item">
                        <span>{amenityIcons[a] || '✓'}</span>
                        <span style={{ textTransform: 'capitalize' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ margin: '24px 0 12px' }}>Rules & Preferences</h3>
                <div className="rules-grid">
                  <div className="rule-item">
                    <span>👥 Gender</span>
                    <span style={{ textTransform: 'capitalize' }}>{room.rules?.genderAllowed}</span>
                  </div>
                  <div className="rule-item">
                    <span>🍖 Non-veg</span>
                    <span>{room.rules?.nonVeg ? 'Allowed' : 'Not allowed'}</span>
                  </div>
                  <div className="rule-item">
                    <span>🚬 Smoking</span>
                    <span>{room.rules?.smoking ? 'Allowed' : 'Not allowed'}</span>
                  </div>
                  <div className="rule-item">
                    <span>🐾 Pets</span>
                    <span>{room.rules?.pets ? 'Allowed' : 'Not allowed'}</span>
                  </div>
                  <div className="rule-item">
                    <span>👋 Visitors</span>
                    <span>{room.rules?.visitors ? 'Allowed' : 'Not allowed'}</span>
                  </div>
                </div>
              </div>

              {/* Owner info */}
              <div className="owner-info-card">
                <div className="owner-avatar">
                  {room.owner?.avatar ? <img src={room.owner.avatar} alt="" /> : room.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{room.owner?.businessName || room.owner?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Property Owner</div>
                  {room.owner?.isOwnerApproved && <span className="badge badge-green" style={{ marginTop: '4px' }}>✓ Verified</span>}
                </div>
                {room.contactPhone && (
                  <a href={`tel:${room.contactPhone}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                    📞 Call
                  </a>
                )}
                {room.contactWhatsapp && (
                  <a href={`https://wa.me/${room.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    💬 WhatsApp
                  </a>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h3 style={{ margin: '24px 0 16px' }}>Reviews ({reviews.length})</h3>
                {user?.role === 'student' && (
                  <form onSubmit={handleReview} className="review-form">
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button"
                          style={{ fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', opacity: review.rating >= s ? 1 : 0.3, transition: 'opacity 0.2s' }}
                          onClick={() => setReview(r => ({ ...r, rating: s }))}>⭐</button>
                      ))}
                    </div>
                    <textarea className="form-input" placeholder="Share your experience..." rows={3}
                      value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>Post Review</button>
                  </form>
                )}
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar">{r.student?.avatar ? <img src={r.student.avatar} alt="" /> : r.student?.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.student?.name}</div>
                          <div>{'⭐'.repeat(r.rating)}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>{r.comment}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No reviews yet. Be the first!</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="booking-sidebar">
            <div className="booking-card">
              <h3>Request Booking</h3>
              <div style={{ margin: '12px 0', fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                ₹{room.rent?.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
              </div>
              {user?.role === 'student' ? (
                <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Move-in Date</label>
                    <input type="date" className="form-input" value={booking.moveInDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBooking(b => ({ ...b, moveInDate: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (months)</label>
                    <select className="form-input" value={booking.duration} onChange={e => setBooking(b => ({ ...b, duration: Number(e.target.value) }))}>
                      {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message to Owner (optional)</label>
                    <textarea className="form-input" rows={3} placeholder="Introduce yourself..."
                      value={booking.message} onChange={e => setBooking(b => ({ ...b, message: e.target.value }))} />
                  </div>
                  <div className="booking-total">
                    <span>Total Estimate</span>
                    <strong>₹{(room.rent * booking.duration)?.toLocaleString()}</strong>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !room.availability}>
                    {submitting ? 'Sending...' : room.availability ? 'Send Booking Request' : 'Not Available'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {!user ? (
                    <><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Login as a student to book this room</p>
                    <Link to="/login" className="btn btn-primary btn-block">Login to Book</Link></>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Only students can send booking requests.</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
