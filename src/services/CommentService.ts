// src/services/CommentService.ts
import { db } from '../firebase';
import {
    collection,
    query,
    orderBy,
    getDocs,
    addDoc,
    serverTimestamp,
    type DocumentData,
    getCountFromServer as fetchCount,
} from 'firebase/firestore';
import type { Comment } from '../types/PostTypes';
import { POSTS_COLLECTION } from './PostService';


/**
 * Safely maps Firestore document data to a Comment object.
 */
const mapDocToComment = (doc: { id: string; data: () => DocumentData }): Comment | null => {
    const data = doc.data?.();

    if (!data || !data.content || !data.userId || !data.userName) {
        console.warn(
            `⚠️ Skipping invalid comment document (missing required fields) — ID: ${doc.id}`
        );
        return null;
    }

    return {
        id: doc.id,
        postId: data.postId ?? '',
        userId: data.userId,
        userName: data.userName,
        userPhotoUrl: data.userPhotoUrl ?? null,
        content: data.content,
        createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
    };
};

/**
 * Fetches all valid comments for a specific post.
 */
export const fetchCommentsByPostId = async (postId: string): Promise<Comment[]> => {
    try {
        const q = query(
            collection(db, POSTS_COLLECTION, postId, 'comments'),
            orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);

        const comments = snapshot.docs
            .map(doc => mapDocToComment({ id: doc.id, data: () => doc.data() })) // ✅ FIXED HERE
            .filter((comment): comment is Comment => comment !== null);

        return comments;
    } catch (error) {
        console.error(`🔥 Failed to fetch comments for post ${postId}:`, error);
        throw new Error('Failed to fetch comments.');
    }
};

/**
 * Creates a new comment in Firestore.
 */
export const createComment = async (
    postId: string,
    content: string,
    userId: string,
    userName: string,
    userPhotoUrl: string | null | undefined
): Promise<Comment> => {
    const newCommentData = {
        postId,
        userId,
        userName,
        userPhotoUrl: userPhotoUrl || null,
        content,
        createdAt: serverTimestamp(),
    };

    const newCommentRef = await addDoc(
        collection(db, POSTS_COLLECTION, postId, 'comments'),
        newCommentData
    );

    return {
        id: newCommentRef.id,
        postId,
        userId,
        userName,
        userPhotoUrl: userPhotoUrl || null,
        content,
        createdAt: new Date().toISOString(),
    };
};

/**
 * Retrieves the total number of comments for a post (lightweight count).
 */
export const getLiveCommentCount = async (postId: string): Promise<number> => {
    const commentsRef = collection(db, POSTS_COLLECTION, postId, 'comments');
    const snapshot = await fetchCount(commentsRef);
    return snapshot.data().count || 0;
};
