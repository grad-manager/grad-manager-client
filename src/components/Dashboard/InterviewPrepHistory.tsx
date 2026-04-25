/* eslint-disable no-irregular-whitespace */
// src/components/Dashboard/InterviewPrepHistory.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import type { InterviewPrepRequest } from '../../types/InterviewPrepRequest';
import { FaTimes, FaExternalLinkAlt, FaCalendarCheck, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface InterviewPrepHistoryProps {
    onClose: () => void;
    title: string; // New prop for generic title
    type: 'admission' | 'visa'; // New prop to filter history if necessary
}

// FIX: Destructure all props, especially the new 'title'
const InterviewPrepHistory: React.FC<InterviewPrepHistoryProps> = ({ onClose, title }) => {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState<InterviewPrepRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<InterviewPrepRequest | null>(null);

    useEffect(() => {
        if (!currentUser) {
            setError('Please log in to view your history.');
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'interview_prep_requests'),
            where('userId', '==', currentUser.uid),
            orderBy('requestedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as InterviewPrepRequest));
            setRequests(fetchedRequests);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching interview prep history:', err);
            setError('Failed to load history. Please try again.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <FaClock className="text-yellow-500" />;
            case 'scheduled': return <FaCalendarCheck className="text-green-500" />;
            case 'complete': return <FaCheckCircle className="text-blue-500" />;
            case 'cancelled': return <FaExclamationCircle className="text-red-500" />;
            default: return null;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading history...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 animate-slide-up-fade h-fit max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                {/* FIX: Use the new title prop here */}
                <h2 className="text-3xl font-extrabold text-gray-800">{title}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
                >
                    <FaTimes />
                </button>
            </div>
            
            {!selectedRequest ? (
                requests.length === 0 ? (
                    <p className="text-gray-500 text-center">You have no interview prep requests yet.</p>
                ) : (
                    <div className="space-y-4">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => setSelectedRequest(request)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-lg">{request.schoolName} - {request.programName}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        {getStatusIcon(request.status)}
                                        <span>{request.status.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Requested on: {new Date(request.requestedAt.toDate()).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="space-y-4">
                    <button onClick={() => setSelectedRequest(null)} className="flex items-center text-blue-600 hover:underline mb-4">
                        <FaExternalLinkAlt className="rotate-180 mr-2" /> Back to History
                    </button>
                    
                    <h3 className="text-2xl font-bold mb-2">{selectedRequest.schoolName} - {selectedRequest.programName}</h3>
                    <p className="text-gray-600">Requested on: {new Date(selectedRequest.requestedAt.toDate()).toLocaleString()}</p>
                    <p className="font-semibold mt-4">Your Notes:</p>
                    <p className="bg-gray-100 p-3 rounded-md text-gray-700">{selectedRequest.notes || 'N/A'}</p>
                    
                    {selectedRequest.adminResponse && (
                        <div className="bg-green-50 p-4 rounded-lg mt-4 border border-green-200">
                            <p className="font-semibold text-green-800">Admin Response:</p>
                            <p className="mt-2 text-green-700">{selectedRequest.adminResponse}</p>
                            <div className="mt-4 border-t border-green-300 pt-3">
                                <p className="text-sm font-semibold text-green-800">Scheduled Session Details:</p>
                                <p className="text-sm text-green-700"><strong>Date:</strong> {selectedRequest.scheduledDate}</p>
                                <p className="text-sm text-green-700"><strong>Time:</strong> {selectedRequest.scheduledTime}</p>
                                <p className="text-sm text-green-700">
                                    <strong>Zoom Link:</strong> 
                                    <a href={selectedRequest.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                        {selectedRequest.zoomLink}
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InterviewPrepHistory;