// src/components/FeedbackModal.tsx

import React, { useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: string, email: string) => void; // updated to include email
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(feedback, email); // pass both feedback and email
        setFeedback('');
        setEmail('');
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close feedback form"
                >
                    <FaTimes className="text-xl" />
                </button>

                {/* Title & Subtitle */}
                <h2 className="text-2xl font-bold text-blue-700 mb-2">How has been your experience so far?</h2>
                <p className="text-gray-600 mb-6">
                    We'd love to hear your initial thoughts!
                </p>

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email input */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email (so we can reach you)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />

                    {/* Feedback textarea */}
                    <textarea
                        rows={5}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you like or what we can improve..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required
                    />

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            disabled={!feedback.trim() || !email.trim()}
                        >
                            <FaPaperPlane />
                            <span>Send Feedback</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
