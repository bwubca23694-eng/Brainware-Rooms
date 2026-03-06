import React from 'react';
import { Link } from 'react-router-dom';
import './RoomCard.css';
import { getResponseLabel } from '../../utils/roomHelpers';

const amenityIcons = {
  wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '🧺', mess: '🍽️',
  security: '🔒', cctv: '📷', gym: '💪', furnished: '🛋️', kitchen: '🍳',
  bathroom: '🚿', balcony: '🌿', tv: '📺', geyser: '🔥', lift: '🛗',
};
const genderLabel = { any: '👥 All', male: '👨 Boys', female: '👩 Girls' };
const typeColors = {
  single: '#ff6b2b', double: '#3b82f6', hostel: '#10b981',
  '1bhk': '#f59e0b', studio: '#8b5cf6', dormitory: '#ec4899',
  triple: '#06b6d4', '2bhk': '#84cc16',
};

export default function RoomCard({ room }) {
  const img = room.images?.[0]?.url;
  const isNew = room.createdAt && (Date.now() - new Date(room.createdAt)) < 7 * 24 * 60 * 60 * 1000;
  const hasVirtualTour = room.images?.length >= 5;
  const topAmenities = room.amenities?.slice(0, 4) || [];
  const extra = (room.amenities?.length || 0) - 4;
  const typeColor = typeColors[room.type] || '#ff6b2b';
  const waNumber = room.contactWhatsapp || room.owner?.phone;
  const responseInfo = getResponseLabel(room.owner?.avgResponseTime);

  const handleWhatsApp = (e) => {
    e.preventDefault(); // stop Link navigation
    const msg = encodeURIComponent(`Hi, I saw "${room.title}" on BWU Rooms — is it still available?`);
    const num = waNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <Link to={`/rooms/${room._id}`} className="room-card">
      {/* Image */}
      <div className="room-card-image">
        {img
          ? <img src={img} alt={room.title} loading="lazy" />
          : <div className="room-no-img">🏠</div>
        }
        {/* Top badges */}
        <div className="room-card-top-badges">
          <span className={`badge ${room.availability ? 'badge-green' : 'badge-red'}`}>
            {room.availability ? '✓ Available' : 'Occupied'}
          </span>
          <span className="badge" style={{ background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}35` }}>
            {room.type}
          </span>
          {isNew && <span className="badge" style={{background:'rgba(16,185,129,0.9)',color:'#fff',border:'none'}}>🆕 New</span>}
          {hasVirtualTour && <span className="badge" style={{background:'rgba(139,92,246,0.85)',color:'#fff',border:'none'}}>🖼️ Tour</span>}
        </div>
        {/* Distance */}
        {room.distanceFromCollege != null && (
          <div className="room-card-distance">
            📍 {room.distanceFromCollege.toFixed(1)} km from BWU
          </div>
        )}
        {/* WhatsApp quick contact overlay */}
        {waNumber && (
          <button className="room-card-wa-btn" onClick={handleWhatsApp} title="Contact on WhatsApp">
            💬
          </button>
        )}
      </div>

      {/* Body */}
      <div className="room-card-body">
        <div className="room-card-header">
          <h3 className="room-card-title">{room.title}</h3>
          <p className="room-card-address">
            📌 {room.address?.area}{room.address?.city ? `, ${room.address.city}` : ''}
          </p>
        </div>

        {topAmenities.length > 0 && (
          <div className="room-card-amenities">
            {topAmenities.map(a => (
              <span key={a} className="room-amenity">{amenityIcons[a] || '✓'} {a}</span>
            ))}
            {extra > 0 && <span className="room-amenity">+{extra} more</span>}
          </div>
        )}

        {/* Response rate */}
        {responseInfo && (
          <div style={{fontSize:'11px',fontWeight:700,color:responseInfo.color,marginTop:'2px'}}>
            {responseInfo.label}
          </div>
        )}

        {/* Semester price hint */}
        {room.rent && (
          <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:600,marginTop:'2px'}}>
            ₹{(room.rent * 6).toLocaleString()} per semester
          </div>
        )}

        <div className="room-card-footer">
          <div className="room-card-rent">
            <span className="rent-amount">₹{room.rent?.toLocaleString()}</span>
            <span className="rent-period">/mo</span>
          </div>
          <div className="room-card-right">
            {room.rating > 0 && <span className="room-rating">⭐ {room.rating.toFixed(1)}</span>}
            <span className="room-gender">{genderLabel[room.rules?.genderAllowed] || '👥 All'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
