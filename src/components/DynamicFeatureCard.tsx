import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface DynamicFeature {
  title: string;
  blurb: string;
  tag: string;
  icon: ReactNode;
}

interface DynamicFeatureCardProps {
  dataArray: DynamicFeature[];
  cardTitle: string;
  backgroundColorClass: string;
  tagClass: string;
  cardIcon: ReactNode;
  linkTo: string;
}

// ✅ DynamicFeatureCard with Hover / Touch Pause Support
export const DynamicFeatureCard: React.FC<DynamicFeatureCardProps> = ({
  dataArray,
  cardTitle,
  backgroundColorClass,
  tagClass,
  cardIcon,
  linkTo,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const data = dataArray[currentIndex];

  // Rotate data every 10 seconds (only when not paused)
  const rotateData = useCallback(() => {
    if (!isPaused) {
      setCardKey((prevKey) => prevKey + 1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dataArray.length);
    }
  }, [dataArray.length, isPaused]);

  useEffect(() => {
    const timer = setInterval(rotateData, 3000);
    return () => clearInterval(timer);
  }, [rotateData]);

  // Handlers for pausing and resuming
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative group ${backgroundColorClass} backdrop-blur-md rounded-3xl 
                  shadow-xl border border-white/40 overflow-hidden 
                  transition-all duration-500 cursor-pointer p-6 h-full flex flex-col justify-between`}
      // Desktop hover pause
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      // Mobile touch pause
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
      onTouchCancel={handleResume}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-gray-800">{cardTitle}</span>
        {cardIcon}
      </div>

      {/* Animated Content */}
      <motion.div
        key={cardKey}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col flex-grow"
      >
        <div className="p-4 rounded-xl bg-white/70">
          <div className="flex items-center mb-2">
            {data.icon}
            <h4 className="ml-3 text-xl font-bold text-gray-800 transition">
              {data.title}
            </h4>
          </div>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {data.blurb}
          </p>
        </div>
      </motion.div>

      {/* Tag + CTA */}
      <div className="mt-4 pt-4 border-t border-white/50 flex items-center justify-between">
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${tagClass}`}
        >
          {data.tag}
        </span>
        <Link
          to={linkTo}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          Explore →
        </Link>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {dataArray.map((_, index) => (
          <span
            key={index}
            className={`block w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-400/50'
            }`}
          ></span>
        ))}
      </div>
    </motion.div>
  );
};
