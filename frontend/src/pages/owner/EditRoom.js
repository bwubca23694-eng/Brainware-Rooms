import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import LocationPicker from '../../components/common/LocationPicker';
import './RoomForm.css';

const AMENITIES = ['wifi', 'ac', 'parking', 'laundry', 'mess', 'security', 'cctv', 'gym', 'furnished', 'semifurnished', 'kitchen', 'bathroom', 'balcony', 'tv', 'geyser', 'purifier', 'powerbackup', 'lift'];

export default function EditRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [location, setLocation] = useState(null); // { coordinates: [lng, lat] }

  useEffect(() => {
    api.get(`/rooms/${id}`)
      .then(res => {
        setForm(res.data.room);
        // Pre-seed location from existing room data
        if (res.data.room.location?.coordinates) {
          setLocation({ coordinates: res.data.room.location.coordinates });
        }
      })
      .catch(() => toast.error('Room not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center" style={{ minHeight: '50vh' }}><div className="spinner" /></div>;
  if (!form) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));
  const setRule = (key, val) => setForm(f => ({ ...f, rules: { ...f.rules, [key]: val } }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities?.includes(a)
      ? f.amenities.filter(x => x !== a)
      : [...(f.amenities || []), a]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      ['title','description','type','rent','deposit','contactPhone','contactWhatsapp','totalRooms','availableRooms']
        .forEach(k => { if (form[k] !== undefined) formData.append(k, form[k]); });
      formData.append('address', JSON.stringify(form.address));
      formData.append('rules', JSON.stringify(form.rules));
      (form.amenities || []).forEach(a => formData.append('amenities[]', a));
      if (location) {
        formData.append('location', JSON.stringify({ type: 'Point', coordinates: location.coordinates }));
      }
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

  // Pass existing coords to LocationPicker as initial value
  const existingCoords = form.location?.coordinates
    ? [form.location.coordinates[1], form.location.coordinates[0]] // [lat, lng]
    : null;

  return (
    <div className="room-form-page">
      <div className="container">
        <h1 className="page-title" style={{ marginBottom: '8px' }}>Edit Room</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>Changes will be reviewed before going live again</p>

        <form onSubmit={handleSubmit} className="room-form">

          {/* Basic Info */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Listing Title *</label>
              <input type="text" className="form-input" value={form.title}
                onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={4} value={form.description}
                onChange={e => set('description', e.target.value)} required />
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
                <input type="number" className="form-input" value={form.rent}
                  onChange={e => set('rent', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input type="number" className="form-input" value={form.deposit || ''}
                  onChange={e => set('deposit', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Total Rooms</label>
                <input type="number" className="form-input" min={1} value={form.totalRooms || 1}
                  onChange={e => set('totalRooms', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Available Rooms</label>
                <input type="number" className="form-input" min={0} value={form.availableRooms || 1}
                  onChange={e => set('availableRooms', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Location + Address */}
          <div className="form-section">
            <h3 className="form-section-title">📍 Location & Address</h3>

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
                Update Room Location on Map
                <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 400, marginLeft: '8px' }}>
                  Students see exact distance from BWU
                </span>
              </label>
              <LocationPicker value={existingCoords} onChange={setLocation} />
            </div>

            <div className="form-row" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Street / House No.</label>
                <input type="text" className="form-input" value={form.address?.street || ''}
                  onChange={e => setAddr('street', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Area / Locality</label>
                <input type="text" className="form-input" value={form.address?.area || ''}
                  onChange={e => setAddr('area', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-input" value={form.address?.city || ''}
                  onChange={e => setAddr('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" className="form-input" value={form.address?.state || ''}
                  onChange={e => setAddr('state', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" className="form-input" value={form.address?.pincode || ''}
                  onChange={e => setAddr('pincode', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Landmark</label>
              <input type="text" className="form-input"
                placeholder="Near college gate, opp. temple..."
                value={form.address?.landmark || ''}
                onChange={e => setAddr('landmark', e.target.value)} />
            </div>
          </div>

          {/* Amenities */}
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

          {/* Rules */}
          <div className="form-section">
            <h3 className="form-section-title">Rules & Preferences</h3>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Preferred Tenants</label>
                <select className="form-input" value={form.rules?.genderAllowed || 'any'}
                  onChange={e => setRule('genderAllowed', e.target.value)}>
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
                  <input type="checkbox" className="toggle-input"
                    checked={form.rules?.[k] ?? false}
                    onChange={e => setRule(k, e.target.checked)} />
                  <span className="toggle-slider" />
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
                <input type="tel" className="form-input" placeholder="For calls"
                  value={form.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input type="tel" className="form-input" placeholder="For WhatsApp"
                  value={form.contactWhatsapp || ''} onChange={e => set('contactWhatsapp', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="form-section">
            <h3 className="form-section-title">Photos</h3>
            {form.images?.length > 0 && (
              <>
                <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '10px' }}>Current photos:</p>
                <div className="image-preview-row" style={{ marginBottom: '16px' }}>
                  {form.images.map((img, i) => (
                    <div key={i} className="image-preview">
                      <img src={img.url} alt="" />
                      {i === 0 && <span className="cover-label">Cover</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '10px' }}>
              Upload new photos (will be added to existing ones):
            </p>
            <input type="file" accept="image/*" multiple
              onChange={e => setNewImages(Array.from(e.target.files))} className="form-input" />
            {newImages.length > 0 && (
              <div className="image-preview-row" style={{ marginTop: '12px' }}>
                {newImages.map((f, i) => (
                  <div key={i} className="image-preview">
                    <img src={URL.createObjectURL(f)} alt="" />
                    <span className="cover-label" style={{ background: '#10b981' }}>New</span>
                  </div>
                ))}
              </div>
            )}
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
