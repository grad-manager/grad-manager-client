// src/components/InterviewPrepForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { FaSave, FaSpinner, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa'; // Added FaExclamationTriangle
import type { Application } from '../types/Application';
import { getEffectivePlanLabel } from '../utils/trial';

const API_URL = import.meta.env.VITE_API_URL;

interface InterviewPrepFormProps {
    applications: Application[];
    onClose: () => void; // Renamed for clarity to onBack in implementation
    onInterviewRequestSent: () => void;
    userProfile?: any;
}

const InterviewPrepForm: React.FC<InterviewPrepFormProps> = ({ applications, onClose: onBack, onInterviewRequestSent, userProfile }) => {
    const { currentUser, token } = useAuth();
    const userPlan = getEffectivePlanLabel(userProfile);
    const getInterviewLimit = (_plan: 'Free' | 'Pro'): number => {
        return 0;
    };
    const interviewLimit = getInterviewLimit(userPlan);
    const mockUsed = userProfile?.mockInterviewCount || 0;
    const canRequest = interviewLimit === Infinity || mockUsed < interviewLimit;
    
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!currentUser || !token) { 
            setError('User not authenticated or token is missing. Please log in.');
            return;
        }

        if (!canRequest) {
            const upgradeMessage =
                interviewLimit === 0
                    ? 'Mock interview prep is no longer included in the current plans.'
                    : 'You have used all mock interview sessions. Please upgrade to Pro for more access.';
            setError(upgradeMessage);
            setLoading(false);
            return;
        }

        if (!selectedApplicationId || !interviewDate) {
            setError('Please select an application and a date.');
            return;
        }

        setLoading(true);

        const selectedApplication = applications.find(app => app._id === selectedApplicationId);
        if (!selectedApplication) {
            setError('Selected application not found.');
            setLoading(false);
            return;
        }

        const requestData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            applicationId: selectedApplication._id,
            schoolName: selectedApplication.schoolName,
            programName: selectedApplication.programName,
            interviewDate,
            notes,
            status: 'pending',
        };

        try {
            await axios.post(`${API_URL}/interview-prep/requests`, requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onInterviewRequestSent();
            
        } catch (err) {
            console.error('Failed to send interview prep request:', err);
            const responseData = axios.isAxiosError(err) ? err.response?.data : null;
            if (responseData?.code === 'LIMIT_EXCEEDED' && responseData?.upgradeRequired) {
                const planLabel = responseData?.nextPlan ? String(responseData.nextPlan) : 'Pro';
                setError(`You have reached your mock interview limit. Please upgrade to ${planLabel} to request more sessions.`);
            } else {
                setError('Failed to send request. Please try again. Check the console for API details.');
            }
        } finally {
            setLoading(false);
        }
    }; 

    // --- NEW LOGIC: Handling empty applications array ---
    const hasApplications = applications && applications.length > 0;
    
    // Check if the component is being rendered before data is available.
    // We assume the parent is handling the 'loading' state via its own logic (e.g., from useApplications hook).

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
            
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
                Admission Interview Prep Request
            </h2>

            <p className="text-gray-600 mb-6 text-center text-lg">
                Submit your interview details below. We'll contact you to schedule your mock session.
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* ERROR STATE: No applications available */}
            {!hasApplications ? (
                <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-xl shadow-inner">
                    <FaExclamationTriangle className="text-yellow-600 text-3xl mx-auto mb-3" />
                    <p className="font-semibold text-gray-800 mb-2">No Applications Found</p>
                    <p className="text-sm text-gray-600">
                        Please add an application to your tracker before requesting interview preparation. 
                        Your interview prep is tied to a specific school and program.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Application</label>
                            <select
                                value={selectedApplicationId}
                                onChange={(e) => setSelectedApplicationId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-gray-50"
                                required
                            >
                                <option value="">-- Choose an application --</option>
                                {applications.map(app => (
                                    <option key={app._id} value={app._id}>
                                        {app.schoolName} - {app.programName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tentative Interview Date</label>
                            <input
                                type="date"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-gray-50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 text-gray-800 bg-gray-50"
                                rows={4}
                                placeholder="e.g., specific professor, type of interview (technical/behavioral), any specific questions you have."
                            />
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 text-gray-600 font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center"
                        >
                            <FaArrowLeft className="mr-2" /> Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2 disabled:bg-gray-400 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Send Request</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
            
            {/* Display Back button even if form isn't shown, allowing the user to exit */}
            {hasApplications === false && (
                 <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 text-gray-600 font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center"
                    >
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default InterviewPrepForm;
