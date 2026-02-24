import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import RoomCard from '../components/rooms/RoomCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ rooms: 0, students: 0, owners: 0 });

  useEffect(() => {
    api.get('/rooms?limit=6&sort=-views').then(res => setFeaturedRooms(res.data.rooms || [])).catch(() => {});
    api.get('/rooms?limit=1').then(res => setStats(s => ({ ...s, rooms: res.data.total || 0 }))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?search=${search}`);
  };

  const roomTypes = [
    { type: 'single', label: 'Single Room', icon: '🛏️', desc: 'Private single occupancy' },
    { type: 'double', label: 'Double Sharing', icon: '🛏️🛏️', desc: 'Affordable 2-person room' },
    { type: 'hostel', label: 'Hostel', icon: '🏨', desc: 'Dormitory style stays' },
    { type: '1bhk', label: '1 BHK', icon: '🏠', desc: 'Full apartment' },
    { type: 'studio', label: 'Studio', icon: '🏢', desc: 'Compact studio flat' },
    { type: 'dormitory', label: 'Dormitory', icon: '🏫', desc: 'Budget group accommodation' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid"></div>
          <div className="hero-glow"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span>📍</span> Near Brainware University, Barasat
          </div>
          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="hero-highlight">Student Home</span>
          </h1>
          <p className="hero-subtitle">
            Discover verified rooms, hostels, and PGs near Brainware University. 
            Safe, affordable, and student-friendly.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by area, type, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="hero-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search Rooms</button>
          </form>
          <div className="hero-stats">
            <div><strong>{stats.rooms}+</strong> <span>Listed Rooms</span></div>
            <div><strong>100%</strong> <span>Verified Owners</span></div>
            <div><strong>0</strong> <span>Brokerage</span></div>
          </div>
        </div>
      </section>

      {/* Room Types */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Room Types</h2>
            <p className="section-sub">Browse by accommodation type</p>
          </div>
          <div className="types-grid">
            {roomTypes.map(rt => (
              <Link key={rt.type} to={`/rooms?type=${rt.type}`} className="type-card">
                <div className="type-icon">{rt.icon}</div>
                <div className="type-label">{rt.label}</div>
                <div className="type-desc">{rt.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      {featuredRooms.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Rooms</h2>
              <Link to="/rooms" className="btn btn-outline btn-sm">View All →</Link>
            </div>
            <div className="rooms-grid">
              {featuredRooms.map(room => <RoomCard key={room._id} room={room} />)}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="section how-section">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-num">01</div>
              <h3>Search Rooms</h3>
              <p>Browse available rooms near Brainware University filtered by type, price, and amenities.</p>
            </div>
            <div className="how-card">
              <div className="how-num">02</div>
              <h3>Connect with Owner</h3>
              <p>Contact verified room owners directly or send a booking request through our platform.</p>
            </div>
            <div className="how-card">
              <div className="how-num">03</div>
              <h3>Move In</h3>
              <p>Visit the property, confirm the booking, and move into your new student home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for owners */}
      <section className="section">
        <div className="container">
          <div className="owner-cta">
            <div>
              <h2>Are you a Room Owner?</h2>
              <p>List your property for free and connect with thousands of Brainware students looking for accommodation.</p>
            </div>
            <Link to="/register?role=owner" className="btn btn-primary btn-lg">List Your Property →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
