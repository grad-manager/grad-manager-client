// src/pages/InterviewPrepPage.tsx

import React, { useState } from 'react';
import InterviewPrepServices from '../components/InterviewPrepServices';
import InterviewPrepForm from '../components/InterviewPrepForm';
import InterviewPrepHistory from '../components/Dashboard/InterviewPrepHistory';
import VisaInterviewPrepForm from '../components/VisaInterviewPrepForm'; 
import VisaInterviewHistory from '../components/Dashboard/VisaInterviewHistory'; 
import { useApplications } from '../hooks/useApplications'; 
import { FaArrowLeft, FaSpinner } from 'react-icons/fa'; // Added FaSpinner
import { useAuth } from '../context/AuthContext'; 
import { Link } from 'react-router-dom'; // Assuming Link comes from react-router-dom
import TrialBanner from '../components/TrialBanner';

// Define the different views for the page
type InterviewView = 
  | 'services' 
  | 'admission_form' 
  | 'admission_history' 
  | 'visa_form' 
  | 'visa_history';

const InterviewPrepPage: React.FC = () => {
  // State to control which sub-view is rendered
  const [currentView, setCurrentView] = useState<InterviewView>('services');
  
  // ✅ FIX: Destructure both currentUser AND token from useAuth()
  const { currentUser, token, userProfile } = useAuth();
  
  // ✅ FIX: Pass both currentUser AND token to useApplications()
  // The 'loading' state is also destructured to show a spinner before rendering the form.
  const { applications, loading } = useApplications(currentUser, token);

  const handleBackToServices = () => setCurrentView('services');
  
  const handleRequestSent = () => {
    // Logic to show a success message or automatically transition to history
    alert('Interview preparation request sent successfully!');
    setCurrentView('admission_history');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'services':
        return (
          <InterviewPrepServices
            onOpenAdmissionForm={() => setCurrentView('admission_form')}
            onOpenAdmissionHistory={() => setCurrentView('admission_history')}
            onOpenVisaForm={() => setCurrentView('visa_form')}
            onOpenVisaHistory={() => setCurrentView('visa_history')}
            userProfile={userProfile}
            onNavigateToSubscription={() => { window.location.href = '/subscribe'; }}
          />
        );
      
      case 'admission_form':
        // Show loading state if applications are still being fetched
        if (loading) {
            return (
                <div className="text-center p-10 bg-white rounded-xl shadow-lg w-full max-w-2xl">
                    <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto" />
                    <p className="mt-4 text-gray-600 font-semibold">Loading your applications...</p>
                </div>
            );
        }

        return (
          <InterviewPrepForm 
            applications={applications} 
            onClose={handleBackToServices} 
            onInterviewRequestSent={handleRequestSent}
            userProfile={userProfile}
          />
        );

      case 'admission_history':
        return (
          <InterviewPrepHistory 
            onClose={handleBackToServices} 
            title="Admission Interview History" 
            type="admission" 
          />
        );
      
      case 'visa_form':
        // NOTE: The Visa form might also need the applications list for reference.
        // Assuming VisaInterviewPrepForm handles its own data or doesn't need 'applications'.
        return (
          <VisaInterviewPrepForm 
            onClose={handleBackToServices}
            onVisaRequestSent={handleRequestSent}
            userProfile={userProfile}
          />
        );
      
      case 'visa_history':
        return (
          <VisaInterviewHistory 
            onClose={handleBackToServices}
            title="Visa Interview History" 
            type="visa" 
          />
        );

      default:
        return <p className="text-center text-red-500">View not found.</p>;
    }
  };

  // Determine the title and whether to show the back button
  const pageTitle = {
    'services': 'Interview Preparation Services',
    'admission_form': 'Request Admission Interview Prep',
    'admission_history': 'Admission Interview History',
    'visa_form': 'Request Visa Interview Prep',
    'visa_history': 'Visa Interview History',
  }[currentView] || 'Interview Prep';

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
              // FIX: Assuming a Link component is used for navigation
             <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold transition"> 
                Go to Dashboard
             </Link>
          )}
        </header>

        {/* Content Area */}
        <div className="flex justify-center py-4">
            {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepPage;
