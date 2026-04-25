import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { UserProfile } from '../types/UserProfile';

// Hooks
import { useApplications } from '../hooks/useApplications';
import { useModal } from '../context/ModalContext';

// Components
import ApplicationStats from './Dashboard/ApplicationStats';
import { Link } from 'react-router-dom';
import TrialBanner from './TrialBanner';


const Dashboard: React.FC = () => {
    const { currentUser, userProfile, token } = useAuth();
    const typedUserProfile = userProfile as UserProfile | null;

    const statusColumns = ['Interested', 'Submitted', 'Accepted', 'Rejected'];

    const {
        applications,
        loading,
        applicationsByStatus,
        onDragEnd, // Retain for passing to the ApplicationStats/trackerModal
        // 🚨 CRITICAL FIX: Destructure the function that refreshes the data
        fetchApplications, 
    } = useApplications(currentUser, token); // Ensure onDragEnd is correctly returned by your hook

    // Only need useModal for the header buttons (Track Applications)
    const { openModal } = useModal(); 

    const displayName =
        typedUserProfile?.firstName || currentUser?.email?.split('@')[0] || 'User';

    // --- Handlers ---
    const handleCalendarSync = () => {
        if (!currentUser) return;
        const icalUrl = `${import.meta.env.VITE_API_URL}/applications/${currentUser.uid}/calendar`;
        alert(`Copy this URL to subscribe to your calendar feed:\n\n${icalUrl}`);
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
                <p className="text-lg text-gray-700">
                    Please log in to view your dashboard.
                </p>
            </div>
        );
    }
    
    // Simplified button classes for a cleaner look
    const buttonClass =
        'bg-white text-indigo-600 font-semibold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 hover:text-indigo-700 transform hover:scale-105 transition-all';
    
    const secondaryButtonClass =
        'bg-indigo-700 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:bg-indigo-800 transform hover:scale-105 transition-all';


    return (
        <div className="min-h-screen bg-dashboard-gradient font-sans text-white animate-fade-in-up">
            <main className="container mx-auto px-4 sm:px-6 py-10 pt-32">
                <TrialBanner userProfile={typedUserProfile} />
                
                {/* ---- SIMPLIFIED HERO/HEADER ---- */}
                <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-2xl shadow-lg p-8 sm:p-12 mb-10 text-white text-center animate-fade-in">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                        👋 Welcome back, {displayName}!
                    </h1>
                    <p className="text-base sm:text-lg opacity-90 mb-6">
                        Your focused application tracker is ready.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {/* Tracker Button (Opens Modal) */}
                        <button
                            onClick={() => openModal("trackerModal", { 
                                applications: applications, 
                                onApplicationStatusChange: onDragEnd,
                                // 🚨 CRITICAL FIX: Pass the refresh function
                                onRefreshApplications: fetchApplications 
                            })}
                            className={buttonClass}
                        >
                            📊 View Full Tracker
                        </button>

                        {/* Sync Deadlines Button */}
                        <button
                            onClick={handleCalendarSync}
                            className={secondaryButtonClass}
                        >
                            📅 Sync Deadlines
                        </button>
                        
                        {/* Link to Community */}
                        <Link
                            to="/"
                            className={`${secondaryButtonClass} bg-purple-600 hover:bg-purple-700 flex items-center justify-center`}
                        >
                            🤝 Back to Dashboard
                        </Link>
                    </div>
                </section>

                {/* ---- APPLICATION STATS (The only retained card) ---- */}
                <ApplicationStats
                    applications={applications}
                    applicationsByStatus={applicationsByStatus}
                    statusColumns={statusColumns}
                    loading={loading}
                    // Pass handler to open the full tracker modal
                    onOpenTracker={() => openModal("trackerModal", { 
                        applications: applications, 
                        onApplicationStatusChange: onDragEnd,
                        // 🚨 CRITICAL FIX: Pass the refresh function
                        onRefreshApplications: fetchApplications
                    })}
                />
                
                {/* All other cards (SOP, Interview Prep, Financial, Projects, Blog, Mentor) have been removed. */}

            </main>

            {/* The ToastContainer remains for displaying messages */}
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default Dashboard;
