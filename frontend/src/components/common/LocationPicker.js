import React, { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

const BWU = { lat: 22.7320, lng: 88.4998 };
const GMAP_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

function loadGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google?.maps) { resolve(); return; }
    if (window._gmapsLoading) { window._gmapsCallbacks = window._gmapsCallbacks || []; window._gmapsCallbacks.push(resolve); return; }
    window._gmapsLoading = true;
    window._gmapsInitCallback = () => { resolve(); (window._gmapsCallbacks||[]).forEach(cb=>cb()); };
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAP_KEY}&callback=_gmapsInitCallback&libraries=places`;
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  });
}

export default function LocationPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(BWU); // always start centred on BWU
  const [locating, setLocating] = useState(false);
  const [address, setAddress] = useState('');
  const [mapsReady, setMapsReady] = useState(!!window.google?.maps);

  useEffect(() => {
    loadGoogleMaps().then(() => setMapsReady(true));
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || googleMap.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: BWU, zoom: 16,
      mapTypeId: 'roadmap',
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.BOTTOM_CENTER,
        mapTypeIds: ['roadmap', 'hybrid', 'satellite'],
      },
      streetViewControl: false,
      fullscreenControl: false,
      tilt: 0,
      styles: [], // force light theme (no dark override)
    });
    googleMap.current = map;

    // BWU marker (fixed reference point)
    new window.google.maps.Marker({
      position: BWU, map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12, fillColor: '#3b82f6', fillOpacity: 1,
        strokeColor: '#fff', strokeWeight: 2,
      },
      title: '🎓 Brainware University', zIndex: 999,
    });

    // 1km radius to guide owner
    new window.google.maps.Circle({
      map, center: BWU, radius: 1000,
      strokeColor: '#ff6b2b', strokeOpacity: 0.4, strokeWeight: 1,
      fillColor: '#ff6b2b', fillOpacity: 0.03,
    });

    // Draggable room marker
    const marker = new window.google.maps.Marker({
      position: coords, map, draggable: true,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 8, fillColor: '#ff6b2b', fillOpacity: 1,
        strokeColor: '#fff', strokeWeight: 2,
      },
      title: 'Your room location — drag to adjust',
      zIndex: 100,
    });
    markerRef.current = marker;

    // Drag end
    marker.addListener('dragend', e => {
      updateCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });

    // Click on map
    map.addListener('click', e => {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      marker.setPosition(pos);
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 600);
      updateCoords(pos);
    });

// search box removed

    // Reverse geocode initial position
    reverseGeocode(coords);

  }, [mapsReady]);

  const reverseGeocode = (pos) => {
    if (!window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
      }
    });
  };

  const updateCoords = (pos) => {
    setCoords(pos);
    onChange({ coordinates: [pos.lng, pos.lat] }); // GeoJSON: [lng, lat]
    reverseGeocode(pos);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const pos = { lat, lng };
        if (markerRef.current) {
          markerRef.current.setPosition(pos);
          markerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => markerRef.current?.setAnimation(null), 800);
        }
        if (googleMap.current) {
          googleMap.current.panTo(pos);
          googleMap.current.setZoom(17);
        }
        updateCoords(pos);
        setLocating(false);
      },
      () => { setLocating(false); alert('Location access denied. Please click the map to pin your room.'); }
    );
  };

  const centreOnBWU = () => {
    if (googleMap.current) { googleMap.current.panTo(BWU); googleMap.current.setZoom(15); }
  };

  return (
    <div className="location-picker">
<div className="lp-toolbar">
        <button type="button" className="lp-btn lp-btn-primary" onClick={useCurrentLocation} disabled={locating || !mapsReady}>
          {locating ? '⏳ Locating...' : '📍 Use My Current Location'}
        </button>
        <button type="button" className="lp-btn" onClick={centreOnBWU} disabled={!mapsReady}>
          🎓 Centre on BWU
        </button>
      </div>

      {address && (
        <div className="lp-address">
          <span>📌</span>
          <span>{address}</span>
        </div>
      )}

      {!mapsReady && (
        <div className="lp-loading">
          <div className="spinner" style={{width:24,height:24}} />
          <span>Loading map...</span>
        </div>
      )}

      <div className="lp-hint">
        <strong>Click anywhere on the map</strong> to place your room pin, or <strong>drag the orange arrow</strong> to adjust
      </div>

      <div ref={mapRef} className="lp-map" />

      <div className="lp-coords">
        🌐 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
      </div>
    </div>
  );
}
