import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging'; // 🌟 NEW: Import Messaging functions

// Use environment variables for Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if the API key is present before initializing to avoid errors
if (!firebaseConfig.apiKey) {
    throw new Error('Firebase configuration environment variables are missing.');
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🌟 NEW: Initialize Firebase Messaging
export const messaging = getMessaging(app);

// --- FCM Functions (Optional to keep here, but useful for context/export) ---

// 🔑 Get VAPID Key from Firebase Project settings > Cloud Messaging > Web Push Certificates
// NOTE: This should also be in a .env file for a real app, but using a placeholder here.
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY; 

/**
 * Requests notification permission and retrieves the FCM token.
 * This token MUST be sent to your backend and saved against the user's ID.
 */
export const requestPermissionAndGetToken = async (userId: string | null) => {
    if (!userId) return null;

    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            // Service worker must be registered first before calling getToken
            // VITE_FIREBASE_MESSAGING_SENDER_ID is used as the VAPID key in some setups, but using a specific VAPID_KEY is more standard.
            const token = await getToken(messaging, { vapidKey: VAPID_KEY }); 
            console.log(`FCM Registration Token for ${userId}:`, token);

            // TODO: Call your API to save this token to the user's document in Firestore/your database
            // Example: await saveFCMTokenToDatabase(userId, token);

            return token;
        } else {
            console.warn('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Listens for messages while the application is in the foreground.
 */
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('Message received in foreground:', payload);
            // You can use this payload to display an in-app toast/alert
            resolve(payload); 
        });
    });

// -------------------------------------------------------------------