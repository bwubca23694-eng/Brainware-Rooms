import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

export default function BottomNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Only show on mobile — CSS handles display:none on desktop
  const dashLink = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'owner'
    ? '/owner/dashboard'
    : '/dashboard';

  const tabs = [
    { to: '/',       icon: '🏠', label: 'Home',    match: p => p === '/' },
    { to: '/rooms',  icon: '🔍', label: 'Rooms',   match: p => p.startsWith('/rooms') },
    { to: '/roommates', icon: '🤝', label: 'Mates', match: p => p.startsWith('/roommates') },
    user
      ? { to: dashLink, icon: user.avatar
          ? <img src={user.avatar} alt="" style={{width:'22px',height:'22px',borderRadius:'50%',objectFit:'cover'}} />
          : <span style={{width:'22px',height:'22px',borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>{user.name?.[0]?.toUpperCase()}</span>,
          label: 'Profile', match: p => p.startsWith('/dashboard') || p.startsWith('/owner') || p.startsWith('/admin') || p.startsWith('/saved') }
      : { to: '/login', icon: '👤', label: 'Sign In', match: p => p.startsWith('/login') || p.startsWith('/register') },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = tab.match(pathname);
        return (
          <Link key={tab.to} to={tab.to} className={`bottom-nav-item ${active ? 'active' : ''}`}>
            <div className="bottom-nav-icon">
              {typeof tab.icon === 'string' ? <span>{tab.icon}</span> : tab.icon}
              {active && <div className="bottom-nav-dot" />}
            </div>
            <span className="bottom-nav-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
