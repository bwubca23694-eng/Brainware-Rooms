import React from 'react';
import { Link } from 'react-router-dom';
import './RoomCard.css';

const amenityIcons = {
  wifi: '📶', ac: '❄️', parking: '🅿️', laundry: '🧺', mess: '🍽️',
  security: '🔒', cctv: '📷', gym: '💪', furnished: '🛋️', kitchen: '🍳',
  bathroom: '🚿', balcony: '🌿', tv: '📺', geyser: '🔥', lift: '🛗',
};

export default function RoomCard({ room }) {
  const img = room.images?.[0]?.url || 'https://via.placeholder.com/400x250?text=No+Image';
  
  return (
    <Link to={`/rooms/${room._id}`} className="room-card">
      <div className="room-card-image">
        <img src={img} alt={room.title} loading="lazy" />
        <div className="room-card-badges">
          {room.availability ? (
            <span className="badge badge-green">Available</span>
          ) : (
            <span className="badge badge-red">Occupied</span>
          )}
          <span className={`badge badge-blue`}>{room.type}</span>
        </div>
        {room.distanceFromCollege && (
          <div className="room-card-distance">
            📍 {room.distanceFromCollege.toFixed(1)} km from college
          </div>
        )}
      </div>
      <div className="room-card-body">
        <h3 className="room-card-title">{room.title}</h3>
        <p className="room-card-address">
          {room.address?.area}, {room.address?.city}
        </p>
        <div className="room-card-amenities">
          {room.amenities?.slice(0, 5).map(a => (
            <span key={a} className="room-amenity-tag" title={a}>
              {amenityIcons[a] || '✓'} {a}
            </span>
          ))}
          {room.amenities?.length > 5 && (
            <span className="room-amenity-tag">+{room.amenities.length - 5}</span>
          )}
        </div>
        <div className="room-card-footer">
          <div className="room-card-rent">
            <span className="rent-amount">₹{room.rent?.toLocaleString()}</span>
            <span className="rent-period">/month</span>
          </div>
          <div className="room-card-meta">
            {room.rating > 0 && (
              <span className="room-rating">⭐ {room.rating.toFixed(1)}</span>
            )}
            <span className="room-gender-tag">{room.rules?.genderAllowed === 'any' ? '👥 All' : room.rules?.genderAllowed === 'male' ? '👨 Boys' : '👩 Girls'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
