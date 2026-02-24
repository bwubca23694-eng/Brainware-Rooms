import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function AdminRooms() {
  const [searchParams] = useSearchParams();
  const defaultStatus = searchParams.get('status') || '';
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(defaultStatus);
  const [note, setNote] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/rooms${filter ? `?status=${filter}` : ''}`)
      .then(res => setRooms(res.data.rooms || []))
      .finally(() => setLoading(false));
  }, [filter]);

  const reviewRoom = async (id, status, adminNote = '') => {
    try {
      const res = await api.put(`/admin/rooms/${id}/review`, { status, adminNote });
      setRooms(prev => prev.map(r => r._id === id ? res.data.room : r));
      toast.success(`Room ${status}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '24px' }}>Manage Rooms</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['', 'pending', 'approved', 'rejected', 'inactive'].map(s => (
            <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rooms.map(room => (
              <div key={room._id} style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: '90px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={room.images?.[0]?.url || 'https://via.placeholder.com/90'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '15px' }}>{room.title}</h4>
                      <span className={`badge badge-${room.status === 'approved' ? 'green' : room.status === 'pending' ? 'yellow' : 'red'}`}>{room.status}</span>
                      <span className="badge badge-blue">{room.type}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>₹{room.rent?.toLocaleString()}/mo · {room.address?.area}, {room.address?.city}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Owner: {room.owner?.name} ({room.owner?.email})
                      {room.owner?.isOwnerApproved ? ' ✓' : ' ⚠️ Not Approved'}
                    </p>
                    {room.adminNote && <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '4px' }}>Admin Note: {room.adminNote}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <Link to={`/rooms/${room._id}`} target="_blank" className="btn btn-ghost btn-sm">Preview</Link>
                    {room.status !== 'approved' && (
                      <button className="btn btn-primary btn-sm" onClick={() => reviewRoom(room._id, 'approved')}>✓ Approve</button>
                    )}
                    {room.status !== 'rejected' && (
                      <button className="btn btn-sm" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                        onClick={() => {
                          const n = prompt('Reason for rejection (optional):') || '';
                          reviewRoom(room._id, 'rejected', n);
                        }}>✗ Reject</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No rooms found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
