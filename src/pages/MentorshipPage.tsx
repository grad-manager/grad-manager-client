// src/pages/MentorshipPage.tsx

import React, { useState } from 'react';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMentorRequests } from '../hooks/useMentorRequests'; // Assuming this hook is now available in your file system
import { toast } from 'react-toastify';
import TrialBanner from '../components/TrialBanner';

// Components for the page views
import MentorSelection from '../components/MentorSelection'; // Renamed from Modal for the new page view
import MentorshipStatusList from '../components/MentorshipStatusList'; // New component to show requests/connections

// Define the views for the page
type MentorshipView = 'main' | 'select_mentor';

const MentorshipPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<MentorshipView>('main');
    const { token, userProfile } = useAuth();

    // Use the hook to manage state and actions
    const { 
        mentorRequests, 
        loadingMentorRequests, 
        handleSendMentorRequest, 
        fetchMentorRequests 
    } = useMentorRequests(token);

    // Filter for active requests (pending or accepted)
    const hasActiveRequest = mentorRequests.some(
        (req) => req.status === 'pending' || req.status === 'accepted'
    );
    
    // Handler passed to MentorSelection component
    const handleRequestSent = async (mentorId: string) => {
        try {
            await handleSendMentorRequest(mentorId);
            toast.success('Mentorship request sent successfully!');
            setCurrentView('main'); // Go back to the main status view
        } catch (error) {
            toast.error('Failed to send mentorship request.');
            console.error(error);
        }
    };

    const handleBack = () => setCurrentView('main');

    // --- Title Logic ---
    const pageTitle = {
        'main': 'My Mentorship Status',
        'select_mentor': 'Select a New Mentor',
    }[currentView];

    const renderContent = () => {
        if (loadingMentorRequests) {
            return (
                <div className="text-center p-10 bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
                    <p className="mt-4 text-gray-600 font-semibold">Loading mentorship status...</p>
                </div>
            );
        }

        if (currentView === 'select_mentor') {
            return (
                <MentorSelection
                    onClose={handleBack}
                    onSendRequest={handleRequestSent}
                />
            );
        }

        // Default view: 'main'
        return (
            <MentorshipStatusList
                requests={mentorRequests}
                hasActiveRequest={hasActiveRequest}
                onFindMentor={() => setCurrentView('select_mentor')}
                refetchRequests={fetchMentorRequests}
            />
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 mt-24 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <TrialBanner userProfile={userProfile} />
                
                {/* Header */}
                <header className="mb-8 border-b pb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        {currentView !== 'main' && (
                            <button 
                                onClick={handleBack}
                                className="text-gray-600 hover:text-blue-600 transition mr-4 p-2 rounded-full hover:bg-gray-100"
                                aria-label="Back to status"
                            >
                                <FaArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <h1 className="text-4xl font-extrabold text-gray-900">{pageTitle}</h1>
                    </div>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold transition"> 
                        Go to Dashboard
                    </Link>
                </header>

                {/* Content Area */}
                <div className="py-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default MentorshipPage;
