// src/components/MentorshipStatusList.tsx

import React from 'react';
import { FaUserPlus, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaUsers } from 'react-icons/fa';
// NOTE: toast and axios are no longer needed since handleRevokeRequest is removed.
// import { toast } from 'react-toastify'; 
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL; // No longer needed

interface MentorRequest {
    id: string;
    mentorId: string;
    mentorName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

interface MentorshipStatusListProps {
    requests: MentorRequest[];
    hasActiveRequest: boolean;
    onFindMentor: () => void;
    refetchRequests: () => Promise<void>; // Kept this for future potential use, but not strictly needed without revoke
}

const MentorshipStatusList: React.FC<MentorshipStatusListProps> = ({ 
    requests, 
    hasActiveRequest, 
    onFindMentor,
    // refetchRequests // Destructure removal for handleRevokeRequest
}) => {
    // const { token } = useAuth(); // No longer needed

    // --- REMOVED: handleRevokeRequest function ---

    const renderConnectionStatus = (status: MentorRequest['status']) => {
        switch (status) {
            case 'accepted':
                return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full flex items-center"><FaCheckCircle className="mr-1" /> Accepted</span>;
            case 'pending':
                return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full flex items-center"><FaHourglassHalf className="mr-1" /> Pending</span>;
            case 'declined':
                return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full flex items-center"><FaTimesCircle className="mr-1" /> Declined</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <FaUsers className="mr-3 text-blue-600" />
                    My Current Requests & Connections
                </h3>
                {/* Only show the Find Mentor button if there is NO active request */}
                {!hasActiveRequest && (
                    <button
                        onClick={onFindMentor}
                        className="flex items-center space-x-2 py-2 px-4 rounded-full font-semibold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                        <FaUserPlus />
                        <span>Find a Mentor</span>
                    </button>
                )}
            </div>

            <p className="text-gray-600 mb-6">
                {hasActiveRequest 
                    ? "You currently have an active request or connection. You must resolve it before requesting a new mentor."
                    : "You can find and request a new mentor below."}
            </p>

            <ul className="divide-y divide-gray-200">
                {requests.length > 0 ? (
                    requests.map(request => (
                        <li key={request.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">
                                    Mentor: {request.mentorName}
                                </p>
                                <div className="text-sm text-gray-500 mt-1">
                                    Request Date: {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                                {renderConnectionStatus(request.status)}
                                {/* --- REMOVED: Revoke button conditional rendering block --- */}
                            </div>
                        </li>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No requests or connections found. Click "Find a Mentor" to start your journey!
                    </div>
                )}
            </ul>
        </div>
    );
};

export default MentorshipStatusList;