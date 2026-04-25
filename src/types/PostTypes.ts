// src/types/PostTypes.ts (Updated)

export interface Comment {
    id: string;
    postId: string; // Link to the parent post
    userId: string;
    userName: string;
    userPhotoUrl?: string | null; // 🟢 FIX: Allow null
    content: string;
    createdAt: string; // ISO string
}

export type PostType = 'text' | 'image' | 'video' | 'link';

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userPhotoUrl?: string | null; // 🟢 FIX: Allow null (resolves TS2322)
    createdAt: string; // ISO string
    
    // Core content
    type: PostType;
    title: string;
    content: string; // Text content/description
    
    // Media fields (optional based on type)
    mediaUrl?: string; 
    videoUrl?: string; 
    
    // Engagement
    likes: number;
    commentsCount: number;
    isLiked: boolean; // For current user
}

// 🛑 REMOVE MOCK DATA (mockPosts and mockComments) from this file
// (Ensure mock data is removed if not already done)