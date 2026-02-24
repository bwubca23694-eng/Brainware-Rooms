import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/owner/rooms').then(res => setRooms(res.data.rooms || [])).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (id) => {
    try {
      const res = await api.put(`/owner/rooms/${id}/toggle-availability`);
      setRooms(rooms.map(r => r._id === id ? { ...r, availability: res.data.availability } : r));
      toast.success('Updated!');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="page-title">My Properties</h1>
            <p className="page-subtitle">{rooms.length} listing(s)</p>
          </div>
          <Link to="/owner/rooms/add" className="btn btn-primary">+ Add Room</Link>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {rooms.map(room => (
              <div key={room._id} style={{ display: 'flex', gap: '16px', padding: '18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={room.images?.[0]?.url || 'https://via.placeholder.com/80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{room.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{room.address?.area} · ₹{room.rent?.toLocaleString()}/mo · {room.type}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{room.views} views</p>
                </div>
                <span className={`badge badge-${room.status === 'approved' ? 'green' : room.status === 'pending' ? 'yellow' : 'red'}`}>{room.status}</span>
                <button onClick={() => toggleAvailability(room._id)} className={`badge ${room.availability ? 'badge-green' : 'badge-gray'}`} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                  {room.availability ? '✓ Available' : '✗ Occupied'}
                </button>
                <Link to={`/owner/rooms/edit/${room._id}`} className="btn btn-ghost btn-sm">Edit</Link>
                <Link to={`/rooms/${room._id}`} className="btn btn-ghost btn-sm">View</Link>
              </div>
            ))}
            {rooms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <p>No rooms yet.</p>
                <Link to="/owner/rooms/add" className="btn btn-primary" style={{ marginTop: '16px' }}>Add Your First Room</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
