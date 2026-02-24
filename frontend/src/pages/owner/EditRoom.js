import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AMENITIES = ['wifi', 'ac', 'parking', 'laundry', 'mess', 'security', 'cctv', 'gym', 'furnished', 'semifurnished', 'kitchen', 'bathroom', 'balcony', 'tv', 'geyser', 'purifier', 'powerbackup', 'lift'];

export default function EditRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    api.get(`/rooms/${id}`).then(res => setForm(res.data.room)).catch(() => toast.error('Room not found')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center" style={{ minHeight: '50vh' }}><div className="spinner"></div></div>;
  if (!form) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));
  const setRule = (key, val) => setForm(f => ({ ...f, rules: { ...f.rules, [key]: val } }));
  const toggleAmenity = (a) => setForm(f => ({ ...f, amenities: f.amenities?.includes(a) ? f.amenities.filter(x => x !== a) : [...(f.amenities || []), a] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      ['title','description','type','rent','deposit','contactPhone','contactWhatsapp','totalRooms','availableRooms'].forEach(k => { if (form[k] !== undefined) formData.append(k, form[k]); });
      formData.append('address', JSON.stringify(form.address));
      formData.append('rules', JSON.stringify(form.rules));
      (form.amenities || []).forEach(a => formData.append('amenities[]', a));
      newImages.forEach(img => formData.append('images', img));

      await api.put(`/rooms/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Room updated! Pending re-review.');
      navigate('/owner/rooms');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="room-form-page">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '32px' }}>Edit Room</h1>
        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {['single','double','triple','dormitory','studio','hostel','1bhk','2bhk'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rent (₹)</label>
                <input type="number" className="form-input" value={form.rent} onChange={e => set('rent', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Deposit (₹)</label>
                <input type="number" className="form-input" value={form.deposit} onChange={e => set('deposit', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Address</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Street</label>
                <input type="text" className="form-input" value={form.address?.street || ''} onChange={e => setAddr('street', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Area</label>
                <input type="text" className="form-input" value={form.address?.area || ''} onChange={e => setAddr('area', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={form.address?.city || ''} onChange={e => setAddr('city', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={form.address?.state || ''} onChange={e => setAddr('state', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={form.address?.pincode || ''} onChange={e => setAddr('pincode', e.target.value)} /></div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Amenities</h3>
            <div className="amenities-check-grid">
              {AMENITIES.map(a => (
                <label key={a} className={`amenity-check ${(form.amenities || []).includes(a) ? 'active' : ''}`}>
                  <input type="checkbox" checked={(form.amenities || []).includes(a)} onChange={() => toggleAmenity(a)} />
                  <span style={{ textTransform: 'capitalize' }}>{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Add More Photos</h3>
            {form.images?.length > 0 && (
              <div className="image-preview-row" style={{ marginBottom: '12px' }}>
                {form.images.map((img, i) => (
                  <div key={i} className="image-preview"><img src={img.url} alt="" /></div>
                ))}
              </div>
            )}
            <input type="file" accept="image/*" multiple onChange={e => setNewImages(Array.from(e.target.files))} className="form-input" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/owner/rooms')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
