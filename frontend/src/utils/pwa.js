// PWA Utilities — Service Worker + Push Notifications

// ── Register Service Worker ────────────────────
export const registerSW = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ Service Worker registered');
    return reg;
  } catch (err) {
    console.warn('SW registration failed:', err);
    return null;
  }
};

// ── Convert VAPID key for subscription ────────
const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
};

// ── Request Push Permission + Subscribe ───────
export const subscribeToPush = async (apiInstance) => {
  if (!('PushManager' in window)) {
    console.warn('Push not supported');
    return false;
  }
  try {
    // Get VAPID public key from backend
    const { data } = await apiInstance.get('/notifications/vapid-key');
    if (!data.publicKey) return false;

    const reg = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });

    // Save subscription to backend
    await apiInstance.post('/notifications/subscribe', { subscription });
    console.log('✅ Push subscription active');
    return true;
  } catch (err) {
    console.warn('Push subscription failed:', err);
    return false;
  }
};

// ── Unsubscribe from Push ─────────────────────
export const unsubscribeFromPush = async (apiInstance) => {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await apiInstance.delete('/notifications/unsubscribe', {
        data: { endpoint: sub.endpoint }
      });
      await sub.unsubscribe();
    }
    return true;
  } catch (err) {
    console.warn('Unsubscribe error:', err);
    return false;
  }
};

// ── Check current push status ─────────────────
export const getPushStatus = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false, subscribed: false, permission: 'default' };
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return {
      supported: true,
      subscribed: !!sub,
      permission: Notification.permission,
    };
  } catch {
    return { supported: true, subscribed: false, permission: 'default' };
  }
};

// ── PWA Install Prompt ────────────────────────
let deferredInstallPrompt = null;

export const initInstallPrompt = (callback) => {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    callback(true); // signal that install is available
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    callback(false);
    console.log('✅ BWU Rooms installed as PWA');
  });
};

export const triggerInstall = async () => {
  if (!deferredInstallPrompt) return false;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome === 'accepted';
};

export const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;
