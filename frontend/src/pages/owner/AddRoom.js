import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './RoomForm.css';
import LocationPicker from '../../components/common/LocationPicker';

const AMENITIES = ['wifi', 'ac', 'parking', 'laundry', 'mess', 'security', 'cctv', 'gym', 'furnished', 'semifurnished', 'kitchen', 'bathroom', 'balcony', 'tv', 'geyser', 'purifier', 'powerbackup', 'lift'];

export default function AddRoom() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]); // up to 2
  const [location, setLocation] = useState({ coordinates: [88.4821, 22.7225] });
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
      formData.append('location', JSON.stringify({ type: 'Point', coordinates: location.coordinates }));

      const res = await api.post('/rooms', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      // Upload videos separately (up to 2)
      if (videos.length > 0 && res.data.room?._id) {
        for (const vid of videos) {
          const vidData = new FormData();
          vidData.append('video', vid);
          await api.post(`/rooms/${res.data.room._id}/video`, vidData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      }

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

          {/* Address + Map Location */}
          <div className="form-section">
            <h3 className="form-section-title">📍 Location & Address</h3>

            {/* Map location picker */}
            <div className="form-group">
              <label className="form-label" style={{marginBottom:'10px',display:'block'}}>
                Pin Your Room on Map
                <span style={{fontSize:'12px',color:'var(--text-3)',fontWeight:400,marginLeft:'8px'}}>
                  Students will see the exact distance from BWU
                </span>
              </label>
              <LocationPicker value={[22.7225, 88.4821]} onChange={setLocation} />
            </div>

            <div className="form-row" style={{marginTop:'16px'}}>
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

          {/* Photos & Video */}
          <div className="form-section">
            <h3 className="form-section-title">Photos & Video</h3>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Photos <span style={{color:'var(--text-muted)',fontWeight:400}}>(up to 10, first = cover)</span></label>
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

            <div>
              <label className="form-label">Room Videos <span style={{color:'var(--text-muted)',fontWeight:400}}>(up to 2 · max 100MB each · mp4/mov)</span></label>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                🎬 A short walkthrough video builds trust and gets more bookings!
              </p>
              <input
                type="file" accept="video/mp4,video/mov,video/avi,video/webm"
                multiple className="form-input"
                onChange={e => {
                  const files = Array.from(e.target.files).slice(0, 2);
                  const oversized = files.find(f => f.size > 100 * 1024 * 1024);
                  if (oversized) { toast.error('Each video must be under 100MB'); return; }
                  setVideos(files);
                }}
              />
              {videos.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {videos.map((v, i) => (
                    <div key={i} style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '400px' }}>
                      <video src={URL.createObjectURL(v)} controls style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => setVideos(vs => vs.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
