/* eslint-disable no-irregular-whitespace */
// src/components/Feed/CommentModal.tsx
import React, { useState } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../context/AuthContext';
import type { Post } from '../../types/PostTypes';

interface CommentModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
    onCommentAdded: () => void; // To refresh the main feed post count
}

const CommentModal: React.FC<CommentModalProps> = ({ post, isOpen, onClose, onCommentAdded }) => {
    const [newCommentContent, setNewCommentContent] = useState('');
    
    // 🚨 FIX: Destructure userProfile along with currentUser
    const { currentUser, userProfile } = useAuth();
    
    const currentUserId = currentUser?.uid;
    
    // 🚀 FIX: Prioritize name from userProfile (Firestore)
    const currentUserName = userProfile 
        ? `${userProfile.firstName} ${userProfile.lastName}` 
        : currentUser?.displayName || 'Anonymous';
    
    // 🟢 NEW: Get the Photo URL
    const currentUserPhotoUrl = userProfile?.photoURL || currentUser?.photoURL;

    // 🟢 Use the dedicated comments hook
    const { 
        comments, 
        isLoading, 
        error, 
        addComment 
    // ✅ FIX 1: Pass the currentUserPhotoUrl as the 4th argument
    } = useComments(post.id, currentUserId, currentUserName, currentUserPhotoUrl);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCommentContent.trim() === '' || !currentUserId) return; // Prevent posting if not logged in
        
        await addComment(newCommentContent);
        setNewCommentContent('');
        onCommentAdded(); // Notify parent (CommunityFeed) to refresh the post list/count
    };

    if (!isOpen) return null;

    return (
        // Modal Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300">
            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 h-5/6 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <MessageCircle size={20} className="mr-2 text-blue-500" />
                        Comments ({post.commentsCount})
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Post Snippet */}
                <div className="p-4 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.content}</p>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500 flex justify-center items-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading comments...
                        </div>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Be the first to comment!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex space-x-3 text-sm">
                                <img 
                                    src={comment.userPhotoUrl || "https://ui-avatars.com/api/?name=" + comment.userName} 
                                    alt={comment.userName} 
                                    className="w-8 h-8 rounded-full object-cover" 
                                />
                                <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-800">{comment.userName}</p>
                                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                    <span className="text-xs text-gray-500 block mt-1">
                                        {new Date(comment.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="p-4 border-t bg-gray-50">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            placeholder="Write a comment..."
                            disabled={isLoading || !currentUserId}
                            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || newCommentContent.trim() === '' || !currentUserId}
                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;