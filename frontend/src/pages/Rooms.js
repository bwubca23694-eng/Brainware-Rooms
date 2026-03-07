import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/rooms/RoomCard';
import './Rooms.css';

const AMENITIES = ['wifi', 'ac', 'mess', 'parking', 'laundry', 'security', 'cctv', 'gym', 'furnished', 'kitchen', 'geyser', 'lift'];
const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory', 'studio', 'hostel', '1bhk', '2bhk'];
const BUDGET_PRESETS = [
  { label: '₹3k', value: 3000 }, { label: '₹5k', value: 5000 },
  { label: '₹8k', value: 8000 }, { label: '₹12k', value: 12000 },
];
const AMENITY_ICONS = {
  wifi:'📶', ac:'❄️', mess:'🍽️', parking:'🅿️', laundry:'🧺',
  security:'🔒', cctv:'📷', gym:'💪', furnished:'🛋️', kitchen:'🍳',
  geyser:'🔥', lift:'🛗',
};
const TYPE_COLORS = {
  single:'#ff6b2b', double:'#3b82f6', hostel:'#10b981',
  '1bhk':'#f59e0b', studio:'#8b5cf6', dormitory:'#ec4899',
  triple:'#06b6d4', '2bhk':'#84cc16',
};
const BWU = { lat: 22.7320, lng: 88.4998 };
const GMAP_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

// Load Google Maps script once globally
function loadGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google?.maps) { resolve(); return; }
    if (window._gmapsLoading) { window._gmapsCallbacks = window._gmapsCallbacks || []; window._gmapsCallbacks.push(resolve); return; }
    window._gmapsLoading = true;
    window._gmapsInitCallback = () => {
      resolve();
      (window._gmapsCallbacks || []).forEach(cb => cb());
    };
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAP_KEY}&callback=_gmapsInitCallback&libraries=marker`;
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  });
}

export default function Rooms() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps);

  // Google Maps refs
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markersRef = useRef([]);
  const bwuCircle = useRef(null);
  const infoWindowRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minRent: '', maxRent: '',
    amenities: [], gender: '',
    search: searchParams.get('search') || '',
    messIncluded: false,
    page: 1,
    sort: searchParams.get('sort') || '-createdAt',
  });

  // Load Google Maps JS
  useEffect(() => {
    loadGoogleMaps().then(() => setMapsReady(true));
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type)     params.set('type', filters.type);
      if (filters.minRent)  params.set('minRent', filters.minRent);
      if (filters.maxRent)  params.set('maxRent', filters.maxRent);
      if (filters.gender)   params.set('gender', filters.gender);
      if (filters.search)   params.set('search', filters.search);
      const amenities = filters.messIncluded
        ? [...new Set([...filters.amenities, 'mess'])] : filters.amenities;
      if (amenities.length) params.set('amenities', amenities.join(','));
      params.set('page', filters.page);
      params.set('limit', viewMode === 'map' ? 100 : 12);
      params.set('sort', filters.sort);
      const res = await api.get(`/rooms?${params}`);
      setRooms(res.data.rooms || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, viewMode]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    let c = 0;
    if (filters.type) c++;
    if (filters.maxRent || filters.minRent) c++;
    if (filters.gender) c++;
    if (filters.amenities.length) c += filters.amenities.length;
    if (filters.messIncluded) c++;
    setActiveFiltersCount(c);
  }, [filters]);

  // ── INIT GOOGLE MAP ──────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'map' || !mapsReady || !mapRef.current || googleMap.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: BWU,
      zoom: 15,
      mapTypeId: 'satellite',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: ['roadmap', 'hybrid', 'satellite'],
      },
      streetViewControl: true,
      fullscreenControl: true,
      tilt: 0,
      gestureHandling: 'greedy', // single-finger scroll
      styles: [], // light theme — no dark override
    });

    googleMap.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // BWU marker
    new window.google.maps.Marker({
      position: BWU, map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 14, fillColor: '#3b82f6', fillOpacity: 1,
        strokeColor: '#fff', strokeWeight: 2,
      },
      title: '🎓 Brainware University',
      zIndex: 999,
    });

    // BWU label overlay
    const bwuLabel = document.createElement('div');
    bwuLabel.className = 'gmap-bwu-label';
    bwuLabel.textContent = '🎓 BWU Campus';
    new window.google.maps.OverlayView().setMap(map);

    // 2km radius circle
    bwuCircle.current = new window.google.maps.Circle({
      map, center: BWU, radius: 2000,
      strokeColor: '#ff6b2b', strokeOpacity: 0.5, strokeWeight: 1.5,
      fillColor: '#ff6b2b', fillOpacity: 0.04,
    });

  }, [viewMode, mapsReady]);

  // ── GOOGLE MAP MARKERS ───────────────────────────────────────
  useEffect(() => {
    if (viewMode !== 'map' || !googleMap.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    rooms.forEach(room => {
      const [lng, lat] = room.location?.coordinates || [BWU.lng, BWU.lat];
      const color = TYPE_COLORS[room.type] || '#ff6b2b';
      const rentLabel = `₹${room.rent >= 1000 ? Math.round(room.rent/1000) + 'k' : room.rent}`;

      // Invisible base marker — price shown by OverlayView div only (no duplicate label)
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: googleMap.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 0, // fully invisible — OverlayView handles the visual
        },
        title: room.title,
        zIndex: 100,
      });

      // Use custom div overlay for styled pill markers
      const markerDiv = document.createElement('div');
      markerDiv.className = 'gmap-price-pin';
      markerDiv.style.background = color;
      markerDiv.style.borderColor = color + '80';
      markerDiv.textContent = rentLabel;

      markerDiv.onmouseenter = () => {
        clearTimeout(hoverTimeoutRef.current);
        setSelectedRoom(room);
        googleMap.current.panTo({ lat, lng });
      };
      markerDiv.onmouseleave = () => {
        hoverTimeoutRef.current = setTimeout(() => setSelectedRoom(r => r?._id === room._id ? null : r), 300);
      };
      markerDiv.onclick = () => {
        clearTimeout(hoverTimeoutRef.current);
        setSelectedRoom(room);
        googleMap.current.panTo({ lat, lng });
        googleMap.current.setZoom(16);
      };

      // Use OverlayView for proper HTML markers
      const overlay = new (class extends window.google.maps.OverlayView {
        onAdd() {
          this.getPanes().overlayMouseTarget.appendChild(markerDiv);
        }
        draw() {
          const p = this.getProjection().fromLatLngToDivPixel(new window.google.maps.LatLng(lat, lng));
          if (p) {
            markerDiv.style.left = (p.x - markerDiv.offsetWidth / 2) + 'px';
            markerDiv.style.top = (p.y - markerDiv.offsetHeight - 8) + 'px';
          }
        }
        onRemove() { markerDiv.parentNode?.removeChild(markerDiv); }
      })();
      overlay.setMap(googleMap.current);
      marker._overlay = overlay;
      marker._div = markerDiv;

      markersRef.current.push(marker);
    });

  }, [rooms, viewMode, mapsReady]);

  // Cleanup overlays when switching views
  useEffect(() => {
    if (viewMode === 'list') {
      markersRef.current.forEach(m => { m._overlay?.setMap(null); m.setMap(null); });
      markersRef.current = [];
      googleMap.current = null;
    }
  }, [viewMode]);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const toggleAmenity = a => setFilters(f => ({
    ...f, page: 1,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));
  const clearAll = () => setFilters({ type:'', minRent:'', maxRent:'', amenities:[], gender:'', search:'', messIncluded:false, page:1, sort:'-createdAt' });
  const setBudget = v => setFilters(f => ({ ...f, maxRent: f.maxRent === String(v) ? '' : String(v), page: 1 }));

  const switchView = mode => {
    setSelectedRoom(null);
    setViewMode(mode);
  };

  return (
    <div className="rooms-page">
      <div className="container">

        {/* Header */}
        <div className="rooms-page-header">
          <div>
            <h1 className="page-title">Find Rooms</h1>
            <p className="page-subtitle">{total} rooms near Brainware University</p>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <div className="view-toggle">
              <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => switchView('list')}>
                ☰ List
              </button>
              <button className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => switchView('map')}>
                🗺️ Map
              </button>
            </div>
            <button className="btn btn-ghost btn-sm filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              🔧 Filters {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        {/* Search + sort */}
        <div className="rooms-search">
          <div className="rooms-search-input-wrap">
            <span className="rooms-search-icon">🔍</span>
            <input type="text" className="form-input rooms-search-input"
              placeholder="Search by area, landmark..." value={filters.search}
              onChange={e => set('search', e.target.value)} />
            {filters.search && <button className="rooms-search-clear" onClick={() => set('search', '')}>✕</button>}
          </div>
          <select className="form-input rooms-sort" value={filters.sort} onChange={e => set('sort', e.target.value)}>
            <option value="-createdAt">🆕 Newest</option>
            <option value="rent">💰 Cheapest</option>
            <option value="-rent">💎 Expensive</option>
            <option value="distanceFromCollege">📍 Nearest BWU</option>
            <option value="-rating">⭐ Top Rated</option>
          </select>
        </div>

        {/* Quick filter chips */}
        <div className="quick-filters">
          {BUDGET_PRESETS.map(b => (
            <button key={b.value} className={`filter-chip ${filters.maxRent === String(b.value) ? 'active' : ''}`}
              onClick={() => setBudget(b.value)}>Under {b.label}</button>
          ))}
          <div className="quick-filter-divider" />
          {['male','female'].map(g => (
            <button key={g} className={`filter-chip ${filters.gender === g ? 'active' : ''}`}
              onClick={() => set('gender', filters.gender === g ? '' : g)}>
              {g === 'male' ? '👨 Boys' : '👩 Girls'}
            </button>
          ))}
          <div className="quick-filter-divider" />
          <button className={`filter-chip ${filters.messIncluded ? 'active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, messIncluded: !f.messIncluded, page: 1 }))}>
            🍽️ Mess
          </button>
          <button className={`filter-chip ${filters.sort === 'distanceFromCollege' ? 'active' : ''}`}
            onClick={() => set('sort', filters.sort === 'distanceFromCollege' ? '-createdAt' : 'distanceFromCollege')}>
            📍 Near BWU
          </button>
          {activeFiltersCount > 0 && (
            <button className="filter-chip filter-chip-clear" onClick={clearAll}>✕ Clear</button>
          )}
        </div>

        <div className={`rooms-layout ${viewMode === 'map' ? 'map-mode' : ''}`}>

          {/* Filters sidebar — only in list mode */}
          {showFilters && viewMode === 'list' && (
            <aside className="filters-panel open">
              <div className="filters-panel-header">
                <h4>Filters</h4>
                <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear All</button>
              </div>
              <div className="filter-section">
                <h4>Room Type</h4>
                <div className="filter-chips">
                  {ROOM_TYPES.map(t => (
                    <button key={t} className={`filter-chip ${filters.type === t ? 'active' : ''}`}
                      onClick={() => set('type', filters.type === t ? '' : t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="filter-section">
                <h4>Budget (₹/month)</h4>
                <div className="filter-chips" style={{marginBottom:'10px'}}>
                  {BUDGET_PRESETS.map(b => (
                    <button key={b.value} className={`filter-chip ${filters.maxRent === String(b.value) ? 'active' : ''}`}
                      onClick={() => setBudget(b.value)}>Under {b.label}</button>
                  ))}
                </div>
                <div className="filter-range">
                  <input type="number" className="form-input" placeholder="Min ₹" value={filters.minRent} onChange={e => set('minRent', e.target.value)} />
                  <span>–</span>
                  <input type="number" className="form-input" placeholder="Max ₹" value={filters.maxRent} onChange={e => set('maxRent', e.target.value)} />
                </div>
              </div>
              <div className="filter-section">
                <h4>Gender</h4>
                <div className="filter-chips">
                  {[{v:'',l:'👥 All'},{v:'male',l:'👨 Boys'},{v:'female',l:'👩 Girls'}].map(g => (
                    <button key={g.v} className={`filter-chip ${filters.gender === g.v ? 'active' : ''}`}
                      onClick={() => set('gender', g.v)}>{g.l}</button>
                  ))}
                </div>
              </div>
              <div className="filter-section">
                <h4>Amenities</h4>
                <div className="filter-chips">
                  {AMENITIES.map(a => (
                    <button key={a}
                      className={`filter-chip ${filters.amenities.includes(a) || (a === 'mess' && filters.messIncluded) ? 'active' : ''}`}
                      onClick={() => a === 'mess' ? setFilters(f=>({...f,messIncluded:!f.messIncluded,page:1})) : toggleAmenity(a)}>
                      {AMENITY_ICONS[a]} {a}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm btn-block" onClick={() => setShowFilters(false)}>
                ✓ Show {total} Results
              </button>
            </aside>
          )}

          <main className="rooms-main">
            {loading && viewMode === 'list' ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : rooms.length === 0 && viewMode === 'list' ? (
              <div className="no-rooms">
                <div style={{fontSize:'52px',marginBottom:'16px'}}>🏚️</div>
                <h3>No rooms found</h3>
                <p style={{color:'var(--text-2)'}}>Try adjusting your filters</p>
                <button className="btn btn-outline" onClick={clearAll} style={{marginTop:'16px'}}>Clear Filters</button>
              </div>
            ) : viewMode === 'list' ? (
              <>
                <div className="rooms-grid">
                  {rooms.map(room => <RoomCard key={room._id} room={room} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={filters.page === 1}
                      onClick={() => setFilters(f=>({...f,page:f.page-1}))}>← Prev</button>
                    {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(p=>(
                      <button key={p} className={`page-btn ${filters.page===p?'active':''}`}
                        onClick={() => setFilters(f=>({...f,page:p}))}>{p}</button>
                    ))}
                    <button className="page-btn" disabled={filters.page===pages}
                      onClick={() => setFilters(f=>({...f,page:f.page+1}))}>Next →</button>
                  </div>
                )}
              </>
            ) : (
              /* ── GOOGLE MAP VIEW ── */
              <div className="map-view-container">
                {!mapsReady && (
                  <div className="map-loading-overlay">
                    <div className="spinner" />
                    <span>Loading Google Maps...</span>
                  </div>
                )}
                <div ref={mapRef} className="gmap-canvas" />

                {/* Room count */}
                <div className="map-room-count">
                  📍 {rooms.length} rooms on map
                </div>

                {/* Legend */}
                <div className="map-legend">
                  {Object.entries(TYPE_COLORS).slice(0,5).map(([t,c]) => (
                    <div key={t} className="map-legend-item">
                      <div className="map-legend-dot" style={{background:c}} />
                      <span>{t}</span>
                    </div>
                  ))}
                  <div className="map-legend-item">
                    <div className="map-legend-dot" style={{background:'#3b82f6'}} />
                    <span>BWU Campus</span>
                  </div>
                </div>

                {/* Selected room card */}
                {selectedRoom && (
                  <div className="map-selected-card" onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)} onMouseLeave={() => { hoverTimeoutRef.current = setTimeout(() => setSelectedRoom(null), 200); }}>
                    <button className="map-card-close" onClick={() => setSelectedRoom(null)}>✕</button>
                    <div className="map-card-img">
                      {selectedRoom.images?.[0]?.url
                        ? <img src={selectedRoom.images[0].url} alt={selectedRoom.title} />
                        : <div className="map-card-no-img">🏠</div>}
                      <span className="map-card-type-badge"
                        style={{background: TYPE_COLORS[selectedRoom.type] || '#ff6b2b'}}>
                        {selectedRoom.type}
                      </span>
                    </div>
                    <div className="map-card-body">
                      <h3 className="map-card-title">{selectedRoom.title}</h3>
                      <p className="map-card-addr">📍 {selectedRoom.address?.area}, {selectedRoom.address?.city}</p>
                      <div className="map-card-meta">
                        <span className="map-card-price">
                          ₹{selectedRoom.rent?.toLocaleString()}<small>/mo</small>
                        </span>
                        {selectedRoom.distanceFromCollege != null && (
                          <span>🎓 {selectedRoom.distanceFromCollege.toFixed(1)} km</span>
                        )}
                        {selectedRoom.rating > 0 && <span>⭐ {selectedRoom.rating.toFixed(1)}</span>}
                      </div>
                      {selectedRoom.amenities?.length > 0 && (
                        <div className="map-card-amenities">
                          {selectedRoom.amenities.slice(0,4).map(a=>(
                            <span key={a} className="map-amenity-pill">{AMENITY_ICONS[a]||'✓'} {a}</span>
                          ))}
                          {selectedRoom.amenities.length > 4 && (
                            <span className="map-amenity-pill">+{selectedRoom.amenities.length-4}</span>
                          )}
                        </div>
                      )}
                      <div className="map-card-actions">
                        <button className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/rooms/${selectedRoom._id}`)}>
                          View Details →
                        </button>
                        {(selectedRoom.contactWhatsapp || selectedRoom.owner?.phone) && (
                          user ? (
                            <a href={`https://wa.me/${(selectedRoom.contactWhatsapp||selectedRoom.owner?.phone).replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I saw "${selectedRoom.title}" on BWU Rooms — is it available?`)}`}
                              target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-sm">
                              💬 WhatsApp
                            </a>
                          ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
                              🔐 Sign in to Contact
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
