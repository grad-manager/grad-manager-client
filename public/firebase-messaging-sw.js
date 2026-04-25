// public/firebase-messaging-sw.js

// Note: These imports use Firebase SDK v8 syntax (importScripts)
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// 🔑 IMPORTANT: Replace these placeholders with your ACTUAL config values.
// Environment variables like import.meta.env are NOT automatically available here.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (using v8 style as required by importScripts)
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

/**
 * Handler for background messages (when the app is closed or not focused).
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification?.body || 'You have new activity.',
        icon: '/logo.png', // Ensure this icon exists in your 'public' folder
        data: payload.data, // Attach custom data for click handling
        // You can also add actions, image, badge, etc., here.
    };

    // Displays the system notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});