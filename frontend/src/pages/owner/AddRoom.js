import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './RoomForm.css';

const AMENITIES = ['wifi', 'ac', 'parking', 'laundry', 'mess', 'security', 'cctv', 'gym', 'furnished', 'semifurnished', 'kitchen', 'bathroom', 'balcony', 'tv', 'geyser', 'purifier', 'powerbackup', 'lift'];

export default function AddRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', type: 'single', rent: '', deposit: '',
    address: { street: '', area: '', city: 'Barasat', state: 'West Bengal', pincode: '', landmark: '' },
    amenities: [],
    rules: { genderAllowed: 'any', nonVeg: true, smoking: false, pets: false, visitors: true },
    totalRooms: 1, availableRooms: 1,
    contactPhone: '', contactWhatsapp: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));
  const setRule = (key, val) => setForm(f => ({ ...f, rules: { ...f.rules, [key]: val } }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'address') formData.append(k, JSON.stringify(v));
        else if (k === 'rules') formData.append(k, JSON.stringify(v));
        else if (k === 'amenities') v.forEach(a => formData.append('amenities[]', a));
        else formData.append(k, v);
      });
      images.forEach(img => formData.append('images', img));

      await api.post('/rooms', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Room submitted for review!');
      navigate('/owner/rooms');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-form-page">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '8px' }}>List a New Room</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>Your listing will be reviewed before going live</p>

        <form onSubmit={handleSubmit} className="room-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Listing Title *</label>
              <input type="text" className="form-input" placeholder="e.g., Furnished Single Room near Brainware University"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={4} placeholder="Describe your room, neighbourhood, nearby facilities..."
                value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Room Type *</label>
                <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {['single','double','triple','dormitory','studio','hostel','1bhk','2bhk'].map(t => (
                    <option key={t} value={t}>{t.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Rent (₹) *</label>
                <input type="number" className="form-input" placeholder="e.g., 4500"
                  value={form.rent} onChange={e => set('rent', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input type="number" className="form-input" placeholder="e.g., 9000"
                  value={form.deposit} onChange={e => set('deposit', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Total Rooms</label>
                <input type="number" className="form-input" min={1} value={form.totalRooms} onChange={e => set('totalRooms', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Available Rooms</label>
                <input type="number" className="form-input" min={0} value={form.availableRooms} onChange={e => set('availableRooms', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="form-section">
            <h3 className="form-section-title">Location & Address</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Street / House No. *</label>
                <input type="text" className="form-input" placeholder="e.g., 12, Raja Street"
                  value={form.address.street} onChange={e => setAddr('street', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Area / Locality *</label>
                <input type="text" className="form-input" placeholder="e.g., Jagannathpur"
                  value={form.address.area} onChange={e => setAddr('area', e.target.value)} required />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-input" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" className="form-input" value={form.address.state} onChange={e => setAddr('state', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input type="text" className="form-input" placeholder="700123"
                  value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Landmark</label>
              <input type="text" className="form-input" placeholder="Near college gate, opp. temple..."
                value={form.address.landmark} onChange={e => setAddr('landmark', e.target.value)} />
            </div>
          </div>

          {/* Amenities */}
          <div className="form-section">
            <h3 className="form-section-title">Amenities</h3>
            <div className="amenities-check-grid">
              {AMENITIES.map(a => (
                <label key={a} className={`amenity-check ${form.amenities.includes(a) ? 'active' : ''}`}>
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                  <span style={{ textTransform: 'capitalize' }}>{a}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="form-section">
            <h3 className="form-section-title">Rules & Preferences</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Preferred Tenants</label>
                <select className="form-input" value={form.rules.genderAllowed} onChange={e => setRule('genderAllowed', e.target.value)}>
                  <option value="any">Any</option>
                  <option value="male">Boys Only</option>
                  <option value="female">Girls Only</option>
                </select>
              </div>
            </div>
            <div className="rules-toggle-row">
              {[['nonVeg','Non-veg Allowed'],['smoking','Smoking Allowed'],['pets','Pets Allowed'],['visitors','Visitors Allowed']].map(([k, label]) => (
                <label key={k} className="toggle-label">
                  <span>{label}</span>
                  <input type="checkbox" className="toggle-input" checked={form.rules[k]} onChange={e => setRule(k, e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="form-section">
            <h3 className="form-section-title">Contact Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input type="tel" className="form-input" placeholder="For calls" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input type="tel" className="form-input" placeholder="For WhatsApp" value={form.contactWhatsapp} onChange={e => set('contactWhatsapp', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h3 className="form-section-title">Photos</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Upload up to 10 photos. First photo will be the cover image.</p>
            <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} className="form-input" />
            {images.length > 0 && (
              <div className="image-preview-row">
                {images.map((f, i) => (
                  <div key={i} className="image-preview">
                    <img src={URL.createObjectURL(f)} alt="" />
                    {i === 0 && <span className="cover-label">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/owner/rooms')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
