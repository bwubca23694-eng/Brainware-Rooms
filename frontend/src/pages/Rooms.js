import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import RoomCard from '../components/rooms/RoomCard';
import './Rooms.css';

const AMENITIES_OPTIONS = ['wifi', 'ac', 'parking', 'laundry', 'mess', 'security', 'cctv', 'gym', 'furnished', 'kitchen', 'geyser', 'lift'];
const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory', 'studio', 'hostel', '1bhk', '2bhk'];

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minRent: '',
    maxRent: '',
    amenities: [],
    gender: '',
    search: searchParams.get('search') || '',
    page: 1,
    sort: '-createdAt',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.minRent) params.set('minRent', filters.minRent);
      if (filters.maxRent) params.set('maxRent', filters.maxRent);
      if (filters.amenities.length) params.set('amenities', filters.amenities.join(','));
      if (filters.gender) params.set('gender', filters.gender);
      if (filters.search) params.set('search', filters.search);
      params.set('page', filters.page);
      params.set('limit', 12);
      params.set('sort', filters.sort);

      const res = await api.get(`/rooms?${params}`);
      setRooms(res.data.rooms || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));
  
  const toggleAmenity = (a) => {
    setFilters(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
      page: 1,
    }));
  };

  const clearFilters = () => setFilters({ type: '', minRent: '', maxRent: '', amenities: [], gender: '', search: '', page: 1, sort: '-createdAt' });

  return (
    <div className="rooms-page">
      <div className="container">
        <div className="rooms-page-header">
          <div>
            <h1 className="page-title">Find Rooms</h1>
            <p className="page-subtitle">{total} rooms available near Brainware University</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {/* Search bar */}
        <div className="rooms-search">
          <input
            type="text"
            className="form-input"
            placeholder="Search by area, landmark, or room type..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
          />
          <select className="form-input" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
            <option value="-createdAt">Newest First</option>
            <option value="rent">Price: Low to High</option>
            <option value="-rent">Price: High to Low</option>
            <option value="distanceFromCollege">Nearest First</option>
            <option value="-rating">Top Rated</option>
          </select>
        </div>

        <div className="rooms-layout">
          {/* Filters sidebar */}
          <aside className={`filters-panel ${showFilters ? 'open' : ''}`}>
            <div className="filter-section">
              <h4>Room Type</h4>
              <div className="filter-chips">
                {ROOM_TYPES.map(t => (
                  <button key={t} className={`filter-chip ${filters.type === t ? 'active' : ''}`}
                    onClick={() => updateFilter('type', filters.type === t ? '' : t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Monthly Rent (₹)</h4>
              <div className="filter-range">
                <input type="number" className="form-input" placeholder="Min" value={filters.minRent}
                  onChange={e => updateFilter('minRent', e.target.value)} />
                <span>–</span>
                <input type="number" className="form-input" placeholder="Max" value={filters.maxRent}
                  onChange={e => updateFilter('maxRent', e.target.value)} />
              </div>
            </div>

            <div className="filter-section">
              <h4>Gender</h4>
              <div className="filter-chips">
                {['any', 'male', 'female'].map(g => (
                  <button key={g} className={`filter-chip ${filters.gender === g ? 'active' : ''}`}
                    onClick={() => updateFilter('gender', filters.gender === g ? '' : g)}>
                    {g === 'any' ? '👥 All' : g === 'male' ? '👨 Boys' : '👩 Girls'}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Amenities</h4>
              <div className="filter-chips">
                {AMENITIES_OPTIONS.map(a => (
                  <button key={a} className={`filter-chip ${filters.amenities.includes(a) ? 'active' : ''}`}
                    onClick={() => toggleAmenity(a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-ghost btn-sm btn-block" onClick={clearFilters}>Clear All Filters</button>
          </aside>

          {/* Room list */}
          <main className="rooms-main">
            {loading ? (
              <div className="loading-center"><div className="spinner"></div></div>
            ) : rooms.length === 0 ? (
              <div className="no-rooms">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏚️</div>
                <h3>No rooms found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: '16px' }}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="rooms-grid">
                  {rooms.map(room => <RoomCard key={room._id} room={room} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, page: p }))}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
