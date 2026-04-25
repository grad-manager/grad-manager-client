// src/components/AcademicCVHistory.tsx
import React, { useEffect } from 'react';
import { FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaDownload, FaSpinner, FaPencilAlt, FaInfoCircle } from 'react-icons/fa';
import type { IconType } from 'react-icons/lib';

// Placeholder for CV Request structure (MUST align with ../types/documents.ts)
interface CVRequest {
    // FIX 1: ADD 'review_complete' to the status type
    status: 'pending' | 'review' | 'feedback' | 'completed' | 'declined' | 'scheduled' | 'review_complete';
    // ADDED: Field to distinguish between request types
    type: 'cv_upload' | 'new_cv_request'; 
    timestamp: string;
    // FIX: Updated to allow 'null' to match the centralized type definition (../types/documents.ts)
    uploadedFileUrl?: string | null; // <-- This is the file the user initially uploaded
    finalDocumentUrl?: string | null; // FIX: Also updated this one for consistency
    mentorFeedback?: string;
    notes?: string;
    // ADDED: Fields for scheduled sessions
    scheduledDate?: string; 
    scheduledTime?: string;
    zoomLink?: string;
}

interface AcademicCVHistoryProps {
    cvRequest: CVRequest | null;
    onClose: () => void;
    fetchCVRequest: () => Promise<void>; // Function to refetch the latest request status
}

const AcademicCVHistory: React.FC<AcademicCVHistoryProps> = ({ cvRequest, onClose, fetchCVRequest }) => {
    
    // Fetch request on mount to ensure status is up-to-date
    useEffect(() => {
        fetchCVRequest(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount, assuming fetchCVRequest is stable



    if (!cvRequest) {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Academic CV History</h2>
                <p className="text-gray-500 py-6">
                    No CV requests found. Use the **Request New Session** button to get started.
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold transition"
                >
                    Back to Services
                </button>
            </div>
        );
    }

    const statusDetails: Record<CVRequest['status'], { text: string, color: string, icon: IconType }> = {
        pending: { text: 'Submitted and Awaiting Review', color: 'text-yellow-600', icon: FaClock },
        review: { text: 'Under Review by Mentor', color: 'text-blue-600', icon: FaSpinner },
        scheduled: { text: 'Session Scheduled', color: 'text-orange-600', icon: FaClock },
        feedback: { text: 'Mentor Feedback Provided', color: 'text-purple-600', icon: FaPencilAlt },
        review_complete: { text: 'Review Complete (Ready for Download)', color: 'text-green-600', icon: FaCheckCircle },
        completed: { text: 'Completed', color: 'text-green-600', icon: FaCheckCircle },
        declined: { text: 'Declined/Cancelled', color: 'text-red-600', icon: FaTimesCircle },
    };

    const detail = statusDetails[cvRequest.status] || { text: 'Unknown Status', color: 'text-gray-600', icon: FaFileAlt };
    const Icon = detail.icon;
    
    // Check if the timestamp is valid before attempting to format it.
    const date = new Date(cvRequest.timestamp);
    const isValidDate = !isNaN(date.getTime());
    
    const formattedDate = isValidDate
        ? date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        : 'Date Unavailable'; 

    const isFinalDocumentReady = cvRequest.status === 'completed' || cvRequest.status === 'feedback' || cvRequest.status === 'review_complete';


    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaFileAlt className="mr-2 text-indigo-600" /> Latest CV Request Status
                </h2>
                <button
                    onClick={onClose}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition text-sm"
                >
                    Back to Services
                </button>
            </div>

            <div className={`p-6 border-2 rounded-xl shadow-inner ${isFinalDocumentReady ? 'border-green-300' : 'border-gray-200'}`}>
                
                <div className="flex items-center space-x-4 mb-4">
                    <Icon className={`text-4xl ${detail.color} ${cvRequest.status === 'review' ? 'animate-spin' : ''}`} />
                    <div>
                        <p className={`text-lg font-semibold ${detail.color}`}>{detail.text}</p>
                        <p className={`text-sm ${isValidDate ? 'text-gray-500' : 'text-red-500 font-semibold'}`}>
                            {isValidDate 
                                ? <FaClock className="inline mr-1" />
                                : <FaInfoCircle className="inline mr-1" />
                            }
                            Request Submitted: {formattedDate}
                        </p>
                        {/* Conditional display for scheduled session details */}
                        {cvRequest.status === 'scheduled' && cvRequest.scheduledDate && cvRequest.scheduledTime && cvRequest.zoomLink && (
                            <p className="text-sm text-orange-600 mt-1 font-medium">
                                Scheduled: **{cvRequest.scheduledDate}** at **{cvRequest.scheduledTime}** (Link: <a href={cvRequest.zoomLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-700">Zoom Meeting</a>)
                            </p>
                        )}
                    </div>
                </div>

                {cvRequest.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="font-semibold text-sm text-gray-700">Your Initial Notes:</p>
                        <p className="text-sm text-gray-600 italic line-clamp-3">{cvRequest.notes}</p>
                    </div>
                )}

                {/* --- DOWNLOAD SECTION --- */}
                <div className="mt-6 space-y-3">
                    {/* 1. Link to the original file uploaded by the user */}
                    {cvRequest.type === 'cv_upload' && cvRequest.uploadedFileUrl ? (
                        <a 
                            href={cvRequest.uploadedFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center space-x-2 bg-indigo-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-600 transition text-sm"
                        >
                            <FaDownload /> <span>Download Your <strong>Original</strong> Upload</span>
                        </a>
                    ) : (
                        (cvRequest.type === 'new_cv_request') ? (
                            <p className="text-sm text-gray-500 p-2 border-l-4 border-gray-300 bg-gray-50">
                                This was a <strong>New CV Request</strong> session; no original file was uploaded for review.
                            </p>
                        ) : (
                            // Only show the missing link warning if the status is past pending/review AND the type is upload.
                            (cvRequest.status !== 'pending' && cvRequest.status !== 'review') && (
                                <p className="text-sm text-red-500 p-2 border-l-4 border-red-300 bg-red-50">
                                    <FaInfoCircle className="inline mr-1" /> Original document link is missing for this review type.
                                </p>
                            )
                        )
                    )}

                    {/* 2. Link to the final corrected document from the admin */}
                    {isFinalDocumentReady ? ( 
                        cvRequest.finalDocumentUrl ? (
                            <a 
                                href={cvRequest.finalDocumentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center space-x-2 bg-green-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-green-600 transition"
                            >
                                <FaDownload /> <span>Download <strong>Final CV</strong>  Document</span>
                            </a>
                        ) : (
                            // This fallback should only appear if data is corrupted (status ready but link missing)
                            <p className="text-sm text-red-500 p-2 border-l-4 border-red-300 bg-red-50 font-semibold">
                                <FaInfoCircle className="inline mr-1" /> Final document not yet linked by mentor despite status being **'{cvRequest.status}'**.
                            </p>
                        )
                    ) : (
                        // Show a message if status is not a ready state
                        <p className="text-sm text-blue-500 p-2 border-l-4 border-blue-300 bg-blue-50">
                            The <strong>Final CV Document</strong> will be available for download once the status is "**Review Complete**," "**Feedback Provided**" or "**Completed**."
                        </p>
                    )}
                </div>
                {/* --- END DOWNLOAD SECTION --- */}

                {/* Show mentor notes if status is ready/feedback */}
                {(cvRequest.status === 'feedback' || cvRequest.status === 'review_complete') && cvRequest.mentorFeedback && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-300">
                        <p className="font-bold text-purple-700 mb-1">Mentor's Feedback:</p>
                        <p className="text-sm text-purple-800">{cvRequest.mentorFeedback}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicCVHistory;