/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */ // Keeping this to address the lint warning for now
// src/pages/DocumentReviewServicePage.tsx (Fixed)

import React, { useState } from 'react';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../hooks/useApplications';
import { useCVRequest } from '../hooks/useCVRequest'; 
import { useSOPRequests } from '../hooks/useSOPRequests'; 

// Components for the new page
import DocumentServiceMain from '../components/DocumentServiceMain';
import SOPRequestForm from '../components/SOPRequestForm'; 
import SOPRequestHistory from '../components/SOPRequestHistory'; 
import AcademicCVRequestForm from '../components/AcademicCVRequestForm'; 
import AcademicCVHistory from '../components/AcademicCVHistory'; 
import { Link } from 'react-router-dom';
// Re-importing the CVRequest type, required for type assertion
import type { CVRequest } from '../types/documents'; 
// Import the required UserSOPStats interface (assumed to be defined globally or in a hook)
import type { UserSOPStats } from '../hooks/useSOPStats'; // Assuming it comes from a hook
import { getEffectivePlanLabel } from '../utils/trial';
import TrialBanner from '../components/TrialBanner';


// Define the different views for the page
type DocumentReviewView = 
  | 'services'
  | 'sop_form'
  | 'sop_history'
  | 'cv_form'
  | 'cv_history';

// 🟢 CRITICAL FIX: The function must return Promise<any> to satisfy SOPRequestForm
type SOPRequestHandler = (applicationId: string | null, notes: string, file?: File) => Promise<any>;


interface DocumentReviewServicePageProps {
    // This prop is needed to handle the navigation when the SOP request limit is hit
    onNavigateToSubscription: () => void;
    // 🟢 FIX: Make userSOPStats optional with '?' to accept UserSOPStats | undefined
    userSOPStats?: UserSOPStats;
}

const DocumentReviewServicePage: React.FC<DocumentReviewServicePageProps> = ({ 
    onNavigateToSubscription,
    userSOPStats
}) => {
    const [currentView, setCurrentView] = useState<DocumentReviewView>('services');
    const { currentUser, token, userProfile } = useAuth();
    
    // Hooks for data
    const { applications, loading: loadingApps } = useApplications(currentUser, token);
    
    // useCVRequest returns the CV object
    const cvHookResult = useCVRequest(currentUser, token);

    // Assert the hook's returned cvRequest to the centralized type
    const cvRequest = cvHookResult.cvRequest as CVRequest | null;
    const { fetchCVRequest, handleCVUpload, handleNewCVRequest } = cvHookResult;

    // Destructure the SOP hook result, including the actual request handler
    const { 
        sopRequests, 
        hasActiveSOPRequest, 
        loading: loadingSOP,
        handleRequestSOPWriting 
    } = useSOPRequests(currentUser, token);

    // 🟢 FIX 2: Assert the handler to the correct ASYNCHRONOUS type
    // This is generally safe if handleRequestSOPWriting is indeed an async function making an API call
    const typedSOPRequestHandler = handleRequestSOPWriting as SOPRequestHandler;

    // Define a safe function to pass to the child component.
    const safeHasActiveRequest = 
        (hasActiveSOPRequest && typeof hasActiveSOPRequest === 'function')
        ? hasActiveSOPRequest
        : (_appId: string) => false; 
        

    const handleBackToServices = () => setCurrentView('services');
    
    // Determine loading state
    const isLoading = loadingApps || loadingSOP; 

    // Helper to render forms while handling loading state
    const renderFormOrHistoryView = () => {
        if (isLoading) {
            return (
                <div className="text-center p-10 bg-white rounded-xl shadow-lg w-full max-w-2xl">
                    <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto" />
                    <p className="mt-4 text-gray-600 font-semibold">Loading service data...</p>
                </div>
            );
        }

        switch (currentView) {
            case 'services':
                return (
                    <DocumentServiceMain
                        onOpenSOPForm={() => setCurrentView('sop_form')}
                        onOpenSOPHistory={() => setCurrentView('sop_history')}
                        onOpenCVForm={() => setCurrentView('cv_form')}
                        onOpenCVHistory={() => setCurrentView('cv_history')}
                    />
                );
            
            case 'sop_form':
                return (
                    <SOPRequestForm
                        applications={applications}
                        // Pass the correct ASYNCHRONOUS handler
                        onRequestSOPWriting={async (appId, notes, file) => {
                            // Await the API call
                            await typedSOPRequestHandler(appId, notes, file); 
                            // After requesting successfully, switch view
                            setCurrentView('sop_history');
                        }}
                        hasActiveRequest={safeHasActiveRequest} 
                        onClose={handleBackToServices}
                        onNavigateToSubscription={onNavigateToSubscription}
                        userSOPStats={userSOPStats}
                        userProfile={userProfile} // Pass userProfile for sopRequestCount
                    />
                );

            case 'sop_history':
                return (
                    <SOPRequestHistory 
                        sopRequests={sopRequests} // Pass data from the hook
                        applications={applications}
                        onClose={handleBackToServices} 
                    />
                );
            
            case 'cv_form':
                return (
                    <AcademicCVRequestForm 
                        onUpload={handleCVUpload}
                        onNewRequest={handleNewCVRequest}
                        onClose={handleBackToServices}
                        // Pass existing request data to show status if applicable
                        cvRequest={cvRequest}
                        // Pass user's subscription plan from Firestore
                        userPlan={getEffectivePlanLabel(userProfile)}
                        // Pass navigation handler to subscription page
                        onNavigateToSubscription={onNavigateToSubscription}
                            userProfile={userProfile}
                    />
                );
            
            case 'cv_history':
                // For CV, the history might be simple since the request status is singular (cvRequest)
                return (
                    <AcademicCVHistory
                        cvRequest={cvRequest} 
                        onClose={handleBackToServices}
                        fetchCVRequest={fetchCVRequest}
                    />
                );

            default:
                return <p className="text-center text-red-500">View not found.</p>;
        }
    };

    // Determine the title
    const pageTitle = {
        'services': 'Document Review Services',
        'sop_form': 'Request SOP Live Writing Session',
        'sop_history': 'SOP Request History',
        'cv_form': 'Request Academic CV Review',
        'cv_history': 'Academic CV History',
    }[currentView] || 'Document Services';

    return (
        <div className="min-h-screen bg-gray-50 mt-24 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <TrialBanner userProfile={userProfile} />
                
                {/* Header/Navigation */}
                <header className="mb-8 border-b pb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        {currentView !== 'services' && (
                            <button 
                                onClick={handleBackToServices}
                                className="text-gray-600 hover:text-indigo-600 transition mr-4 p-2 rounded-full hover:bg-gray-100"
                                aria-label="Back to services"
                            >
                                <FaArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <h1 className="text-4xl font-extrabold text-gray-900">{pageTitle}</h1>
                    </div>
                    {currentView === 'services' && (
                        // Link back to the main dashboard
                        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold transition"> 
                            Go to Dashboard
                        </Link>
                    )}
                </header>

                {/* Content Area */}
                <div className="flex justify-center py-4">
                    {renderFormOrHistoryView()}
                </div>
            </div>
        </div>
    );
};

export default DocumentReviewServicePage;
