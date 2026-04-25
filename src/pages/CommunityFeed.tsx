/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import PostCard from '../components/Feed/PostCard';
import CreatePost from '../components/Feed/CreatePost';
import CommentModal from '../components/Feed/CommentModal';
import type { Post, PostType } from '../types/PostTypes';
import { Users, Filter, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { deletePost } from '../services/PostService';

const CommunityFeed: React.FC = () => {
    // 👇 FIX: Destructure 'token' instead of trying to access it on currentUser
  const { currentUser, userProfile, token } = useAuth(); 
  
  const currentUserId = currentUser?.uid ?? null;
  const currentUserName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : currentUser?.displayName || 'Current User';
  const currentUserPhotoUrl = userProfile?.photoURL || currentUser?.photoURL;

  // 👇 Use the token directly from context
  const currentUserToken = token; 

  const { posts, isLoading, error, fetchPosts, handleLike } = usePosts(
    currentUserId,
    currentUserName,
    currentUserPhotoUrl,
    currentUserToken // This is now correctly string | null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'image' | 'video'>('all');

  const handleCommentClick = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleCommentAdded = () => fetchPosts();

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!currentUserId) {
      console.warn("User must be logged in to delete posts.");
      return;
    }

    try {
      await deletePost(postId);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  }, [currentUserId, fetchPosts]);

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true;
    return post.type === activeFilter;
  });

  const FilterButton: React.FC<{ filter: 'all' | PostType; label: string }> = ({
    filter,
    label,
  }) => {
    const isActive = activeFilter === filter;
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setActiveFilter(filter as any)}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 
          ${
            isActive
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
          }`}
      >
        {label}
      </motion.button>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48 bg-white/70 backdrop-blur rounded-2xl shadow-inner mt-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <p className="text-lg text-gray-700 font-medium">Loading the latest posts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-10 bg-red-50 rounded-xl border border-red-300 mt-6">
          <p className="text-lg font-medium text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="flex items-center mx-auto px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    if (filteredPosts.length === 0) {
      return (
        <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl border border-dashed border-gray-300 mt-6 shadow-sm">
          <p className="text-lg font-semibold text-gray-700">
            {activeFilter === 'all'
              ? 'No posts yet in the community.'
              : `No ${activeFilter} posts found.`}
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-3 text-blue-600 font-medium hover:underline"
            >
              View All Posts
            </button>
          )}
        </div>
      );
    }

    return (
      <motion.div
        layout
        className="grid grid-cols-1 gap-8 mt-8 w-full"
      >
        <AnimatePresence>
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full"
            >
              <PostCard
                post={post}
                onLike={handleLike}
                onCommentClick={handleCommentClick}
                currentUserId={currentUserId}
                onDelete={handleDeletePost}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-2 sm:px-8 transition-colors duration-500">
      <div className="mx-auto w-full max-w-[1600px] px-2 sm:px-6">
        {/* Top Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 shadow-sm rounded-2xl px-6 py-4 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center space-x-3">
            <Users className="text-blue-600 w-7 h-7" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Community Feed
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Connect, share, and grow with others on your academic journey.
          </p>
        </motion.header>

        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto w-full"
        >
          <CreatePost />
        </motion.div>

        {/* Filter Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-8 bg-white/80 dark:bg-gray-800/70 backdrop-blur-lg shadow-md rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center flex-wrap gap-3">
            <Filter className="text-blue-600 w-5 h-5" />
            <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Filter by:
            </span>
            <FilterButton filter="all" label="All" />
            <FilterButton filter="text" label="Write-ups" />
            <FilterButton filter="image" label="Images" />
            <FilterButton filter="video" label="Videos" />
          </div>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 dark:hover:text-blue-400 transition"
          >
            <RefreshCw size={16} className="animate-spin-slow" />
            Refresh Feed
          </button>
        </div>

        {/* Posts */}
        <main className="w-full">{renderContent()}</main>

        {/* Comment Modal */}
        {selectedPost && (
          <CommentModal
            post={selectedPost}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;