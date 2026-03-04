import React, { useState, useEffect } from 'react';
import { initInstallPrompt, triggerInstall, isInstalled } from '../../utils/pwa';
import './InstallBanner.css';

// Detect platform
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = () => /android/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function InstallBanner() {
  const [canInstall, setCanInstall] = useState(false);   // Android: native prompt available
  const [showIOSGuide, setShowIOSGuide] = useState(false); // iOS: show manual steps
  const [showGuide, setShowGuide] = useState(false);      // show the how-to sheet
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Already installed as PWA — hide everything
    if (isInStandaloneMode() || isInstalled()) return;
    if (localStorage.getItem('bwu-install-dismissed-v2')) return;

    // iOS: can't use native prompt, show manual guide instead
    if (isIOS()) {
      setShowIOSGuide(true);
      return;
    }

    // Android Chrome: listen for native install prompt
    initInstallPrompt(available => setCanInstall(available));
  }, []);

  const handleInstall = async () => {
    if (isIOS()) { setShowGuide(true); return; }
    setInstalling(true);
    await triggerInstall();
    setInstalling(false);
    setCanInstall(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('bwu-install-dismissed-v2', '1');
  };

  // Nothing to show
  if (dismissed || (!canInstall && !showIOSGuide)) return null;

  return (
    <>
      {/* Bottom install bar */}
      <div className="install-bar">
        <div className="install-bar-icon">
          <img src="/icon-192.png" alt="BWU Rooms" />
        </div>
        <div className="install-bar-text">
          <strong>Install BWU Rooms</strong>
          <span>Use it like a real app — no Play Store needed</span>
        </div>
        <div className="install-bar-actions">
          <button className="install-btn-yes" onClick={handleInstall} disabled={installing}>
            {installing ? '...' : 'Install'}
          </button>
          <button className="install-btn-no" onClick={handleDismiss}>✕</button>
        </div>
      </div>

      {/* iOS how-to bottom sheet */}
      {showGuide && (
        <div className="install-sheet-overlay" onClick={() => setShowGuide(false)}>
          <div className="install-sheet" onClick={e => e.stopPropagation()}>
            <div className="install-sheet-handle" />
            <div className="install-sheet-header">
              <img src="/icon-192.png" alt="BWU Rooms" className="install-sheet-icon" />
              <div>
                <h3>Install BWU Rooms</h3>
                <p>Works like a real app — fullscreen, no Chrome bar</p>
              </div>
            </div>

            <div className="install-steps">
              <div className="install-step">
                <div className="install-step-num">1</div>
                <div className="install-step-text">
                  {isIOS()
                    ? <>Tap the <strong>Share button</strong> <span className="install-step-icon">⎙</span> at the bottom of Safari</>
                    : <>Tap the <strong>3-dot menu</strong> <span className="install-step-icon">⋮</span> in Chrome's top right</>
                  }
                </div>
              </div>
              <div className="install-step">
                <div className="install-step-num">2</div>
                <div className="install-step-text">
                  {isIOS()
                    ? <>Scroll down and tap <strong>"Add to Home Screen"</strong></>
                    : <>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></>
                  }
                </div>
              </div>
              <div className="install-step">
                <div className="install-step-num">3</div>
                <div className="install-step-text">
                  Tap <strong>"Add"</strong> — BWU Rooms will appear on your home screen like any app 🎉
                </div>
              </div>
            </div>

            <div className="install-sheet-result">
              <span>✅ Fullscreen</span>
              <span>✅ No Chrome bar</span>
              <span>✅ Works offline</span>
              <span>✅ Push notifications</span>
            </div>

            <button className="btn btn-primary" style={{width:'100%', marginTop:'8px'}}
              onClick={() => { setShowGuide(false); handleDismiss(); }}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
