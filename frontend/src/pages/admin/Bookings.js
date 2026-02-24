import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const statusColors = { pending: 'yellow', confirmed: 'green', rejected: 'red', cancelled: 'gray', completed: 'blue' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/bookings').then(res => setBookings(res.data.bookings || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '32px' }}>All Bookings</h1>

        {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border)' }}>
                  {['Room','Student','Owner','Move-in','Duration','Amount','Status','Date'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontSize: '13px', maxWidth: '160px' }}>
                      <div style={{ fontWeight: 500 }}>{b.room?.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>₹{b.room?.rent?.toLocaleString()}/mo</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{b.student?.name}<br /><span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{b.student?.email}</span></td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{b.owner?.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}>{b.moveInDate ? new Date(b.moveInDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px' }}>{b.duration} mo</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600 }}>₹{b.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px' }}><span className={`badge badge-${statusColors[b.status]}`}>{b.status}</span></td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No bookings found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
