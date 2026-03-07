import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './RoomDetail.css';
import { getSemesterBreakdown, getResponseLabel } from '../utils/roomHelpers';

const amenityIcons = {
  wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '🧺', mess: '🍽️',
  security: '🔒', cctv: '📷', gym: '💪', furnished: '🛋️', kitchen: '🍳',
  bathroom: '🚿', balcony: '🌿', tv: '📺', geyser: '🔥', lift: '🛗',
  semifurnished: '🪑', purifier: '💧', powerbackup: '🔋',
};

const BWU_LAT = 22.7320;
const BWU_LNG = 88.4998;

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
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

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
      const formData = new FormData();
      formData.append('rating', review.rating);
      formData.append('comment', review.comment);
      reviewPhotos.forEach(p => formData.append('images', p));
      const res = await api.post(`/rooms/${id}/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReviews(prev => [res.data.review, ...prev]);
      setReview({ rating: 5, comment: '' });
      setReviewPhotos([]);
      setPhotoPreview([]);
      toast.success('✅ Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleReviewPhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setReviewPhotos(files);
    setPhotoPreview(files.map(f => URL.createObjectURL(f)));
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this room near BWU: ${room.title} — ₹${room.rent?.toLocaleString()}/month\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: room.title, text, url });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('🔗 Link copied to clipboard!');
      } catch (e) {
        toast.error('Could not copy link');
      }
    }
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  if (!room) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><h2>Room not found</h2><Link to="/rooms" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Rooms</Link></div>;

  const isNew = room.createdAt && (Date.now() - new Date(room.createdAt)) < 7 * 24 * 60 * 60 * 1000;
  const hasVirtualTour = room.images?.length >= 5;
  const imgs = room.images?.length ? room.images : [{ url: 'https://via.placeholder.com/800x500?text=No+Image' }];
  const hasCoords = !!room.location?.coordinates;

  const handleDirections = () => {
    const [lng, lat] = room.location.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${BWU_LAT},${BWU_LNG}&destination=${lat},${lng}&travelmode=walking`,
      '_blank'
    );
  };

  return (
    <div className="room-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/rooms">Rooms</Link> / <span>{room.title}</span>
        </nav>

        <div className="room-detail-layout">
          <div className="room-detail-main">
            {/* Image + Video gallery */}
            {(() => {
              const mediaItems = [
                ...imgs.map(img => ({ type: 'image', url: img.url })),
                ...(room.videos || []).map(v => ({ type: 'video', url: v.url })),
              ];
              const active = mediaItems[activeImg] || mediaItems[0];
              return (
                <div className="gallery">
                  <div className="gallery-main">
                    {active.type === 'video'
                      ? <video src={active.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: 'var(--radius-lg)' }} />
                      : <img src={active.url} alt={room.title} />
                    }
                    {room.distanceFromCollege && (
                      hasCoords
                        ? <button className="gallery-badge gallery-badge-link" onClick={handleDirections} title="Get walking directions from BWU">
                            📍 {room.distanceFromCollege.toFixed(1)} km from college · Directions ↗
                          </button>
                        : <div className="gallery-badge">
                            📍 {room.distanceFromCollege.toFixed(1)} km from college
                          </div>
                    )}
                  </div>
                  {mediaItems.length > 1 && (
                    <div className="gallery-thumbs">
                      {mediaItems.map((m, i) => (
                        <button key={i} className={`gallery-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                          {m.type === 'video'
                            ? <div className="gallery-thumb-video">▶</div>
                            : <img src={m.url} alt="" />
                          }
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Room info */}
            <div className="room-info-section">
              <div className="room-info-header">
                <div>
                  <div className="room-badges">
                    <span className={`badge ${room.availability ? 'badge-green' : 'badge-red'}`}>
                      {room.availability ? '✓ Available' : 'Occupied'}
                    </span>
                    <span className="badge badge-blue">{room.type}</span>
                    {room.rating > 0 && <span className="badge badge-yellow">⭐ {room.rating.toFixed(1)}</span>}
                    {isNew && <span className="badge" style={{background:'rgba(16,185,129,0.12)',color:'#10b981',border:'1px solid rgba(16,185,129,0.25)'}}>🆕 New</span>}
                    {hasVirtualTour && <span className="badge" style={{background:'rgba(139,92,246,0.12)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.25)'}}>🖼️ 5+ Photos</span>}
                  </div>
                  <h1 style={{ fontSize: '28px', margin: '10px 0 6px' }}>{room.title}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    📍 {room.address?.street}, {room.address?.area}, {room.address?.city} - {room.address?.pincode}
                  </p>
                </div>
                <button onClick={handleShare} className="btn btn-ghost btn-sm" title="Share this room" style={{gap:'6px'}}>
                  📤 Share
                </button>
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
                  {(() => {
                    const resp = getResponseLabel(room.owner?.avgResponseTime);
                    return resp ? <div style={{fontSize:'11px',color:resp.color,fontWeight:700,marginTop:'4px'}}>{resp.label}</div> : null;
                  })()}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  {room.contactPhone && (
                    user
                      ? <a href={`tel:${room.contactPhone}`} className="btn btn-ghost btn-sm">📞 Call</a>
                      : <button className="btn btn-ghost btn-sm" onClick={() => { toast.info('Please sign in to contact the owner'); navigate('/login'); }}>📞 Call</button>
                  )}
                  {room.contactWhatsapp && (
                    user
                      ? <a href={`https://wa.me/${room.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">💬 WhatsApp</a>
                      : <button className="btn btn-outline btn-sm" onClick={() => { toast.info('Please sign in to contact the owner'); navigate('/login'); }}>💬 WhatsApp</button>
                  )}
                </div>
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
                    <textarea className="form-input" placeholder="Share your experience — room condition, owner behaviour, locality..." rows={3}
                      value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
                    <div style={{marginTop:'8px'}}>
                      <label style={{fontSize:'12px',fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.6px',display:'block',marginBottom:'8px'}}>
                        Add Photos (up to 3) — Real room photos build trust!
                      </label>
                      <label style={{display:'inline-flex',alignItems:'center',gap:'7px',padding:'8px 14px',background:'rgba(255,255,255,0.04)',border:'1.5px dashed var(--border)',borderRadius:'var(--radius)',cursor:'pointer',fontSize:'13px',color:'var(--text-2)',fontWeight:600,transition:'var(--t)'}}>
                        📸 Choose Photos
                        <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleReviewPhotos} />
                      </label>
                      {photoPreview.length > 0 && (
                        <div style={{display:'flex',gap:'8px',marginTop:'10px',flexWrap:'wrap'}}>
                          {photoPreview.map((p,i) => (
                            <div key={i} style={{width:'72px',height:'72px',borderRadius:'var(--radius-sm)',overflow:'hidden',border:'1px solid var(--border)'}}>
                              <img src={p} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>⭐ Post Review</button>
                  </form>
                )}
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar">{r.student?.avatar ? <img src={r.student.avatar} alt="" /> : r.student?.name?.[0]}</div>
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.student?.name}</span>
                            {r.isVerifiedTenant && <span style={{fontSize:'10px',background:'var(--green-muted)',color:'var(--green)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'var(--radius-pill)',padding:'2px 7px',fontWeight:700}}>✅ Verified Tenant</span>}
                          </div>
                          <div style={{marginTop:'2px'}}>{'⭐'.repeat(r.rating)}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: '1.7' }}>{r.comment}</p>
                      {r.images?.length > 0 && (
                        <div style={{display:'flex',gap:'8px',marginTop:'10px',flexWrap:'wrap'}}>
                          {r.images.map((img,i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer"
                              style={{width:'80px',height:'80px',borderRadius:'var(--radius-sm)',overflow:'hidden',display:'block',border:'1px solid var(--border)',flexShrink:0}}>
                              <img src={img} alt="Review photo" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.2s'}}
                                onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
                                onMouseLeave={e=>e.target.style.transform='scale(1)'} />
                            </a>
                          ))}
                        </div>
                      )}
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

              {/* Semester pricing breakdown */}
              {(() => {
                const bd = getSemesterBreakdown(room.rent, room.deposit);
                return (
                  <div className="semester-pricing">
                    <div className="semester-price-main">
                      <span className="semester-monthly">₹{bd.monthly?.toLocaleString()}</span>
                      <span className="semester-per">/month</span>
                    </div>
                    <div className="semester-breakdown">
                      <div className="semester-row">
                        <span>Per semester (6 months)</span>
                        <strong>₹{bd.semester?.toLocaleString()}</strong>
                      </div>
                      {bd.deposit > 0 && (
                        <div className="semester-row">
                          <span>Security deposit</span>
                          <strong>₹{bd.deposit?.toLocaleString()}</strong>
                        </div>
                      )}
                      {bd.deposit > 0 && (
                        <div className="semester-row semester-total">
                          <span>First payment total</span>
                          <strong style={{color:'var(--accent)'}}>₹{bd.firstPayment?.toLocaleString()}</strong>
                        </div>
                      )}
                      <div className="semester-row" style={{fontSize:'11px',color:'var(--text-3)'}}>
                        <span>Per day equivalent</span>
                        <span>~₹{bd.perDay}/day</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Owner response rate */}
              {(() => {
                const resp = getResponseLabel(room.owner?.avgResponseTime);
                return resp ? (
                  <div style={{
                    display:'inline-flex',alignItems:'center',gap:'6px',
                    padding:'6px 12px',borderRadius:'var(--radius-pill)',
                    background:resp.bg,border:`1px solid ${resp.color}30`,
                    fontSize:'12px',fontWeight:700,color:resp.color,
                    marginBottom:'4px'
                  }}>{resp.label}</div>
                ) : null;
              })()}
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
