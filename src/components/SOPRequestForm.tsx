/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/SOPRequestForm.tsx

import React, { useState, useMemo } from 'react';
import { 
    FaSpinner, 
    FaPenFancy, 
    FaArrowLeft, 
    FaFileAlt, 
    FaFolderOpen, 
    FaSearch,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCrown
} from 'react-icons/fa';
import type { Application } from '../types/Application'; 
import { toast } from 'react-toastify';
// Assuming these imports exist in your project structure
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';
import ConfirmationModal from './common/ConfirmationModal';
import SelectionModal from './common/SelectionModal'; 
import { getEffectivePlanLabel } from '../utils/trial';

// SOP limits by plan (matching backend)
const getSopLimit = (plan: 'Free' | 'Pro'): number => {
    if (plan === 'Free') return 0;
    return 3;
};

interface UserSOPStats {
    currentRequestCount: number;
    plan: string;
}

interface SOPRequestFormProps {
    applications: Application[];
    onRequestSOPWriting: (applicationId: string | null, notes: string, file?: File) => Promise<any>; 
    hasActiveRequest: (applicationId: string) => boolean; 
    onClose: () => void;
    onNavigateToSubscription: () => void;
    userSOPStats?: UserSOPStats; 
    userProfile?: any; // Firestore user profile with sopRequestCount
}

const SOPRequestForm: React.FC<SOPRequestFormProps> = ({ 
    applications, 
    onRequestSOPWriting, 
    hasActiveRequest,
    onClose,
    onNavigateToSubscription,
    userSOPStats = { currentRequestCount: 0, plan: 'Free' },
    userProfile
}) => {
    // Prefer userProfile.sopRequestCount from Firestore if available, otherwise use userSOPStats
    const currentRequestCount = userProfile?.sopRequestCount ?? userSOPStats.currentRequestCount ?? 0;
    const userPlan = getEffectivePlanLabel(userProfile);
    const sopLimit = getSopLimit(userPlan);
    const requestsRemaining = sopLimit === Infinity ? Infinity : sopLimit - currentRequestCount;
    const isLimitReached = sopLimit !== Infinity && currentRequestCount >= sopLimit;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [sopNotes, setSopNotes] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPureWriteUp, setIsPureWriteUp] = useState<boolean>(true); 
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false); 

    const selectedApplication = applications.find(app => app._id === selectedAppId);

    // Dynamic Step Numbering
    const stepNumberForNotes = isPureWriteUp ? 3 : 4;
    const stepNumberForApp = isPureWriteUp ? 2 : 3;
    const stepNumberForUpload = 2;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(<ErrorToast message="Invalid file type. Please upload a PDF, DOC, or DOCX file." />);
                setSelectedFile(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(<ErrorToast message="File size exceeds the 5MB limit." />);
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
        }
    };
    
    const handleConfirmOpen = () => {
        // Prevent opening confirmation if limit is reached
        if (isLimitReached) {
            toast.error(
                <div className="flex flex-col">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="text-xl mr-2 text-yellow-300" />
                        <span className="font-bold">Limit Reached ({userPlan})</span>
                    </div>
                    <p className="mt-1 text-sm">You have reached your limit of {sopLimit} SOP request(s). Upgrade to Pro for more access.</p>
                    <button
                        onClick={() => {
                            onNavigateToSubscription();
                            toast.dismiss();
                        }}
                        className="mt-3 bg-indigo-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-indigo-600 transition"
                    >
                        Go to Subscription
                    </button>
                </div>, 
                { autoClose: 8000 }
            );
            return;
        }

        // Validation: Notes are always required
        if (sopNotes.trim() === '') {
            toast.error(<ErrorToast message="Please provide notes for the SOP service." />);
            return;
        }
        
        // Validation: File is required only if not a pure write-up (Correction/Rework)
        if (!isPureWriteUp && !selectedFile) {
             toast.error(<ErrorToast message="A file is required for Correction/Rework service." />);
             return;
        }

        setIsConfirmOpen(true);
    };

    const handleRequest = async () => {
        setIsConfirmOpen(false);
        if (sopNotes.trim() === '') return; 
        
        setIsSubmitting(true);
        try {
            const fileToSubmit = isPureWriteUp ? undefined : selectedFile || undefined;
            
            await onRequestSOPWriting(
                selectedAppId, 
                sopNotes, 
                fileToSubmit
            ); 
            
            const serviceType = isPureWriteUp ? 'Live Writing' : 'Review';
            const schoolName = selectedApplication?.schoolName || 'General Request';
            toast.success(<SuccessToast message={`SOP ${serviceType} request submitted for ${schoolName}!`} />);
            onClose(); 
        } catch (error: any) {
            console.error("SOP Request failed:", error);
            
            // Check for the limit exceeded error code (returned by the backend)
            if (error?.code === 'LIMIT_EXCEEDED') {
                toast.error(
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <FaExclamationTriangle className="text-xl mr-2 text-yellow-300" />
                            <span className="font-bold">Upgrade Required</span>
                        </div>
                        <p className="mt-1 text-sm">{error.message || `You've reached your limit of ${sopLimit} requests.`}</p>
                        <button
                            onClick={() => {
                                onNavigateToSubscription();
                                toast.dismiss();
                            }}
                            className="mt-3 bg-indigo-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-indigo-600 transition"
                        >
                            Go to Subscription
                        </button>
                    </div>, 
                    { autoClose: 8000 } 
                );
            } else {
                toast.error(<ErrorToast message="Failed to submit SOP request. Please try again." />);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to determine if the submit button should be disabled
    const isSubmitDisabled = 
        isSubmitting || 
        sopNotes.trim() === '' || 
        (!isPureWriteUp && !selectedFile) ||
        isLimitReached; // Disable if limit is reached

    // Memoized list for the Selection Modal
    const modalApplicationItems = useMemo(() => 
        applications.map(app => ({
            id: app._id,
            title: app.schoolName,
            subtitle: app.programName,
            disabled: hasActiveRequest(app._id),
            disabledReason: hasActiveRequest(app._id) ? "Active request exists for this application." : undefined
        }))
    , [applications, hasActiveRequest]);


    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center">
                    <button 
                        onClick={onClose}
                        className="text-gray-600 hover:text-indigo-600 transition mr-4 p-2 rounded-full hover:bg-gray-100"
                        aria-label="Back"
                    >
                        <FaArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">SOP Service</h2>
                </div>
                
                {/* Usage Status Badge (Visible to users) */}
                {sopLimit === Infinity ? (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full shadow-sm">
                        <FaCrown className="w-3 h-3 mr-1" />
                        {userPlan.toUpperCase()} User
                    </span>
                ) : (
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                        requestsRemaining > 0 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-red-100 text-red-800 border border-red-400'
                    }`}>
                        {requestsRemaining > 0 
                            ? `${requestsRemaining} Request${requestsRemaining > 1 ? 's' : ''} Left`
                            : 'Limit Reached'
                        }
                    </span>
                )}
            </div>
            
            {/* FREE TIER UPGRADE PROMPT */}
            {userPlan === 'Free' && (
                <div className="p-6 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-xl text-center">
                    <div className="flex justify-center mb-3">
                        <FaCrown className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade to Pro</h3>
                    <p className="text-gray-700 mb-4">
                        Your <strong>free plan</strong> doesn't include SOP review services. 
                        Upgrade to Pro for 3 reviews.
                    </p>
                    <button
                        onClick={onNavigateToSubscription}
                        className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        View Subscription Plans
                    </button>
                </div>
            )}

            {/* Limit Reached Warning Message (Persistent) */}
            {isLimitReached && (
                <div className="p-4 mb-6 bg-red-50 border border-red-300 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-sm font-medium text-red-800">
                            You have {sopLimit} SOP requests.
                        </p>
                    </div>
                    <button
                        onClick={onNavigateToSubscription}
                        className="text-sm font-semibold text-red-700 bg-white hover:bg-red-100 py-1 px-3 rounded-lg border border-red-400 transition"
                    >
                        Subscribe Now
                    </button>
                </div>
            )}

            <div className='mb-6'>
                {/* 1. Service Type Toggle */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Choose Service Type *</h3>
                 <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                     <span className="text-sm font-medium text-gray-700">Service:</span>
                     <div className="flex space-x-4">
                         <label className="flex items-center cursor-pointer">
                             <input
                                 type="radio"
                                 name="sop_service_type"
                                 checked={isPureWriteUp}
                                 onChange={() => {
                                     setIsPureWriteUp(true);
                                     setSelectedFile(null); 
                                 }}
                                 className="form-radio text-indigo-600 h-4 w-4"
                             />
                             <span className="ml-2 text-sm font-semibold">Live Writing</span>
                         </label>
                         <label className="flex items-center cursor-pointer">
                             <input
                                 type="radio"
                                 name="sop_service_type"
                                 checked={!isPureWriteUp}
                                 onChange={() => setIsPureWriteUp(false)}
                                 className="form-radio text-indigo-600 h-4 w-4"
                             />
                             <span className="ml-2 text-sm font-semibold">Review</span>
                         </label>
                     </div>
                 </div>
            </div>

            <div className="p-2 space-y-6">
                
                {/* 2. File Upload (Conditional for Correction/Rework) */}
                {!isPureWriteUp && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{stepNumberForUpload}. Upload Existing SOP *</h3>
                            <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-white">
                                <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="sop-file-new">
                                    Upload SOP File (for Rework/Correction)
                                </label>
                                <input
                                    type="file"
                                    id="sop-file-new"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                />
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-green-600 flex items-center">
                                        <FaFileAlt className="mr-2" /> Selected file: **{selectedFile.name}**
                                    </p>
                                )}
                                {!selectedFile && (
                                    <p className="mt-2 text-sm text-red-500">
                                        *File upload is required for Correction/Rework.
                                    </p>
                                )}
                            </div>
                    </div>
                )}

                {/* Application Selection (Optional for ALL) */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {stepNumberForApp}. Select Target Application (Optional)
                    </h3>
                    <div className="mb-3 p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                        {selectedAppId === null ? (
                             <div className='flex items-center text-gray-800'>
                                 <FaFolderOpen className='inline mr-2 text-indigo-600 h-5 w-5' /> 
                                 <span className="font-bold text-base">General SOP Request</span>
                            </div>
                        ) : (
                            <div className='flex items-center justify-between text-gray-800'>
                                <div className='truncate'>
                                    <FaCheckCircle className='inline mr-2 text-green-600 h-5 w-5' /> 
                                    <span className="font-bold text-base">{selectedApplication?.schoolName}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedAppId(null)}
                                    className='text-xs text-red-500 hover:text-red-700 font-semibold ml-4'
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedAppId === null 
                                ? "No specific application associated. Click 'Browse' to link one."
                                : selectedApplication?.programName
                            }
                        </p>
                    </div>

                    <button
                        onClick={() => setIsSelectionModalOpen(true)}
                        disabled={isSubmitting}
                        className="w-full bg-indigo-50 border border-indigo-500 text-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-100 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300 flex items-center justify-center"
                    >
                        <FaSearch className="mr-2" /> Browse Applications ({applications.length})
                    </button>
                </div>

                {/* Notes Area (Always Required) */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{stepNumberForNotes}. Your Notes & Key Details *</h3>
                    <textarea
                        id="sop-notes"
                        rows={6}
                        value={sopNotes}
                        onChange={(e) => setSopNotes(e.target.value)}
                        className="w-full p-3 border text-gray-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
                        placeholder={isPureWriteUp 
                            ? "Provide details about your background, career goals, and why you are applying to this program/school."
                            : "Describe the specific corrections, focus shifts, or target improvements needed for the uploaded SOP."
                        }
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                        Required: Instructions for the mentor.
                    </p>
                </div>


                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleConfirmOpen}
                        disabled={isSubmitDisabled}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" /> Submitting...
                            </>
                        ) : (
                            <>
                                <FaPenFancy className="mr-2" /> 
                                {isPureWriteUp ? 'Request New SOP Write-up' : 'Submit SOP for Review'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                message={`You are submitting a request for **${isPureWriteUp ? 'New SOP Write-up' : 'SOP Review'}** for ${selectedApplication ? `the application to **${selectedApplication.schoolName}**` : 'a general application'}. Are you sure you want to proceed?`}
                onConfirm={handleRequest}
                onCancel={() => setIsConfirmOpen(false)}
                title={isPureWriteUp ? "Confirm New SOP Request" : "Confirm SOP Review"}
                confirmButtonText={isPureWriteUp ? "Request New SOP" : "Confirm Submission"}
            />

            {/* Application Selection Modal */}
            <SelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                title="Select Application to Link"
                items={modalApplicationItems}
                onSelect={(id: string) => {
                    setSelectedAppId(id);
                    setIsSelectionModalOpen(false);
                }}
                selectedId={selectedAppId}
            />
        </div>
    );
};

export default SOPRequestForm;
