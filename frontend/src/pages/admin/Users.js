import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || '';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(defaultRole);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('role', filter);
    if (search) params.set('search', search);
    api.get(`/admin/users?${params}`)
      .then(res => setUsers(res.data.users || []))
      .finally(() => setLoading(false));
  }, [filter, search]);

  const updateUser = async (id, updates) => {
    try {
      const res = await api.put(`/admin/users/${id}`, updates);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success('Updated!');
    } catch { toast.error('Failed'); }
  };

  const approveOwner = async (id, approved) => {
    try {
      const res = await api.put(`/admin/users/${id}/approve-owner`, { approved });
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success(approved ? 'Owner approved!' : 'Approval revoked');
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '24px' }}>Manage Users</h1>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['', 'student', 'owner', 'admin'].map(r => (
            <button key={r} className={`filter-chip ${filter === r ? 'active' : ''}`} onClick={() => setFilter(r)}>
              {r || 'All'}
            </button>
          ))}
          <input className="form-input" style={{ marginLeft: 'auto', maxWidth: '240px', padding: '6px 12px', fontSize: '13px' }}
            placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border)' }}>
                  {['User','Email','Role','Status','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                          {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.[0]}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-blue' : u.role === 'owner' ? 'badge-yellow' : 'badge-gray'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge badge-${u.isVerified ? 'green' : 'red'}`} style={{ width: 'fit-content' }}>{u.isVerified ? '✓ Verified' : 'Unverified'}</span>
                        {u.role === 'owner' && (
                          <span className={`badge badge-${u.isOwnerApproved ? 'green' : 'yellow'}`} style={{ width: 'fit-content' }}>{u.isOwnerApproved ? '✓ Approved' : 'Pending'}</span>
                        )}
                        {!u.isActive && <span className="badge badge-red" style={{ width: 'fit-content' }}>Banned</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {u.role === 'owner' && !u.isOwnerApproved && (
                          <button className="btn btn-primary btn-sm" onClick={() => approveOwner(u._id, true)}>Approve</button>
                        )}
                        {u.role === 'owner' && u.isOwnerApproved && (
                          <button className="btn btn-ghost btn-sm" onClick={() => approveOwner(u._id, false)}>Revoke</button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => updateUser(u._id, { isActive: !u.isActive })}>
                          {u.isActive ? 'Ban' : 'Unban'}
                        </button>
                        <button className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }} onClick={() => deleteUser(u._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No users found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
