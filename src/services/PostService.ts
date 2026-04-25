// src/services/PostService.ts
import { db } from '../firebase'; 
import { 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    query, 
    orderBy, 
    serverTimestamp, 
    getDoc,
    DocumentSnapshot,
    QueryDocumentSnapshot,
    setDoc, 
    deleteDoc,
    // ✅ FIX: Use the alias getCount as fetchCount
    getCountFromServer as fetchCount, 
} from 'firebase/firestore'; 
import type { Post, PostType } from '../types/PostTypes';

export const POSTS_COLLECTION = 'posts';

type DocInput = DocumentSnapshot | QueryDocumentSnapshot; 

// Helper function to map Firestore document to Post interface
const mapDocToPost = (doc: DocInput): Post => {
    
    if (!doc.exists) {
        throw new Error("Document does not exist for mapping.");
    }
    
    const data = doc.data(); 

    if (!data) {
        console.error("Post mapping failed: data object is null or undefined.", doc);
        throw new Error("Post data is invalid.");
    }

    return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userPhotoUrl: data.userPhotoUrl,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        type: data.type as PostType,
        title: data.title || '',
        content: data.content,
        mediaUrl: data.mediaUrl,
        videoUrl: data.videoUrl,
        likes: data.likes || 0,
        commentsCount: data.commentsCount || 0,
        isLiked: false, 
    } as Post;
};

/**
 * Fetches all posts, ordered by creation time.
 */
export const fetchPosts = async (): Promise<Post[]> => {
    const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(mapDocToPost);
};

/**
 * Creates a new post in the Firestore 'posts' collection.
 */
export const createPost = async (
    postData: { title: string; content: string; type: PostType; mediaUrl?: string },
    userId: string,
    userName: string,
    userPhotoUrl: string | null | undefined 
): Promise<Post> => {
    
    // ✅ FIX: Conditionally include userPhotoUrl only if it's a valid string (from previous step)
    const optionalPhotoData = userPhotoUrl ? { userPhotoUrl } : {};
    
    const newPostRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...postData,
        userId: userId,
        userName: userName,
        // Using spread operator for conditional inclusion
        ...optionalPhotoData, 
        createdAt: serverTimestamp(),
        likes: 0,
        commentsCount: 0,
    });

    const newPostDoc = await getDoc(newPostRef);
    
    if (!newPostDoc.exists()) {
        throw new Error("Failed to retrieve newly created post.");
    }
    
    return mapDocToPost(newPostDoc);
};

/**
 * 🟢 NEW: Deletes a post document.
 * NOTE: This requires Firebase Security Rules to allow cascade deletion of subcollections (likes, comments)
 * OR you must implement server-side cleanup (Cloud Functions). This client-side code only deletes the main document.
 */
export const deletePost = async (postId: string) => {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
};


/**
 * Toggles the like status of a post using the dedicated 'likes' sub-collection (SECURE).
 */
export const toggleLikePost = async (postId: string, userId: string, isCurrentlyLiked: boolean) => {
    
    const likeRef = doc(db, POSTS_COLLECTION, postId, 'likes', userId);
    
    if (isCurrentlyLiked) {
        await deleteDoc(likeRef);
    } else {
        await setDoc(likeRef, {
            userId: userId, 
            createdAt: serverTimestamp(),
        });
    }
    
    return { success: true };
};

/**
 * Securely checks if the current user has liked the post.
 */
export const checkIsLiked = async (postId: string, userId: string): Promise<boolean> => {
    const likeRef = doc(db, POSTS_COLLECTION, postId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
};

/**
 * Securely gets the live like count by querying the sub-collection.
 */
export const getLiveLikeCount = async (postId: string): Promise<number> => {
    const likesRef = collection(db, POSTS_COLLECTION, postId, 'likes');
    // ✅ FIX: Use the aliased function name
    const snapshot = await fetchCount(likesRef); 
    return snapshot.data().count;
};