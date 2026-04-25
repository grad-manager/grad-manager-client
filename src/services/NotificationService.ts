// src/services/NotificationService.ts

import axios from 'axios';

// Ensure this matches your environment variable setup
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'; 

/**
 * Sends a push notification request to the server to broadcast a new post 
 * notification to all subscribed users (excluding the sender).
 * * @param postAuthorName The name of the user who created the post.
 * @param postContent The content snippet of the new post (for the body).
 * @param token The user's authentication token (needed for verifyToken middleware).
 */
export const notifyNewPostBroadcast = async (
    postAuthorName: string, 
    postContent: string,
    token: string // Pass the token for authentication
) => {
    
    // Use the first 80 characters for the body preview
    const bodyPreview = postContent.length > 80 
        ? `${postContent.substring(0, 80)}...`
        : postContent;

    try {
        await axios.post(`${API_BASE_URL}/push/broadcast`, 
            {
                title: `📢 New Post by ${postAuthorName}`,
                body: bodyPreview,
                // The 'data' object is passed to the Service Worker
                data: {
                    url: '/feed', 
                    type: 'new-post'
                }
            },
            {
                // Attach the Authorization header for the verifyToken middleware
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
    } catch (error) {
        // Log the error but do NOT throw, as the post itself succeeded.
        console.error("Failed to send push notification broadcast:", error);
    }
};