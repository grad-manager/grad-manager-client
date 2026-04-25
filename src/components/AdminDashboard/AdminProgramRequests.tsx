// src/pages/AdminDashboard/AdminProgramRequests.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
import { db } from '../../firebase'; 
import { useAuth } from '../../context/AuthContext'; 
import { FaSpinner, FaSyncAlt, FaTimes } from 'react-icons/fa';

// The backend endpoint will still be needed for the status update PUT request
const API_URL = import.meta.env.VITE_API_URL;
const PROGRAM_REQUESTS_ENDPOINT = `${API_URL}/program-suggestions`;

// Define the structure of a Program Request item
interface ProgramRequest {
    id: string; // Firestore ID is a string
    submittedBy: string; // The userId who submitted it
    user: string; // This will now hold the Display Name or the ID (as a fallback)
    university: string;
    department: string; 
    date: string; // The submission date (formatted)
    status: 'pending_review' | 'approved' | 'rejected';
    deadline: string | null;
    funding: string;
    
    // --- NEW ADMINISTRATIVE FIELDS ---
    appLink: string;
    fundingAmount: string;
    greWaiver: string; // Can be 'Yes', 'No', or 'N/A'
    ieltsWaiver: string; // Can be 'Yes', 'No', or 'N/A'
    appFeeWaiver: string; // Can be 'Yes', 'No', or 'N/A'
    professors: string;
    requiredDocs: string; // Will be a joined string like "SOP, CV"
    // ---------------------------------

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submissionDate: { seconds: number, nanoseconds: number } | string | any; 
}

// ---------------------------------------------
// --- 1. MODAL COMPONENT FOR DETAILS (Unchanged) ---
// ---------------------------------------------

interface ProgramDetailModalProps {
    request: ProgramRequest;
    onClose: () => void;
}

const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({ request, onClose }) => {
    // Helper function for rendering links
    const renderLink = (label: string, url: string) => {
        if (url === 'N/A' || !url) return <span className="text-gray-500 italic">N/A</span>;
        return (
            <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
            >
                {label} Link
            </a>
        );
    };

    const renderWaiverStatus = (label: string, status: string) => {
        const classes = status.toLowerCase() === 'yes' ? 'bg-green-100 text-green-800' : 
                         status.toLowerCase() === 'no' ? 'bg-red-100 text-red-800' : 
                         'bg-gray-100 text-gray-800';
        return (
            <div className="flex justify-between py-2 border-b">
                <span className="font-medium text-gray-700">{label}:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${classes}`}>
                    {status}
                </span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full m-4 p-6">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Request Details ({request.id.substring(0, 8)}...)</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="p-3 bg-blue-50 rounded-md">
                        {/* Now displays the user's name/ID (name is preferred) */}
                        <p className="text-sm"><strong>Submitted By:</strong> {request.user}</p> 
                        <p className="text-sm"><strong>University:</strong> {request.university}</p>
                        <p className="text-sm"><strong>Department:</strong> {request.department}</p>
                        <p className="text-sm"><strong>Submission Date:</strong> {request.date}</p>
                    </div>

                    {/* Funding and Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-md">
                            <p className="text-sm font-semibold text-gray-700">Funding:</p>
                            <p className="text-lg font-bold text-green-600 capitalize">{request.funding}</p>
                            <p className="text-xs text-gray-500">Amount: {request.fundingAmount}</p>
                        </div>
                        <div className="p-3 border rounded-md">
                            <p className="text-sm font-semibold text-gray-700">Deadline:</p>
                            <p className="text-lg font-bold text-red-600">{request.deadline || 'N/A'}</p>
                        </div>
                    </div>
                    
                    {/* Waivers */}
                    <h4 className="text-md font-semibold mt-4 pt-2 border-t">Waiver Information</h4>
                    {renderWaiverStatus('Application Fee Waiver', request.appFeeWaiver)}
                    {renderWaiverStatus('GRE Waiver', request.greWaiver)}
                    {renderWaiverStatus('IELTS/TOEFL Waiver', request.ieltsWaiver)}

                    {/* Documentation and Links */}
                    <h4 className="text-md font-semibold mt-4 pt-2 border-t">Links & Documentation</h4>
                    <p className="text-sm">
                        <strong className="text-gray-700">Required Docs:</strong> {request.requiredDocs}
                    </p>
                    <p className="text-sm">
                        <strong className="text-gray-700">Application Link:</strong> {renderLink("App", request.appLink)}
                    </p>
                    <p className="text-sm">
                        <strong className="text-gray-700">Professor Link:</strong> {renderLink("Professor", request.professors)}
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// ---------------------------------------------
// --- 2. ADMIN DASHBOARD COMPONENT ---
// ---------------------------------------------

/**
 * Utility function to fetch a single user's display name from Firestore.
 * @param userId The ID of the user to fetch.
 * @returns The user's displayName or null/ID on failure/not found.
 */
const fetchUserName = async (userId: string): Promise<string> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Return display name, or a combination of first/last name, or fallback to the ID
            return userData.displayName || userData.firstName || userData.lastName || userId;
        }
        return userId; // Fallback to ID if document doesn't exist
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return userId; // Fallback on error
    }
};


const AdminProgramRequests: React.FC = () => {
    const { token } = useAuth(); 
    
    const [requests, setRequests] = useState<ProgramRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State for the modal
    const [selectedRequest, setSelectedRequest] = useState<ProgramRequest | null>(null);

    // --- REAL-TIME DATA FETCHING (Updated to include name fetching) ---
    const fetchRequests = () => {
        setError(null);
        setIsLoading(true);

        const unsubscribe = onSnapshot(
            collection(db, 'programSuggestions'),
            async (snapshot) => { // Made the callback async
                const fetchedRequestsPromises: Promise<ProgramRequest>[] = snapshot.docs.map(async doc => {
                    const data = doc.data();
                    
                    // Handle Firestore Timestamp object for display date
                    let displayDate = 'N/A';
                    if (data.submissionDate && data.submissionDate.seconds) {
                        displayDate = new Date(data.submissionDate.seconds * 1000).toLocaleDateString();
                    } else if (typeof data.submissionDate === 'string') {
                           displayDate = new Date(data.submissionDate).toLocaleDateString();
                    }
                    
                    // 1. Fetch the user's name
                    const userName = await fetchUserName(data.submittedBy);
                    
                    return {
                        id: doc.id,
                        submittedBy: data.submittedBy,
                        user: userName, // <-- NOW CONTAINS THE USER NAME
                        university: data.university,
                        department: data.department, 
                        date: displayDate,
                        status: data.status || 'pending_review',
                        deadline: data.deadline || 'N/A',
                        funding: data.funding || 'No Info',
                        submissionDate: data.submissionDate,

                        // --- MAPPING ADMINISTRATIVE FIELDS ---
                        appLink: data.appLink || 'N/A',
                        fundingAmount: data.fundingAmount || 'N/A',
                        greWaiver: data.greWaiver || 'N/A',
                        ieltsWaiver: data.ieltsWaiver || 'N/A',
                        appFeeWaiver: data.appFeeWaiver || 'N/A',
                        professors: data.professors || 'N/A',
                        requiredDocs: Array.isArray(data.requiredDocs) ? data.requiredDocs.join(', ') : (data.requiredDocs || 'N/A'),
                    } as ProgramRequest;
                });
                
                // Wait for all name fetches to complete
                const resolvedRequests = await Promise.all(fetchedRequestsPromises);

                setRequests(resolvedRequests);
                setIsLoading(false);
            }, 
            (err) => {
                console.error("Firebase Listener Error:", err);
                setError(`Failed to load requests from database: ${err.message}`);
                setIsLoading(false);
            }
        );

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchRequests();
        return () => unsubscribe();
    }, []); 

    // --- Action Handlers (Unchanged) ---

    // Function to handle opening the modal
    const handleDetailsClick = (request: ProgramRequest) => {
        setSelectedRequest(request);
    };

    // Function to handle closing the modal
    const handleCloseModal = () => {
        setSelectedRequest(null);
    };

    const updateRequestStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        // ... (Status update logic is unchanged, removed for brevity)
        if (!window.confirm(`Are you sure you want to set request ${id.substring(0, 5)}... status to '${newStatus}'?`)) {
            return;
        }

        if (!token) {
            alert('Error: Authentication token is missing. Please log in.');
            return;
        }

        try {
            const response = await fetch(`${PROGRAM_REQUESTS_ENDPOINT}/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'No further details.' }));
                throw new Error(`Failed to update status. Status: ${response.status}. ${errorBody.message}`);
            }
            
            alert(`Request status successfully updated to ${newStatus.toUpperCase()}.`);

        } catch (e) {
            alert(`Error updating status: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    const getStatusClasses = (status: ProgramRequest['status']) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending_review': default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    const getWaiverClasses = (status: string) => {
        if (status.toLowerCase() === 'yes') return 'bg-green-100 text-green-800';
        if (status.toLowerCase() === 'no') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };


    const handleApprove = (id: string) => updateRequestStatus(id, 'approved');
    const handleReject = (id: string) => updateRequestStatus(id, 'rejected');

    if (isLoading) {
        return <div className="text-center py-12 text-blue-500 font-semibold"><FaSpinner className="animate-spin inline mr-2" /> Fetching program suggestions...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600 font-medium border-l-4 border-red-500 p-4 bg-red-50 rounded-lg shadow-inner">
                <p>⚠️ Data Fetching Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button 
                    onClick={() => fetchRequests()} 
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center mx-auto"
                >
                    <FaSyncAlt className="mr-1" /> Try Refreshing
                </button>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No program suggestions found in the database.</p>
                <button 
                    onClick={() => fetchRequests()} 
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center mx-auto"
                >
                    <FaSyncAlt className="mr-1" /> Check Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-2xl font-semibold text-gray-700">Program Application Requests (Suggestions)</h2>
            </div>
            <p className="text-gray-600">Review, approve, or reject user-submitted program suggestions.</p>
            
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            {/* UPDATED: Column header changed to reflect Name/ID */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name / ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program / Dept</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding / Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waivers (App Fee)</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id.substring(0, 5) + '...'}</td>
                                {/* UPDATED: Displaying the full name, or ID as fallback */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span title={request.submittedBy}>
                                        {request.user.length > 20 ? request.user.substring(0, 17) + '...' : request.user}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{request.department}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{request.university}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{request.date}</td>
                                
                                {/* NEW DATA CELLS */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <span className="font-semibold capitalize">{request.funding.replace(' funded', '')}</span>
                                    <br/>
                                    <span className="text-xs text-gray-400">{request.fundingAmount}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWaiverClasses(request.appFeeWaiver)}`}>
                                        Fee: {request.appFeeWaiver}
                                    </span>
                                </td>
                                
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(request.status)}`}>
                                        {request.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                    {/* Updated Details button to open the modal */}
                                    <button 
                                        onClick={() => handleDetailsClick(request)}
                                        className="text-blue-600 hover:text-blue-900 px-1"
                                        title={`View details for ${request.id}`}
                                    >
                                        Details
                                    </button>
                                    {request.status === 'pending_review' ? (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(request.id)}
                                                className="text-green-600 hover:text-green-900 px-1"
                                                title="Approve suggestion"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleReject(request.id)}
                                                className="text-red-600 hover:text-red-900 px-1"
                                                title="Reject suggestion"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`text-xs italic ${request.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                                            {request.status.toUpperCase()}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render Modal conditionally */}
            {selectedRequest && (
                <ProgramDetailModal 
                    request={selectedRequest}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AdminProgramRequests;