/* eslint-disable no-irregular-whitespace */
import React, { useState, useRef, type ChangeEvent } from "react";
import { Image, Send, Loader2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePosts } from "../../hooks/usePosts";
import type { PostType } from "../../types/PostTypes";

const CreatePost: React.FC = () => {
    // 👇 FIX: Destructure 'token' instead of trying to access it on currentUser
    const { currentUser, userProfile, token } = useAuth(); 

    const currentUserId = currentUser?.uid ?? null;
    const currentUserName = userProfile
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : currentUser?.displayName || "Current User";

    const currentUserPhotoUrl = userProfile?.photoURL || currentUser?.photoURL;

    // 👇 Use the token directly from context
    const currentUserToken = token; 

    const { handleNewPost, isUploading } = usePosts(
        currentUserId,
        currentUserName,
        currentUserPhotoUrl,
        currentUserToken // This is now correctly string | null
    );

    const [postType, setPostType] = useState<PostType>("text");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (!file) return;

        if (file.type.startsWith("image/")) {
            setPostType("image");
        } else if (file.type.startsWith("video/")) {
            setPostType("video");
        } else {
            alert("Unsupported file type. Please select an image or video.");
            return;
        }

        setMediaFile(file);
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setPostType("text");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim() === "" && !mediaFile) {
            alert("Post must have content or attached media.");
            return;
        }

        const postData = {
            title: title.trim(),
            content: content.trim(),
            type: mediaFile ? postType : ("text" as PostType),
        };

        try {
            await handleNewPost(postData, mediaFile || undefined);
            setTitle("");
            setContent("");
            handleRemoveMedia();
        } catch (error) {
            console.error("Post submission failed:", error);
            alert("Failed to submit post. Please try again.");
        }
    };

    const isSubmitting = isUploading;

    const renderMediaPreview = () => {
        if (!mediaFile) return null;
        const mediaUrl = URL.createObjectURL(mediaFile);

        return (
            <div className="relative mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                <button
                    onClick={handleRemoveMedia}
                    className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition transform hover:scale-110 shadow-md"
                >
                    <X size={16} />
                </button>
                {mediaFile.type.startsWith("image/") ? (
                    <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full max-h-64 object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <video
                        src={mediaUrl}
                        controls
                        className="w-full max-h-64 object-cover rounded-b-2xl"
                    />
                )}
                <div className="px-3 py-2 bg-white/70 text-sm font-medium text-gray-700 text-center">
                    {mediaFile.name}
                </div>
            </div>
        );
    };

    return (
        // 🎯 Added max-w-4xl to increase the width, replacing the implicit max-w-2xl that might have been inferred from the previous design
        <div className="w-full max-w-6xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900
                         p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700
                         hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-500
                         transition-all duration-300 mx-auto mb-10"
        >
            {/* Header */}
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center justify-between">
                Share an Update
                <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full shadow-sm">
                    {/* 👇 CHANGE APPLIED HERE: text-xs on mobile, text-sm on sm and up */}
                    Inspire Others 💬 
                </span>
            </h3>

            {/* User info */}
            <div className="flex items-center mb-6">
                <img
                    src={
                        currentUserPhotoUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            currentUserName
                        )}`
                    }
                    alt={currentUserName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-md"
                />
                <div className="ml-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{currentUserName}</p>
                    <p className="text-sm text-gray-500">What’s new today?</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Add a short title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    // Added dark mode support for inputs
                    className="w-full p-3 mb-4 rounded-xl border border-gray-300 bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />

                <textarea
                    placeholder="Share your thoughts, experiences, or questions..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    // Added dark mode support for inputs
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none outline-none transition"
                    required={!mediaFile}
                />

                {renderMediaPreview()}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSubmitting || mediaFile !== null}
                            className={`flex items-center px-4 py-2 rounded-xl font-medium transition ${
                                isSubmitting || mediaFile
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60"
                            }`}
                        >
                            <Image size={18} className="mr-2" />
                            Attach Photo / Video
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || (content.trim() === "" && !mediaFile)}
                        className={`flex items-center justify-center px-6 py-2 rounded-xl font-semibold shadow-md transition-all ${
                            isSubmitting
                                ? "bg-blue-300 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-lg transform hover:scale-[1.02]"
                        }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Send size={18} className="mr-2" />
                                Post
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;