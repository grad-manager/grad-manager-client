// src/components/AdminDashboard/AdminSOPRequests.tsx

import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaGraduationCap, FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaFileAlt, FaEnvelope, FaCalendarCheck, FaCalendarTimes, FaCalendarAlt, FaTimes } from 'react-icons/fa';

interface SOPRequest {
    id: string;
    applicationId: string;
    userId: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'rescheduled' | 'not completed';
    timestamp: string;
    declineReason?: string;
    acceptanceDetails?: {
        date: string;
        time: string;
        zoomLink: string;
        acceptedBy: string;
    };
    rescheduleDetails?: {
        newDate: string;
        newTime: string;
        reason?: string;
    };
    completionDetails?: {
        completedDate: string;
        notes?: string;
    };
    uncompletionReason?: string;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
}

const AdminSOPRequests: React.FC = () => {
    const [requests, setRequests] = useState<SOPRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [userCache, setUserCache] = useState<Record<string, UserProfile>>({});

    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showNotCompletedModal, setShowNotCompletedModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SOPRequest | null>(null);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        zoomLink: '',
        declineReason: '',
        newDate: '',
        newTime: '',
        rescheduleReason: '',
        notCompletedReason: '',
        completionNotes: '',
    });

    // Manages body overflow when modals are open
    useEffect(() => {
        if (showAcceptModal || showDeclineModal || showManageModal || showRescheduleModal || showNotCompletedModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAcceptModal, showDeclineModal, showManageModal, showRescheduleModal, showNotCompletedModal]);

    // Firestore listener for real-time requests
    // FIX APPLIED HERE: The dependency array is now empty ([]), breaking the infinite loop.
    // The inner logic uses a functional update for setUserCache to get the latest state.
    useEffect(() => {
        const q = query(collection(db, "sop_requests"));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const fetchedRequests: SOPRequest[] = [];
            const userIdsToFetch: string[] = [];

            querySnapshot.forEach((doc) => {
                const requestData = doc.data() as Omit<SOPRequest, 'id'>;
                fetchedRequests.push({
                    ...requestData,
                    id: doc.id,
                } as SOPRequest);

                // Note: The 'userCache' reference here is from the initial render's closure, 
                // but the final update uses the functional form for guaranteed accuracy.
                if (!userCache[requestData.userId] && !userIdsToFetch.includes(requestData.userId)) {
                    userIdsToFetch.push(requestData.userId);
                }
            });

            fetchedRequests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            if (userIdsToFetch.length > 0) {
                const userPromises = userIdsToFetch.map(userId => getDoc(doc(db, "users", userId)));
                const userDocs = await Promise.all(userPromises);
                
                // Functional state update: ensures merging into the latest cache state
                setUserCache(prevCache => {
                    const newCache: Record<string, UserProfile> = { ...prevCache };
                    userDocs.forEach(userDoc => {
                        if (userDoc.exists()) {
                            newCache[userDoc.id] = userDoc.data() as UserProfile;
                        }
                    });
                    return newCache;
                });
            }

            setRequests(fetchedRequests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching SOP requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // <-- FIX: Dependency array changed from [userCache] to []

    // Helper functions
    const getApplicationDetails = (applicationId: string) => `Application ID: ${applicationId}`;
    const getUserName = (userId: string) => userCache[userId] ? `${userCache[userId].firstName} ${userCache[userId].lastName}` : 'Loading...';
    const getUserEmail = (userId: string) => userCache[userId] ? userCache[userId].email : null; // Modified to return null if not found

    // Modal handlers
    const handleAcceptClick = (request: SOPRequest) => {
        setSelectedRequest(request);
        setShowAcceptModal(true);
    };

    const handleDeclineClick = (request: SOPRequest) => {
        setSelectedRequest(request);
        setShowDeclineModal(true);
    };

    const handleManageSessionClick = (request: SOPRequest) => {
        setSelectedRequest(request);
        setShowManageModal(true);
    };

    const handleRescheduleClick = () => {
        setShowManageModal(false);
        setShowRescheduleModal(true);
    };

    const handleNotCompletedClick = () => {
        setShowManageModal(false);
        setShowNotCompletedModal(true);
    };

    const handleModalClose = () => {
        setShowAcceptModal(false);
        setShowDeclineModal(false);
        setShowManageModal(false);
        setShowRescheduleModal(false);
        setShowNotCompletedModal(false);
        setSelectedRequest(null);
        setFormData({
            date: '',
            time: '',
            zoomLink: '',
            declineReason: '',
            newDate: '',
            newTime: '',
            rescheduleReason: '',
            notCompletedReason: '',
            completionNotes: '',
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form submission handlers
    const handleAcceptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        try {
            const requestDocRef = doc(db, 'sop_requests', selectedRequest.id);
            await updateDoc(requestDocRef, {
                status: 'accepted',
                acceptanceDetails: {
                    date: formData.date,
                    time: formData.time,
                    zoomLink: formData.zoomLink,
                    acceptedBy: 'adminIdHere'
                }
            });
            console.log("Request accepted and updated in Firestore.");
            handleModalClose();
        } catch (error) {
            console.error("Error updating request status:", error);
        }
    };

    const handleDeclineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        try {
            const requestDocRef = doc(db, 'sop_requests', selectedRequest.id);
            await updateDoc(requestDocRef, {
                status: 'declined',
                declineReason: formData.declineReason || 'No reason provided.'
            });
            console.log("Request declined and updated in Firestore.");
            handleModalClose();
        } catch (error) {
            console.error("Error declining request:", error);
        }
    };

    const handleCompleteSession = async () => {
        if (!selectedRequest) return;
        try {
            const requestDocRef = doc(db, 'sop_requests', selectedRequest.id);
            await updateDoc(requestDocRef, {
                status: 'completed',
                completionDetails: {
                    completedDate: new Date().toISOString(),
                    notes: formData.completionNotes,
                },
            });
            console.log("Session marked as completed.");
            handleModalClose();
        } catch (error) {
            console.error("Error updating session status:", error);
        }
    };

    const handleRescheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        try {
            const requestDocRef = doc(db, 'sop_requests', selectedRequest.id);
            await updateDoc(requestDocRef, {
                status: 'rescheduled',
                rescheduleDetails: {
                    newDate: formData.newDate,
                    newTime: formData.newTime,
                    reason: formData.rescheduleReason,
                },
            });
            console.log("Session rescheduled.");
            handleModalClose();
        } catch (error) {
            console.error("Error rescheduling session:", error);
        }
    };

    const handleNotCompletedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        try {
            const requestDocRef = doc(db, 'sop_requests', selectedRequest.id);
            await updateDoc(requestDocRef, {
                status: 'not completed',
                uncompletionReason: formData.notCompletedReason,
            });
            console.log("Session marked as not completed.");
            handleModalClose();
        } catch (error) {
            console.error("Error updating session status:", error);
        }
    };


    // Main component render logic
    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <FaSpinner className="animate-spin text-3xl text-blue-500" />
                <span className="ml-3 text-gray-600">Loading requests...</span>
            </div>
        );
    }

    return (
        <div>
            {requests.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-lg">
                    <p className="font-semibold">No new SOP requests at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map((request) => {
                        const userEmail = getUserEmail(request.userId);
                        return (
                            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-center space-x-3 mb-2">
                                    <FaFileAlt className="text-xl text-blue-500" />
                                    <h3 className="font-bold text-lg text-gray-800">SOP Request</h3>
                                </div>
                                <p className="text-gray-700"><FaGraduationCap className="inline mr-2 text-gray-500" /><strong>Application:</strong> {getApplicationDetails(request.applicationId)}</p>
                                <p className="text-gray-700 mt-1"><FaUser className="inline mr-2 text-gray-500" /><strong>User:</strong> {getUserName(request.userId)}</p>
                                <p className="text-gray-700 mt-1"><FaEnvelope className="inline mr-2 text-gray-500" /><strong>Email:</strong> {userEmail ? (
                                    <a href={`mailto:${userEmail}`} className="text-blue-500 hover:underline">
                                        {userEmail}
                                    </a>
                                ) : 'Loading...'}</p>
                                <p className="text-gray-700 mt-1"><FaClock className="inline mr-2 text-gray-500" /><strong>Requested On:</strong> {new Date(request.timestamp).toLocaleDateString()}</p>
                                
                                <div className="mt-4 flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rescheduled' ? 'bg-blue-100 text-blue-800' :
                                        request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                    {request.status === 'pending' && (
                                        <>
                                            <button
                                                className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                                                onClick={() => handleAcceptClick(request)}
                                            >
                                                <FaCheckCircle className="inline mr-1" /> Accept
                                            </button>
                                            <button
                                                className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                                onClick={() => handleDeclineClick(request)}
                                            >
                                                <FaTimesCircle className="inline mr-1" /> Decline
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'accepted' && (
                                        <button
                                            className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                                            onClick={() => handleManageSessionClick(request)}
                                        >
                                            <FaFileAlt className="inline mr-1" /> Manage Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Accept Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto my-auto">
                        <button onClick={handleModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><FaTimes className="text-2xl" /></button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Accept SOP Request</h3>
                        <p className="text-gray-600 mb-4">Please provide the details for the live writing session.</p>
                        <form onSubmit={handleAcceptSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    id="date"
                                    value={formData.date}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="time">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    id="time"
                                    value={formData.time}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="zoomLink">Zoom Link</label>
                                <input
                                    type="url"
                                    name="zoomLink"
                                    id="zoomLink"
                                    value={formData.zoomLink}
                                    onChange={handleFormChange}
                                    placeholder="e.g., https://zoom.us/j/1234567890"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
                                >
                                    Confirm Acceptance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Decline Modal */}
            {showDeclineModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto my-auto">
                        <button onClick={handleModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><FaTimes className="text-2xl" /></button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Decline SOP Request</h3>
                        <p className="text-gray-600 mb-4">Are you sure you want to decline this request? You can provide a reason below.</p>
                        <form onSubmit={handleDeclineSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="declineReason">Reason for Decline (Optional)</label>
                                <textarea
                                    name="declineReason"
                                    id="declineReason"
                                    rows={4}
                                    value={formData.declineReason}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="e.g., 'Due to high volume, we are currently unable to accept new requests.'"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:shadow-outline"
                                >
                                    Confirm Decline
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Session Modal */}
            {showManageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto my-auto">
                        <button onClick={handleModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><FaTimes className="text-2xl" /></button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Manage Session</h3>
                        <p className="text-gray-600 mb-6">Update the status of this live writing session.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={handleCompleteSession}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FaCalendarCheck /> <span>Completed</span>
                            </button>
                            <button
                                onClick={handleRescheduleClick}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <FaCalendarAlt /> <span>Reschedule</span>
                            </button>
                            <button
                                onClick={handleNotCompletedClick}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                <FaCalendarTimes /> <span>Not Completed</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto my-auto">
                        <button onClick={handleModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><FaTimes className="text-2xl" /></button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Reschedule Session</h3>
                        <p className="text-gray-600 mb-4">Enter the new date, time, and reason for rescheduling.</p>
                        <form onSubmit={handleRescheduleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="newDate">New Date</label>
                                <input
                                    type="date"
                                    name="newDate"
                                    id="newDate"
                                    value={formData.newDate}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="newTime">New Time</label>
                                <input
                                    type="time"
                                    name="newTime"
                                    id="newTime"
                                    value={formData.newTime}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="rescheduleReason">Reason (Optional)</label>
                                <textarea
                                    name="rescheduleReason"
                                    id="rescheduleReason"
                                    rows={3}
                                    value={formData.rescheduleReason}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="e.g., 'Due to a conflict, we need to move the session.'"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline"
                                >
                                    Confirm Reschedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Not Completed Modal */}
            {showNotCompletedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto my-auto">
                        <button onClick={handleModalClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><FaTimes className="text-2xl" /></button>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Session Not Completed</h3>
                        <p className="text-gray-600 mb-4">Please provide a reason why the session was not completed.</p>
                        <form onSubmit={handleNotCompletedSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="notCompletedReason">Reason</label>
                                <textarea
                                    name="notCompletedReason"
                                    id="notCompletedReason"
                                    rows={4}
                                    value={formData.notCompletedReason}
                                    onChange={handleFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    placeholder="e.g., 'The user did not attend the scheduled session.'"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 focus:outline-none focus:shadow-outline"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSOPRequests;