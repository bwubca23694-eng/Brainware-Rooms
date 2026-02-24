import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const statusColors = { pending: 'yellow', confirmed: 'green', rejected: 'red', cancelled: 'gray', completed: 'blue' };

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    api.get('/bookings/owner').then(res => setBookings(res.data.bookings || [])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setProcessing(id);
    try {
      const res = await api.put(`/bookings/${id}/status`, { status, note });
      setBookings(prev => prev.map(b => b._id === id ? res.data.booking : b));
      toast.success(`Booking ${status}`);
      setNote('');
    } catch { toast.error('Failed'); }
    finally { setProcessing(null); }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '8px' }}>Booking Requests</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>Manage incoming booking requests from students</p>

        {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(b => (
              <div key={b._id} style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '15px' }}>{b.room?.title}</h4>
                      <span className={`badge badge-${statusColors[b.status]}`}>{b.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Student:</strong> {b.student?.name}</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {b.student?.email}</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Phone:</strong> {b.student?.phone || 'N/A'}</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Student ID:</strong> {b.student?.studentId || 'N/A'}</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Move-in:</strong> {b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-IN') : '—'}</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Duration:</strong> {b.duration} months</div>
                      <div><strong style={{ color: 'var(--text-primary)' }}>Total:</strong> ₹{b.totalAmount?.toLocaleString()}</div>
                    </div>
                    {b.message && <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{b.message}"</p>}
                  </div>
                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                      <input className="form-input" style={{ fontSize: '13px', padding: '8px 12px' }} placeholder="Note to student (optional)" value={note} onChange={e => setNote(e.target.value)} />
                      <button className="btn btn-primary btn-sm" disabled={processing === b._id} onClick={() => updateStatus(b._id, 'confirmed')}>✓ Confirm</button>
                      <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} disabled={processing === b._id} onClick={() => updateStatus(b._id, 'rejected')}>✗ Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <p>No booking requests yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
