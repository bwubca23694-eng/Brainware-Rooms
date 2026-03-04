import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import RoomCard from '../components/rooms/RoomCard';
import './Home.css';

const roomTypes = [
  { type: 'single', label: 'Single Room', icon: '🛏️', color: '#ff6b2b' },
  { type: 'double', label: 'Double Sharing', icon: '👥', color: '#3b82f6' },
  { type: 'hostel', label: 'Hostel', icon: '🏨', color: '#10b981' },
  { type: '1bhk', label: '1 BHK Flat', icon: '🏠', color: '#f59e0b' },
  { type: 'studio', label: 'Studio', icon: '🏢', color: '#8b5cf6' },
  { type: 'dormitory', label: 'Dormitory', icon: '🏫', color: '#ec4899' },
];

const amenityHighlights = [
  { icon: '📶', label: 'Free WiFi', desc: 'High-speed internet' },
  { icon: '🍽️', label: 'Mess Food', desc: 'Daily meals included' },
  { icon: '🔒', label: 'Safe & Secure', desc: '24/7 security' },
  { icon: '📍', label: '< 2 km Away', desc: 'Walking distance' },
  { icon: '💰', label: 'No Brokerage', desc: 'Direct from owners' },
  { icon: '✅', label: 'Verified Rooms', desc: 'Owner verified' },
];

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [totalRooms, setTotalRooms] = useState(0);

  useEffect(() => {
    api.get('/rooms?limit=6&sort=-views&status=approved').then(r => {
      setRooms(r.data.rooms || []);
      setTotalRooms(r.data.total || 0);
    }).catch(() => {});
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    navigate(`/rooms${search ? `?search=${search}` : ''}`);
  };

  return (
    <div className="home">

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-grid-overlay" />

        <div className="container hero-content">
          <div className="hero-left">
            <div className="hero-pill animate-in" style={{ animationDelay: '0ms' }}>
              <span className="hero-pill-dot" />
              📍 Near Brainware University, Barasat
            </div>

            <h1 className="hero-title animate-in" style={{ animationDelay: '80ms' }}>
              Your Home Away<br />
              <span className="hero-title-gradient">From Home</span>
            </h1>

            <p className="hero-desc animate-in" style={{ animationDelay: '140ms' }}>
              Find safe, affordable rooms & hostels near Brainware University.
              Trusted by hundreds of BWU students — zero brokerage, direct owner contact.
            </p>

            <form className="hero-search animate-in" onSubmit={handleSearch} style={{ animationDelay: '200ms' }}>
              <div className="hero-search-field">
                <span className="hero-search-icon">🔍</span>
                <input
                  className="hero-search-input"
                  placeholder="Search area, type, price..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg hero-search-btn">
                Find Rooms
              </button>
            </form>

            <div className="hero-stats animate-in" style={{ animationDelay: '260ms' }}>
              <div className="hero-stat">
                <span className="hero-stat-num">{totalRooms > 0 ? `${totalRooms}+` : '50+'}</span>
                <span className="hero-stat-lbl">Listed Rooms</span>
              </div>
              <div className="hero-stat-div" />
              <div className="hero-stat">
                <span className="hero-stat-num">100%</span>
                <span className="hero-stat-lbl">Verified Owners</span>
              </div>
              <div className="hero-stat-div" />
              <div className="hero-stat">
                <span className="hero-stat-num">₹0</span>
                <span className="hero-stat-lbl">Brokerage Fee</span>
              </div>
            </div>
          </div>

          <div className="hero-right animate-in" style={{ animationDelay: '100ms' }}>
            <div className="hero-card hero-card-main">
              <div className="hero-card-image">🏠</div>
              <div className="hero-card-info">
                <div className="hero-card-title">Cozy Single Room</div>
                <div className="hero-card-addr">Nabapally, Barasat</div>
                <div className="hero-card-row">
                  <span className="hero-card-price">₹4,500<span>/mo</span></span>
                  <span className="badge badge-green">Available</span>
                </div>
              </div>
            </div>

            <div className="hero-float-badge hero-badge-distance">
              📍 1.2 km from BWU
            </div>
            <div className="hero-float-badge hero-badge-wifi">
              📶 Free WiFi
            </div>
            <div className="hero-float-badge hero-badge-verified">
              ✅ Verified
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────── */}
      <div className="trust-bar">
        <div className="container trust-inner">
          {amenityHighlights.map(a => (
            <div key={a.label} className="trust-item">
              <span className="trust-icon">{a.icon}</span>
              <div>
                <div className="trust-label">{a.label}</div>
                <div className="trust-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROOM TYPES ───────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Browse by Type</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '14px', marginTop: '4px' }}>Find exactly what suits your budget and lifestyle</p>
            </div>
            <Link to="/rooms" className="btn btn-ghost btn-sm">See All →</Link>
          </div>
          <div className="types-grid">
            {roomTypes.map(rt => (
              <Link key={rt.type} to={`/rooms?type=${rt.type}`} className="type-card">
                <div className="type-icon-wrap" style={{ background: `${rt.color}15`, border: `1px solid ${rt.color}30` }}>
                  <span className="type-icon">{rt.icon}</span>
                </div>
                <span className="type-label">{rt.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ROOMS ───────────────────────── */}
      {rooms.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">🔥 Popular Near BWU</h2>
                <p style={{ color: 'var(--text-2)', fontSize: '14px', marginTop: '4px' }}>Most viewed rooms this week</p>
              </div>
              <Link to="/rooms" className="btn btn-outline btn-sm">View All →</Link>
            </div>
            <div className="rooms-grid">
              {rooms.map(room => <RoomCard key={room._id} room={room} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="section how-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title">How It Works</h2>
            <p style={{ color: 'var(--text-2)', marginTop: '10px', fontSize: '15px' }}>Move into your new room in 3 simple steps</p>
          </div>
          <div className="how-grid">
            {[
              { num: '01', icon: '🔍', title: 'Search Rooms', desc: 'Filter by distance, price, type, and amenities. Find rooms within walking distance from BWU.' },
              { num: '02', icon: '💬', title: 'Contact Owner', desc: 'Directly call or WhatsApp the owner. No middleman, no brokerage — completely free.' },
              { num: '03', icon: '🏠', title: 'Move In!', desc: 'Visit the room, confirm booking through the app, and get settled in your new home.' },
            ].map((step, i) => (
              <div key={i} className="how-card">
                <div className="how-num">{step.num}</div>
                <div className="how-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OWNER CTA ────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="owner-cta">
            <div className="owner-cta-emoji">🏠</div>
            <div className="owner-cta-text">
              <div className="owner-cta-pill">For Property Owners</div>
              <h2>Got a Room Near BWU?</h2>
              <p>List your property for free and get direct bookings from Brainware University students. No commission, no middleman — just students looking for a home.</p>
              <div className="owner-cta-actions">
                <Link to="/register?role=owner" className="btn btn-primary btn-lg">List Property Free →</Link>
                <Link to="/rooms" className="btn btn-ghost">See Example Listings</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
