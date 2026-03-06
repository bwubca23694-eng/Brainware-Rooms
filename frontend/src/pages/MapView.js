import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './MapView.css';

// BWU coordinates
const BWU = { lat: 22.7225, lng: 88.4821 };

const typeColors = {
  single: '#ff6b2b', double: '#3b82f6', hostel: '#10b981',
  '1bhk': '#f59e0b', studio: '#8b5cf6', dormitory: '#ec4899',
  triple: '#06b6d4', '2bhk': '#84cc16',
};

export default function MapView() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', maxRent: '', gender: '' });
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Dynamically load leaflet (already in index.html CSS)
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Fetch rooms
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('limit', '100');
    if (filters.type) params.set('type', filters.type);
    if (filters.maxRent) params.set('maxRent', filters.maxRent);
    if (filters.gender) params.set('gender', filters.gender);
    api.get(`/rooms?${params}`)
      .then(r => setRooms(r.data.rooms || []))
      .finally(() => setLoading(false));
  }, [filters]);

  // Init map once Leaflet is ready
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || leafletMap.current) return;
    const L = window.L;

    leafletMap.current = L.map(mapRef.current, {
      center: [BWU.lat, BWU.lng],
      zoom: 14,
      zoomControl: false,
    });

    // Dark-friendly tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    // Zoom controls bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    // BWU marker (college location)
    const bwuIcon = L.divIcon({
      html: `<div class="map-bwu-pin">🎓</div>`,
      className: '', iconSize: [40, 40], iconAnchor: [20, 20],
    });
    L.marker([BWU.lat, BWU.lng], { icon: bwuIcon })
      .addTo(leafletMap.current)
      .bindPopup('<strong>🎓 Brainware University</strong>');

    // 2km radius circle
    L.circle([BWU.lat, BWU.lng], {
      radius: 2000, color: '#ff6b2b', weight: 1.5,
      fillColor: '#ff6b2b', fillOpacity: 0.04, dashArray: '6',
    }).addTo(leafletMap.current);

  }, [leafletLoaded]);

  // Add/update room markers when rooms change
  useEffect(() => {
    if (!leafletMap.current || !window.L) return;
    const L = window.L;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    rooms.forEach(room => {
      const [lng, lat] = room.location?.coordinates || [BWU.lng, BWU.lat];
      const color = typeColors[room.type] || '#ff6b2b';

      const icon = L.divIcon({
        html: `<div class="map-room-pin" style="background:${color};border-color:${color}40">
                 <span>₹${Math.round(room.rent/1000)}k</span>
               </div>`,
        className: '', iconSize: [52, 28], iconAnchor: [26, 28],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(leafletMap.current)
        .on('click', () => {
          setSelected(room);
          leafletMap.current.panTo([lat, lng], { animate: true, duration: 0.4 });
        });

      markersRef.current.push(marker);
    });
  }, [rooms, leafletLoaded]);

  const ROOM_TYPES = ['single', 'double', 'triple', '1bhk', '2bhk', 'hostel', 'studio', 'dormitory'];
  const BUDGET_PRESETS = [
    { label: 'Under ₹3k', value: '3000' },
    { label: 'Under ₹5k', value: '5000' },
    { label: 'Under ₹8k', value: '8000' },
  ];

  return (
    <div className="map-page">
      {/* Top filter bar */}
      <div className="map-filter-bar">
        <div className="map-filter-left">
          <span className="map-count">{rooms.length} rooms</span>

          {/* Type filter */}
          <div className="map-filter-scroll">
            <button className={`map-chip ${!filters.type ? 'active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, type: '' }))}>All</button>
            {ROOM_TYPES.map(t => (
              <button key={t}
                className={`map-chip ${filters.type === t ? 'active' : ''}`}
                style={filters.type === t ? { background: typeColors[t], borderColor: typeColors[t], color: '#fff' } : {}}
                onClick={() => setFilters(f => ({ ...f, type: f.type === t ? '' : t }))}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="map-filter-right">
          {/* Budget presets */}
          {BUDGET_PRESETS.map(b => (
            <button key={b.value}
              className={`map-chip ${filters.maxRent === b.value ? 'active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, maxRent: f.maxRent === b.value ? '' : b.value }))}>
              {b.label}
            </button>
          ))}

          {/* Gender */}
          <select className="map-select" value={filters.gender}
            onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}>
            <option value="">👥 All</option>
            <option value="male">👨 Boys</option>
            <option value="female">👩 Girls</option>
          </select>

          <Link to="/rooms" className="map-chip">≡ List View</Link>
        </div>
      </div>

      {/* Map container */}
      <div className="map-container">
        {loading && (
          <div className="map-loading">
            <div className="spinner" />
          </div>
        )}
        <div ref={mapRef} className="map-canvas" />

        {/* Selected room card */}
        {selected && (
          <div className="map-selected-card">
            <button className="map-card-close" onClick={() => setSelected(null)}>✕</button>
            <div className="map-card-img">
              {selected.images?.[0]?.url
                ? <img src={selected.images[0].url} alt={selected.title} />
                : <div className="map-card-no-img">🏠</div>
              }
              <span className="map-card-type" style={{ background: typeColors[selected.type] }}>
                {selected.type}
              </span>
            </div>
            <div className="map-card-body">
              <h3 className="map-card-title">{selected.title}</h3>
              <p className="map-card-addr">📍 {selected.address?.area}, {selected.address?.city}</p>
              <div className="map-card-meta">
                <span className="map-card-price">₹{selected.rent?.toLocaleString()}<small>/mo</small></span>
                {selected.distanceFromCollege != null && (
                  <span className="map-card-dist">🎓 {selected.distanceFromCollege.toFixed(1)} km</span>
                )}
                {selected.rating > 0 && <span>⭐ {selected.rating.toFixed(1)}</span>}
              </div>
              {/* Amenity pills */}
              {selected.amenities?.length > 0 && (
                <div className="map-card-amenities">
                  {selected.amenities.slice(0, 4).map(a => (
                    <span key={a} className="map-amenity-pill">{a}</span>
                  ))}
                </div>
              )}
              <div className="map-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/rooms/${selected._id}`)}>
                  View Details →
                </button>
                {selected.contactWhatsapp && (
                  <a href={`https://wa.me/${selected.contactWhatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I saw "${selected.title}" on BWU Rooms — is it available?`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-sm">
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="map-legend">
          <div className="map-legend-item"><div className="map-legend-dot" style={{background:'#ff6b2b'}}/>Single</div>
          <div className="map-legend-item"><div className="map-legend-dot" style={{background:'#3b82f6'}}/>Double</div>
          <div className="map-legend-item"><div className="map-legend-dot" style={{background:'#10b981'}}/>Hostel</div>
          <div className="map-legend-item"><div className="map-legend-dot" style={{background:'#f59e0b'}}/>1BHK</div>
          <div className="map-legend-item"><span>🎓</span> BWU Campus</div>
        </div>
      </div>
    </div>
  );
}
