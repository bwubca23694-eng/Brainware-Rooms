import React, { useState, useEffect } from 'react';
import { initInstallPrompt, triggerInstall, isInstalled, subscribeToPush, getPushStatus } from '../../utils/pwa';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './InstallBanner.css';

export default function InstallBanner() {
  const { user } = useAuth();
  const [showInstall, setShowInstall] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isInstalled()) return; // already installed
    if (localStorage.getItem('bwu-install-dismissed')) return;

    initInstallPrompt(available => setShowInstall(available));

    // Check push notification status for logged-in users
    if (user) {
      getPushStatus().then(({ supported, subscribed, permission }) => {
        if (supported && !subscribed && permission === 'default') {
          setShowPush(true);
        }
      });
    }
  }, [user]);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await triggerInstall();
    if (accepted) setShowInstall(false);
    setInstalling(false);
  };

  const handleEnablePush = async () => {
    const ok = await subscribeToPush(api);
    if (ok) setShowPush(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('bwu-install-dismissed', '1');
  };

  if (dismissed || (!showInstall && !showPush)) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <div className="install-banner-icon">
          {showInstall ? '📲' : '🔔'}
        </div>
        <div className="install-banner-text">
          <strong>{showInstall ? 'Add BWU Rooms to your phone!' : 'Get instant notifications'}</strong>
          <span>
            {showInstall
              ? 'Install the app for faster access — works offline too'
              : 'Know immediately when your booking is confirmed'}
          </span>
        </div>
        <div className="install-banner-actions">
          {showInstall && (
            <button className="btn btn-primary btn-sm" onClick={handleInstall} disabled={installing}>
              {installing ? 'Installing...' : '⬇️ Install'}
            </button>
          )}
          {showPush && !showInstall && (
            <button className="btn btn-primary btn-sm" onClick={handleEnablePush}>
              🔔 Enable
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleDismiss}>✕</button>
        </div>
      </div>
    </div>
  );
}
