/* eslint-disable no-irregular-whitespace */
// src/components/VideoGuidePopup.tsx
import React from "react";
import { FaTimes, FaPlayCircle } from "react-icons/fa";
import { motion, type Variants } from "framer-motion"; // <-- FIX 1: Ensure Variants is imported

interface VideoGuidePopupProps {
  onClose: () => void;
}

// FIX 2: Explicitly type the variants using Variants
const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { 
    y: "-100vh", 
    opacity: 0, 
    scale: 0.8 
  },
  visible: {
    y: "0",
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring", // TypeScript now correctly verifies this literal string
      stiffness: 80,
      damping: 15,
    },
  },
  exit: {
    y: "100vh", 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const VideoGuidePopup: React.FC<VideoGuidePopupProps> = ({ onClose }) => {
  return (
    // FIX 3: Removed the inner AnimatePresence, animating the motion.div directly
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-[101] backdrop-blur-sm p-4"
      onClick={onClose} // Allows closing by clicking outside
      variants={backdropVariants} // <-- Animation setup
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
        variants={modalVariants} // <-- Animation setup
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition p-2 z-10 bg-white/50 rounded-full backdrop-blur-sm"
          aria-label="Close video guide"
        >
          <FaTimes size={24} />
        </button>

        {/* Intriguing Header Section */}
        <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <FaPlayCircle className="text-yellow-300" size={32} />
            <h2 className="text-3xl font-extrabold tracking-tight">
              Hey There!
            </h2>
          </div>
          <p className="text-blue-100 text-sm italic">
            Welcome to Grad Manager.
          </p>
          <p className="text-blue-100 text-sm italic">
            I am your tour video for how to navigate the site. Please enjoy.
          </p>
        </div>
          
          {/* Main Content Area */}
          <div className="p-6 md:p-8">

            {/* Updated Video Player */}
            <div className="relative aspect-video">
              <video
                src="https://res.cloudinary.com/ds7uxn9qt/video/upload/v1761188094/IMG_4060_cvy1ho.mp4"
                title="GradManager Demo"
                controls
                autoPlay
                loop
                className="w-full rounded-xl shadow-xl border-4 border-gray-100" 
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition duration-300 shadow-lg transform hover:scale-[1.01] focus:ring-4 focus:ring-blue-300"
              >
                Skip
              </button>
            </div>
          </div>
        </motion.div>
    </motion.div>
  );
};

export default VideoGuidePopup;