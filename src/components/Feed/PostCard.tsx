import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Post } from '../../types/PostTypes';
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Trash2,
  X
} from 'lucide-react';
import Tippy from '@tippyjs/react';

/** PostCard Props (unchanged) */
interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  onLike: (postId: string) => void;
  onCommentClick: (postId: string) => void;
  onDelete: (postId: string) => void;
}

/** Utility function to format the time since post creation (unchanged) */
const formatTimestamp = (isoString: string): string => {
  const now = new Date();
  const date = new Date(isoString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onCommentClick,
  onDelete
}) => {
  const {
    id,
    userName,
    userPhotoUrl,
    createdAt,
    title,
    content,
    type,
    mediaUrl,
    likes,
    commentsCount,
    isLiked,
    userId
  } = post;

  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'image' | 'video' | null>(null);
  const isCreator = currentUserId === userId;

  /** Confirm before deleting a post (unchanged) */
  const handlePostDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDelete(id);
    }
  };

  /** Close modal with ESC key (unchanged) */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMedia(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /** Render media (image or video) - *Modified some styling* */
  const renderMedia = () => {
    if (!mediaUrl) return null;

    const handleClick = () => {
      setSelectedMedia(mediaUrl);
      setSelectedType(type === 'video' ? 'video' : 'image');
    };

    if (type === 'image') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          // Simplified border/shadow for a flatter LinkedIn look
          className="mt-4 overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700" 
          onClick={handleClick}
        >
          <img
            src={mediaUrl}
            alt={title}
            className="w-full max-h-[600px] object-cover hover:opacity-95 transition"
            loading="lazy"
          />
        </motion.div>
      );
    }

    if (type === 'video') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          // Simplified border/shadow for a flatter LinkedIn look
          className="mt-4 relative overflow-hidden rounded-lg bg-gray-900 aspect-video cursor-pointer border border-gray-200 dark:border-gray-700"
          onClick={handleClick}
        >
          <video
            src={mediaUrl}
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition">
            <p className="text-white text-lg font-semibold">▶ Click to View</p>
          </div>
        </motion.div>
      );
    }

    return null;
  };


  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1 }} // Remove hover scale for a flatter UI
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        // Match the flat, white background and rounded corners of the image
        className="w-full bg-white dark:bg-gray-800
                   p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
                   transition-all duration-300 mx-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              // Smaller photo size (closer to 48px/w-12)
              src={userPhotoUrl || `https://ui-avatars.com/api/?name=${userName}`}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            />
            <div className="flex flex-col">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                {userName}
              </p>
              {/* Added a description line for context, and kept the timestamp small/grey */}
              <p className="text-xs text-gray-500">{formatTimestamp(createdAt)}</p>
            </div>
          </div>

          {/* Right-side actions */}
          <div className="flex gap-1"> {/* Group actions slightly closer */}
            {isCreator && (
              <Tippy content="Delete Post" placement="top">
                <button
                  onClick={handlePostDelete}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                  aria-label="Delete Post"
                >
                  <Trash2 size={20} />
                </button>
              </Tippy>
            )}
            <button
              className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="More Options"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        {/* Adjusted spacing to match the look of the list in the image */}
        <div className="mt-3"> 
          {title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center mb-1">
              {/* Removed renderTypeIcon here as the original doesn't have a title icon */}
              {title}
            </h3>
          )}
          {/* Adjusted font-size to be more standard/smaller, and spacing to be tighter */}
          <p className="text-gray-800 dark:text-gray-200 leading-normal whitespace-pre-wrap text-sm sm:text-base">
            {content}
          </p>
          {renderMedia()}
        </div>

        {/* Post Actions */}
        {/* Modified to match the simple, flat action bar at the bottom */}
        <div className="flex items-center gap-4 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onLike(id)}
            // Simplified button look for a flat/minimal UI
            className={`flex items-center gap-1.5 p-1 rounded-sm font-medium text-sm transition-colors
                        ${isLiked
                          ? 'text-blue-600 dark:text-blue-400' // Use blue for 'liked' to match general UI
                          : 'text-gray-500 hover:text-blue-500'}`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>Like ({likes})</span> {/* Added text label for 'Like' */}
          </button>

          <button
            onClick={() => onCommentClick(id)}
            // Simplified button look for a flat/minimal UI
            className="flex items-center gap-1.5 p-1 text-gray-500 dark:text-gray-300 rounded-sm font-medium text-sm
                        hover:text-blue-600 transition-colors"
          >
            <MessageCircle size={18} />
            <span>Comment ({commentsCount})</span> {/* Added text label for 'Comment' */}
          </button>
        </div>
      </motion.div>

      {/* Fullscreen Media Viewer (unchanged) */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition"
          >
            <X size={32} />
          </button>

          {selectedType === 'video' ? (
            <video
              src={selectedMedia}
              controls
              autoPlay
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={selectedMedia}
              alt="Full view"
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PostCard;