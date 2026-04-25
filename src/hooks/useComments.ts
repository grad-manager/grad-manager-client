// src/hooks/useComments.ts
import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '../types/PostTypes';
import * as commentService from '../services/CommentService';

interface CommentHookResult {
    comments: Comment[];
    isLoading: boolean;
    error: string | null;
    fetchComments: () => void;
    addComment: (content: string) => Promise<void>;
}

export const useComments = (
    postId: string | null,
    currentUserId: string | undefined,
    currentUserName: string | undefined,
    // 🟢 Accept the user's photo URL
    currentUserPhotoUrl: string | null | undefined
): CommentHookResult => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🟢 Fetch comments safely
    const fetchComments = useCallback(async () => {
        if (!postId) {
            setComments([]);
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const fetchedComments = await commentService.fetchCommentsByPostId(postId);

            // ✅ Skip any invalid/null data
            const validComments = fetchedComments.filter(
                (c: Comment) => c && c.content && c.userId
            );

            setComments(validComments);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
            setError("Could not load comments.");
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    // 🟢 Add new comment
    const addComment = useCallback(
        async (content: string) => {
            if (!postId || !currentUserId || !currentUserName || content.trim() === '') {
                return;
            }

            // 1. Optimistic UI update
            const optimisticComment: Comment = {
                id: `temp-comment-${Date.now()}`,
                postId,
                userId: currentUserId,
                userName: currentUserName,
                userPhotoUrl: currentUserPhotoUrl ?? null,
                content,
                createdAt: new Date().toISOString(),
            };

            setComments(prev => [...prev, optimisticComment]);

            try {
                // 2. Send to backend
                const newComment = await commentService.createComment(
                    postId,
                    content,
                    currentUserId,
                    currentUserName,
                    currentUserPhotoUrl
                );

                // 3. Replace optimistic comment with real one
                setComments(prev =>
                    prev.map(c => (c.id === optimisticComment.id ? newComment : c))
                );
            } catch (err) {
                console.error("Failed to post comment, rolling back:", err);
                setComments(prev =>
                    prev.filter(c => c.id !== optimisticComment.id)
                );
                setError("Failed to post comment.");
            }
        },
        [postId, currentUserId, currentUserName, currentUserPhotoUrl]
    );

    // 🟢 Load comments when post changes
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return { comments, isLoading, error, fetchComments, addComment };
};
