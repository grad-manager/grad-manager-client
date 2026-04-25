/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaUniversity, FaDollarSign, FaComments, FaCalendar, FaClock, FaLink } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

interface FinancialSupportHistoryProps {
    onClose: () => void;
}

interface FinancialSupportRequest {
    id: string;
    userId: string;
    userEmail: string;
    applicationId: string;
    universityName: string;
    requestedAmount: number;
    notes: string;
    status: 'pending' | 'scheduled' | 'declined';
    requestedAt: any; // Firestore Timestamp
    adminResponse?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    zoomLink?: string;
}

const FinancialSupportHistory: React.FC<FinancialSupportHistoryProps> = () => {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState<FinancialSupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'financial_support_requests'),
            where('userId', '==', currentUser.uid),
            orderBy('requestedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FinancialSupportRequest[];
            setRequests(fetchedRequests);
            setLoading(false);
        }, (err) => {
            console.error("Failed to fetch financial support history:", err);
            setError("Failed to load history. Please try again.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'scheduled': return 'bg-green-100 text-green-800';
            case 'declined': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 animate-slide-up-fade h-fit max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-800">Financial Support History</h2>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : requests.length === 0 ? (
                <p className="text-gray-500 text-center">You have not submitted any financial support requests yet.</p>
            ) : (
                <div className="space-y-6">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                                    <FaUniversity className="mr-2 text-gray-600" />
                                    {request.universityName}
                                </h3>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                                <FaDollarSign className="inline mr-1" /> Requested Amount: <span className="font-bold">${request.requestedAmount}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                                Requested on: {request.requestedAt.toDate().toLocaleString()}
                            </p>

                            {request.adminResponse && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="font-bold text-gray-700 flex items-center mb-2">
                                        <FaComments className="mr-2" /> Admin's Response
                                    </h4>
                                    <p className="text-sm text-gray-600">{request.adminResponse}</p>
                                </div>
                            )}

                            {request.status === 'scheduled' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                    <p className="text-sm text-gray-700">
                                        <FaCalendar className="inline mr-2" />
                                        <strong>Scheduled Date:</strong> {request.scheduledDate}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <FaClock className="inline mr-2" />
                                        <strong>Scheduled Time:</strong> {request.scheduledTime}
                                    </p>
                                    <p className="text-sm text-blue-600 hover:underline">
                                        <FaLink className="inline mr-2" />
                                        <a href={request.zoomLink} target="_blank" rel="noopener noreferrer">Join Zoom Meeting</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FinancialSupportHistory;