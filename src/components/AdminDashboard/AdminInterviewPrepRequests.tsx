// src/components/AdminDashboard/AdminInterviewPrepRequests.tsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import type { InterviewPrepRequest } from '../../types/InterviewPrepRequest';
import { FaCalendarCheck, FaComments, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AdminInterviewPrepRequests: React.FC = () => {
    const { token } = useAuth();
    const [requests, setRequests] = useState<InterviewPrepRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<InterviewPrepRequest | null>(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [scheduledDate, setScheduledDate] = useState(''); // NEW state
    const [scheduledTime, setScheduledTime] = useState(''); // NEW state
    const [zoomLink, setZoomLink] = useState(''); // NEW state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'interview_prep_requests'), (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as InterviewPrepRequest));
            setRequests(fetchedRequests);
        });

        return () => unsubscribe();
    }, []);

    const handleSendResponse = async (requestId: string) => {
        if (!adminResponse.trim() || !scheduledDate || !scheduledTime || !zoomLink) { // NEW validation
            setError('All fields (response, date, time, and Zoom link) are required.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const requestRef = doc(db, 'interview_prep_requests', requestId);
            await updateDoc(requestRef, {
                adminResponse: adminResponse,
                scheduledDate: scheduledDate, // NEW field
                scheduledTime: scheduledTime, // NEW field
                zoomLink: zoomLink, // NEW field
                status: 'scheduled',
                respondedAt: serverTimestamp(),
            });

            if (token) {
                await axios.post(`${API_URL}/admin/interview-prep/send-response`, {
                    requestId,
                    message: adminResponse,
                    scheduledDate, // NEW payload
                    scheduledTime, // NEW payload
                    zoomLink, // NEW payload
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            alert('Response sent successfully!');
            setSelectedRequest(null);
            setAdminResponse('');
            setScheduledDate(''); // Reset state
            setScheduledTime(''); // Reset state
            setZoomLink(''); // Reset state
        } catch (err) {
            console.error('Error sending response:', err);
            setError('Failed to send response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'scheduled': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Interview Prep Requests</h2>
            {requests.length === 0 ? (
                <p className="text-gray-500">No new interview prep requests.</p>
            ) : (
                <div className="space-y-4">
                    {requests.map(request => (
                        <div
                            key={request.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 
                                ${selectedRequest?.id === request.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}
                            onClick={() => setSelectedRequest(request)}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-gray-800">
                                    {request.schoolName} - {request.programName}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                    {request.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Requested by: {request.userEmail}</p>
                            <p className="text-sm text-gray-600 mt-1">Tentative Date: {request.interviewDate}</p>
                        </div>
                    ))}
                </div>
            )}

            {selectedRequest && (
                <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <FaCalendarCheck className="mr-2 text-blue-600" />
                        Details for {selectedRequest.schoolName}
                    </h3>
                    <p className="text-sm text-gray-700"><strong>User:</strong> {selectedRequest.userEmail}</p>
                    <p className="text-sm text-gray-700"><strong>Program:</strong> {selectedRequest.programName}</p>
                    <p className="text-sm text-gray-700"><strong>Tentative Interview Date:</strong> {selectedRequest.interviewDate}</p>
                    <p className="text-sm text-gray-700 mt-2"><strong>Notes:</strong> {selectedRequest.notes || 'N/A'}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-semibold flex items-center mb-2">
                            <FaComments className="mr-2 text-blue-600" />
                            Send a Response
                        </h4>
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        
                        {/* NEW Input Fields for Date, Time, and Zoom Link */}
                        <div className="space-y-4 mb-4">
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Scheduled Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Scheduled Time</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Zoom Link</label>
                                <input
                                    type="url"
                                    value={zoomLink}
                                    onChange={(e) => setZoomLink(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., https://zoom.us/j/1234567890"
                                    required
                                />
                            </div>
                        </div>

                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your response here..."
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                        ></textarea>
                        <button
                            onClick={() => selectedRequest.id && handleSendResponse(selectedRequest.id)}
                            disabled={loading}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Response</span>
                                    <FaPaperPlane />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInterviewPrepRequests;