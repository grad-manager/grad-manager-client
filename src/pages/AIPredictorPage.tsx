// src/pages/AIPredictorPage.tsx

import React from 'react';
import AIPredictorForm from '../components/AIPredictorForm';
import { motion } from 'framer-motion';
import type { Application } from '../types/Application';
import { FaArrowLeft, FaBrain } from 'react-icons/fa'; // Added FaBrain for AI icon
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useAuth } from '../context/AuthContext';
import TrialBanner from '../components/TrialBanner';

interface Props {
    applications: Application[];
}

const AIPredictorPage: React.FC<Props> = ({ applications }) => {
    const { userProfile } = useAuth();
    return (
        <div
            className="relative min-h-screen w-full flex flex-col items-center justify-start mt-8 px-4 sm:px-6 lg:px-8 py-12"
            style={{
                backgroundImage: `url("https://pics.craiyon.com/2023-06-03/eb4023cd180f4a3999e879130f778955.webp")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            {/* Overlay to make text and form stand out */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* Content Container (Header + Form) */}
            <div className="relative w-full mt-4 max-w-6xl pt-8 pb-12">
                <TrialBanner userProfile={userProfile} />
                
                {/* --- BEAUTIFUL HEADER --- */}
                <header className="mb-8 p-6 bg-indigo-900/90 backdrop-blur-md rounded-2xl shadow-3xl text-white border-b border-indigo-500/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        {/* Title and Subtitle */}
                        <div className="flex items-center mb-4 md:mb-0">
                            <FaBrain className="text-3xl sm:text-4xl mr-4 text-pink-300 animate-pulse" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl text-gray-300 font-extrabold tracking-tight">
                                    Admissions Prediction Engine
                                </h1>
                                <p className="text-sm text-indigo-200 mt-1">
                                    Leverage historical data to estimate your chances of acceptance.
                                </p>
                            </div>
                        </div>

                        {/* Back to Dashboard Button */}
                        <Link 
                            to="/" 
                            className="px-5 py-2 text-indigo-900 hover:text-indigo-950 bg-pink-300 font-bold rounded-xl flex items-center space-x-2 transition-all duration-300 hover:bg-pink-400 hover:shadow-lg shadow-md transform hover:scale-[1.02]"
                        > 
                            <FaArrowLeft className="text-sm" />
                            <span>Dashboard</span>
                        </Link>
                    </div>
                </header>
                {/* --- END HEADER --- */}

                {/* Animated Form Container */}
                <motion.div
                    className="relative w-full max-w-6xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} // Added slight delay after header appears
                >
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10">
                        <AIPredictorForm applications={applications} />
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default AIPredictorPage;
