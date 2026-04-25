/* eslint-disable no-irregular-whitespace */
// src/hooks/usePosts.ts
import { useState, useEffect, useCallback } from 'react';
import { type Post, type PostType } from '../types/PostTypes';
import * as postService from '../services/PostService'; 
import * as commentService from '../services/CommentService'; 
import * as cloudinaryService from '../services/CloudinaryService'; 
import { notifyNewPostBroadcast } from '../services/NotificationService'; // Correct import (assuming named export)

interface PostHookResult {
    posts: Post[];
    isLoading: boolean;
    error: string | null;
    isUploading: boolean; 
    fetchPosts: () => void;
    handleLike: (postId: string) => Promise<void>; 
    handleNewPost: (
        postData: { title: string; content: string; type: PostType; mediaUrl?: string },
        file?: File 
    ) => Promise<void>;
}

export const usePosts = (
    currentUserId: string | null, 
    currentUserName: string,
    currentUserPhotoUrl: string | null | undefined, 
    // 👇 REQUIRED ARGUMENT
    currentUserToken: string | null
): PostHookResult => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false); 

    // 1. Function to fetch posts and their live counts
    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const fetchedPosts = await postService.fetchPosts();
            
            // 🟢 INTEGRATE LIVE COUNTING AND IS_LIKED CHECK
            const postsWithLiveData = await Promise.all(
                fetchedPosts.map(async (post) => {
                    const [likeCount, commentCount, isLiked] = await Promise.all([
                        postService.getLiveLikeCount(post.id),
                        commentService.getLiveCommentCount(post.id),
                        // currentUserId is now guaranteed to be string or null
                        currentUserId ? postService.checkIsLiked(post.id, currentUserId) : false,
                    ]);

                    return {
                        ...post,
                        likes: likeCount,
                        commentsCount: commentCount,
                        isLiked: isLiked,
                    };
                })
            );
            
            setPosts(postsWithLiveData); 
            
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError(err instanceof Error ? err.message : "Failed to load community feed from Firestore.");
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]); 

    // 2. Function to handle liking/unliking
    const handleLike = useCallback(async (postId: string) => {
        const postToUpdate = posts.find(p => p.id === postId);
        if (!postToUpdate || !currentUserId) return; // currentUserId check handles null

        // Optimistic Update (Based on the live count, not the static post field)
        const newIsLiked = !postToUpdate.isLiked;
        const newLikes = postToUpdate.likes + (newIsLiked ? 1 : -1);

        setPosts(prevPosts => 
            prevPosts.map(p => p.id === postId ? { ...p, isLiked: newIsLiked, likes: newLikes } : p)
        );

        try {
            await postService.toggleLikePost(postId, currentUserId, postToUpdate.isLiked);
            
        } catch (err) {
            // Rollback only on network/permission error
            console.error("Failed to like post, rolling back:", err);
            
            // Rollback the optimistic state change
            setPosts(prevPosts => 
                prevPosts.map(p => p.id === postId ? { 
                    ...p, 
                    isLiked: !newIsLiked, 
                    likes: postToUpdate.likes 
                } : p)
            );
            setError("Could not update like status in database.");
        }
    }, [posts, currentUserId]);

    // 3. Function to handle adding a new post
    const handleNewPost = useCallback(async (
        postData: { title: string; content: string; type: PostType; mediaUrl?: string },
        file?: File 
    ) => {
        // 👇 Check for currentUserToken here
        if (!currentUserId || !currentUserName || !currentUserToken) { 
            setError("Cannot post: User not fully authenticated or token is missing.");
            return;
        }

        let finalPostData = { ...postData };
        let mediaUrl: string | undefined;

        // 1. Handle File Upload (Cloudinary)
        if (file) {
            setIsUploading(true); 
            try {
                const resourceType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video';
                
                mediaUrl = await cloudinaryService.uploadMedia(file, resourceType);
                
                finalPostData = { 
                    ...finalPostData, 
                    mediaUrl, 
                    type: resourceType === 'image' ? 'image' : 'video'
                };
            } catch (err) {
                console.error("Failed to upload media:", err);
                setError("Media upload failed. Post cancelled.");
                setIsUploading(false); 
                return; 
            } finally {
                setIsUploading(false); 
            }
        }

        // 2. Optimistic Placeholder
        const optimisticPost: Post = {
            id: `temp-${Date.now()}`, 
            userId: currentUserId,
            userName: currentUserName, // currentUserName is now guaranteed string
            userPhotoUrl: currentUserPhotoUrl, 
            ...finalPostData, 
            isLiked: false, 
            likes: 0, 
            commentsCount: 0,
            createdAt: new Date().toISOString(), 
        };

        setPosts(prevPosts => [optimisticPost, ...prevPosts]);
        
        // 3. Create post in Firestore
        try {
            const createdPost = await postService.createPost(
                finalPostData, 
                currentUserId, 
                currentUserName,
                currentUserPhotoUrl
            );
            
            setPosts(prevPosts => 
                prevPosts.map(p => p.id === optimisticPost.id ? createdPost : p)
            );

            // 4. Send Broadcast Notification 📢
            const postContentPreview = finalPostData.title || finalPostData.content;
            await notifyNewPostBroadcast(currentUserName, postContentPreview, currentUserToken);
            
        } catch (err) {
            // Rollback 
            console.error("Failed to create post, removing optimistic entry:", err);
            setPosts(prevPosts => prevPosts.filter(p => p.id !== optimisticPost.id));
            setError("Failed to create post in database.");
        }
    // 👇 FIX: Add currentUserToken to the dependency array
    }, [currentUserId, currentUserName, currentUserPhotoUrl, currentUserToken]); 

    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        isLoading,
        error,
        isUploading, 
        fetchPosts,
        handleLike,
        handleNewPost,
    };
};