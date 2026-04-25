// hooks/usePushNotifications.ts
import { useEffect } from 'react';
import { registerPushSubscription } from '../utils/pushNotifications'; // Import your utility

/**
 * Custom hook to initiate the push notification registration process 
 * when the user is authenticated.
 * @param token The user's authentication token.
 */
export const usePushNotifications = (token: string | null | undefined) => {
    useEffect(() => {
        // Only run if the user has a valid token and we haven't already denied.
        if (token && Notification.permission !== 'denied') {
            console.log('Attempting to register push subscription...');
            // Call the robust utility function you created
            registerPushSubscription(token); 
        }
        
    }, [token]);
    // The dependency on 'token' ensures subscription is only attempted 
    // after successful login or if the token state changes.
};