// src/components/AcademicCVRequestForm.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { FaUpload, FaFileAlt, FaPencilAlt, FaSpinner, FaArrowLeft, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';
import ConfirmationModal from './common/ConfirmationModal';
import { getEffectivePlanLabel, normalizePlanLabel } from '../utils/trial';

// 🛑 FIX: REMOVE local mock CVRequestStatus and CVRequest definition
// We will import the correct type from the central source.
import type { CVRequest } from '../types/documents'; // <-- Use the central type

// CV limits by plan (from pricing: Free=0, Pro=3)
const getCvLimit = (plan: 'Free' | 'Pro'): number => {
    if (plan === 'Free') return 0;
    return 3;
};

// Re-export the prop interface, using the imported CVRequest type
export interface AcademicCVRequestFormProps {
    onClose: () => void; // Used to navigate back to the 'services' view
    onUpload: (file: File) => Promise<void>;
    onNewRequest: (data: NewCVRequestData) => Promise<void>;
    cvRequest: CVRequest | null | undefined; // Now using the centralized type
    userPlan?: string; // User's current subscription plan
    onNavigateToSubscription?: () => void; // Navigate to subscription page
    userProfile?: any; // Firestore user profile with cvRequestCount
}

interface NewCVRequestData {
    notes: string;
}

const AcademicCVRequestForm: React.FC<AcademicCVRequestFormProps> = ({
    onClose,
    onUpload,
    onNewRequest,
    cvRequest,
    userPlan = 'Free',
    onNavigateToSubscription = () => {},
    userProfile
}) => {
    const plan = userProfile ? getEffectivePlanLabel(userProfile) : normalizePlanLabel(userPlan);
    const cvLimit = getCvLimit(plan);
    const canUseCVService = cvLimit > 0;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    // Start on 'main' view by default for selection
    const [view, setView] = useState<'main' | 'upload' | 'new_request'>('main'); 
    const [newCVNotes, setNewCVNotes] = useState<string>('');
    const [isConfirmUploadOpen, setIsConfirmUploadOpen] = useState(false);
    const [isConfirmNewRequestOpen, setIsConfirmNewRequestOpen] = useState(false);

    // Filter active statuses to show a warning banner. Must include 'feedback' now.
    const hasActiveRequest = cvRequest && ['pending', 'review', 'feedback'].includes(cvRequest.status);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
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

    const handleUploadClick = () => {
        if (!selectedFile) {
            toast.error(<ErrorToast message="Please select a file to upload." />);
            return;
        }
        setIsConfirmUploadOpen(true);
    };

    const confirmUpload = async () => {
        setIsConfirmUploadOpen(false);
        if (!selectedFile) return;
        setIsSubmitting(true);
        try {
            await onUpload(selectedFile);
            toast.success(<SuccessToast message="CV uploaded successfully and submitted for review!" />);
            onClose(); // Navigate back to services/history view
        } catch (err) {
            toast.error(<ErrorToast message="Failed to upload file. Please try again." />);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewRequestClick = () => {
        if (newCVNotes.trim() === '') {
            toast.error(<ErrorToast message="Please provide some notes for the new CV request." />);
            return;
        }
        setIsConfirmNewRequestOpen(true);
    };

    const confirmNewRequest = async () => {
        setIsConfirmNewRequestOpen(false);
        if (newCVNotes.trim() === '') return;
        setIsSubmitting(true);
        try {
            await onNewRequest({ notes: newCVNotes });
            toast.success(<SuccessToast message="New CV request submitted successfully! A mentor will be in touch." />);
            onClose(); // Navigate back to services/history view
        } catch (err) {
            toast.error(<ErrorToast message="Failed to submit request. Please try again." />);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        // If on a sub-view, go back to main selection
        if (view !== 'main') {
            setView('main');
        } else {
            // If on main selection, go back to the service menu page
            onClose();
        }
    };

    const renderCurrentView = () => {
        // --- Plan gate check: Show upgrade message if user cannot use CV service ---
        if (!canUseCVService) {
            return (
                <div className="space-y-4 text-center p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <FaCrown className="text-4xl text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800">CV Service Not Available</h3>
                    <p className="text-sm text-gray-700">
                        Your <strong>{plan}</strong> plan doesn't include CV review services. 
                    </p>
                    <p className="text-sm text-gray-700">
                        Upgrade to <strong>Pro</strong> to get 3 CV reviews.
                    </p>
                    <button
                        onClick={onNavigateToSubscription}
                        className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        View Plans
                    </button>
                    <button
                        onClick={onClose}
                        className="mt-2 w-full bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Back to Services
                    </button>
                </div>
            );
        }

        // --- Main selection view ---
        if (view === 'main') {
            return (
                <div className="space-y-4">
                    <p className="mb-4 text-gray-700">How would you like to proceed?</p>
                    <button
                        onClick={() => setView('upload')}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                        <FaUpload /> <span>Upload Existing CV for Review</span>
                    </button>
                    <button
                        onClick={() => setView('new_request')}
                        className="w-full bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                        <FaPencilAlt /> <span>Request New CV Write-up</span>
                    </button>
                </div>
            );
        }

        // --- Upload flow view ---
        if (view === 'upload') {
            return (
                <>
                    <p className="mb-4 text-gray-700">
                        Upload your current CV for a professional academic review. Accepted formats: <strong>PDF, DOC, or DOCX</strong> (Max 5MB).
                    </p>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="cv-file">
                            Upload CV file
                        </label>
                        <input
                            type="file"
                            id="cv-file"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                        />
                        {selectedFile && (
                            <p className="mt-2 text-sm text-green-600 flex items-center">
                                <FaFileAlt className="mr-2" /> Selected file: **{selectedFile.name}**
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setView('main')}
                            className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleUploadClick}
                            disabled={isSubmitting || !selectedFile}
                            className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="mr-2 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <FaUpload className="mr-2" /> Submit for Review
                                </>
                            )}
                        </button>
                    </div>
                </>
            );
        }

        // --- New CV request flow view ---
        if (view === 'new_request') {
            return (
                <>
                    <p className="mb-4 text-gray-700">
                        Provide key details about your academic and professional background to help us write your CV from scratch.
                    </p>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="notes">
                            Your Notes & Key Details
                        </label>
                        <textarea
                            id="notes"
                            rows={8}
                            value={newCVNotes}
                            onChange={(e) => setNewCVNotes(e.target.value)}
                            className="w-full p-3 border text-gray-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
                            placeholder="E.g., previous degrees, research experience, publications, awards, target career path, etc."
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setView('main')}
                            className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNewRequestClick}
                            disabled={isSubmitting || newCVNotes.trim() === ''}
                            className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="mr-2 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <FaPencilAlt className="mr-2" /> Request New CV
                                </>
                            )}
                        </button>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
            {/* Header with back button */}
            <div className="flex items-center mb-6 border-b pb-4">
                <button 
                    onClick={handleBack}
                    className="text-gray-600 hover:text-indigo-600 transition mr-4 p-2 rounded-full hover:bg-gray-100"
                    aria-label="Back"
                >
                    <FaArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Academic CV Service</h2>
            </div>

            {/* Active Request Warning */}
            {hasActiveRequest && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-lg">
                    <p className="font-semibold">Active Request Detected</p>
                    {/* The cvRequest!.status should now include 'feedback' from the central type */}
                    <p className="text-sm">You currently have a **{cvRequest!.status}** CV request. Please wait for feedback or completion before submitting a new one.</p>
                </div>
            )}
            
            {/* Form Content */}
            <div className="p-2">
                {renderCurrentView()}
            </div>

            {/* Confirmation modals - still needed but hidden by default */}
            {isConfirmUploadOpen && (
                <ConfirmationModal
                    isOpen={isConfirmUploadOpen}
                    message="Are you sure you want to submit this file for review? Once submitted, you cannot edit it until a mentor provides feedback."
                    onConfirm={confirmUpload}
                    onCancel={() => setIsConfirmUploadOpen(false)}
                    title="Submit CV for Review"
                    confirmButtonText="Submit for Review"
                />
            )}

            {isConfirmNewRequestOpen && (
                <ConfirmationModal
                    isOpen={isConfirmNewRequestOpen}
                    message="Are you sure you want to submit this request? A mentor will use these notes to write a new CV for you."
                    onConfirm={confirmNewRequest}
                    onCancel={() => setIsConfirmNewRequestOpen(false)}
                    title="Request New CV"
                    confirmButtonText="Request New CV"
                />
            )}
        </div>
    );
};

export default AcademicCVRequestForm;
