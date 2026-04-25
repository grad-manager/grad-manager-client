// src/components/InterviewPrepServices.tsx (Updated)

import React from 'react';
import { FaGraduationCap, FaLink, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import { getEffectivePlanLabel } from '../utils/trial';

interface InterviewPrepServicesProps {
    // ❌ Removed onClose
    onOpenAdmissionForm: () => void;
    onOpenAdmissionHistory: () => void;
    onOpenVisaForm: () => void;
    onOpenVisaHistory: () => void;
    userProfile?: any;
    onNavigateToSubscription?: () => void;
}

const getInterviewLimit = (_plan: 'Free' | 'Pro'): number => {
    return 0;
};

const InterviewPrepServices: React.FC<InterviewPrepServicesProps> = ({ 
    onOpenAdmissionForm,
    onOpenAdmissionHistory,
    onOpenVisaForm,
    onOpenVisaHistory,
    userProfile,
    onNavigateToSubscription = () => { window.location.href = '/subscribe'; }
}) => {
    const plan = getEffectivePlanLabel(userProfile);
    const limit = getInterviewLimit(plan);
    const used = userProfile?.mockInterviewCount || 0;
    const canRequest = limit === Infinity || used < limit;
    const upgradeLabel = 'Not Included';
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col space-y-8">
            
            {/* Introduction Panel */}
            <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-extrabold mb-2">Elevate Your Interview Game</h2>
                <p className="text-indigo-200">
                    Prepare for both your <strong>Admission</strong> and <strong>Visa</strong> interviews with mock sessions, personalized feedback, and expert strategies tailored to your target school and program.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Admission Interview Section */}
                <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-md flex flex-col">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center mb-4">
                        <FaGraduationCap className="mr-3 text-blue-500" /> Admission Interview Prep
                    </h3>
                    <p className="text-sm text-gray-700 mb-6 flex-grow">
                        Request one-on-one sessions for interviews related to your university applications (e.g., Master's, PhD, MBA).
                    </p>
                    <div className="flex flex-col space-y-3 pt-4 border-t border-blue-100">
                        {canRequest ? (
                            <button
                                onClick={onOpenAdmissionForm}
                                className="w-full py-3 px-4 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                            >
                                <span>Request Session</span>
                                <FaCalendarAlt />
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={onNavigateToSubscription}
                                    className="w-full py-3 px-4 rounded-full bg-white text-blue-600 font-semibold border border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>{upgradeLabel}</span>
                                </button>
                                <p className="text-xs text-gray-500 text-center">Mock interview prep is no longer included in current plans.</p>
                            </div>
                        )}
                        <button
                            onClick={onOpenAdmissionHistory}
                            className="w-full py-3 px-4 rounded-full bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>View History</span>
                            <FaHistory />
                        </button>
                    </div>
                </div>

                {/* Visa Interview Section */}
                <div className="bg-white rounded-xl p-6 border border-green-200 shadow-md flex flex-col">
                    <h3 className="text-xl font-bold text-green-800 flex items-center mb-4">
                        <FaLink className="mr-3 text-green-500" /> Visa Interview Preparation
                    </h3>
                    <p className="text-sm text-gray-700 mb-6 flex-grow">
                        Get coached on common visa questions, required documentation, and how to clearly articulate your post-graduation plans.
                    </p>
                    <div className="flex flex-col space-y-3 pt-4 border-t border-green-100">
                        {canRequest ? (
                            <button
                                onClick={onOpenVisaForm}
                                className="w-full py-3 px-4 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                            >
                                <span>Request Visa Session</span>
                                <FaCalendarAlt />
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={onNavigateToSubscription}
                                    className="w-full py-3 px-4 rounded-full bg-white text-green-600 font-semibold border border-green-200 hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>{upgradeLabel}</span>
                                </button>
                                <p className="text-xs text-gray-500 text-center">Visa interview prep is no longer included in current plans.</p>
                            </div>
                        )}
                        <button
                            onClick={onOpenVisaHistory}
                            className="w-full py-3 px-4 rounded-full bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>View History</span>
                            <FaHistory />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewPrepServices;
