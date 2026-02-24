import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import RoomCard from '../../components/rooms/RoomCard';

export default function SavedRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/saved-rooms').then(res => setRooms(res.data.rooms || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '8px' }}>Saved Rooms</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>Rooms you've bookmarked for later</p>
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
            <h3>No saved rooms</h3>
            <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px' }}>Browse rooms and save ones you're interested in</p>
            <Link to="/rooms" className="btn btn-primary">Browse Rooms</Link>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map(room => <RoomCard key={room._id} room={room} />)}
          </div>
        )}
      </div>
    </div>
  );
}
