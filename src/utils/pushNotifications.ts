// src/utils/pushNotifications.ts

export const registerPushSubscription = async (token: string) => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported by this browser.');
      return;
    }

    const prodHosts = new Set(['www.gradmanagers.com', 'gradmanagers.com']);
    const isProductionHost = prodHosts.has(window.location.hostname);

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

    // Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Push notifications permission not granted.');
      return;
    }

    // --- FIX: Safe conversion helper ---
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    // Get your public VAPID key from .env
    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
      console.error('Missing VITE_VAPID_PUBLIC_KEY in environment.');
      return;
    }

    // --- FIX: Explicitly cast Uint8Array to BufferSource ---
    const applicationServerKey = urlBase64ToUint8Array(publicVapidKey) as unknown as BufferSource;

    // Auto-migration: in production, rotate existing subscriptions to ensure a fresh prod-scoped registration
    let subscription = await registration.pushManager.getSubscription();
    if (isProductionHost && subscription) {
      try {
        await subscription.unsubscribe();
      } catch (err) {
        console.warn('Failed to unsubscribe old push subscription:', err);
      }
      subscription = null;
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // Send to backend
    await fetch(`${import.meta.env.VITE_API_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...subscription,
        clientOrigin: window.location.origin,
      }),
    });

    console.log('✅ Push subscription registered successfully!');
  } catch (error) {
    console.error('❌ Error registering push subscription:', error);
  }
};
