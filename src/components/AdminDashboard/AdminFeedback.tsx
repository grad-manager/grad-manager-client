/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore'; 
import { db } from '../../firebase';
import { FaSpinner, FaSyncAlt, FaTimes, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa';

// --- Feedback Type ---
interface Feedback {
    id: string;
    userId: string;
    firstName?: string;
    email?: string;
    message: string;
    date: { seconds: number } | string | null;
    read: boolean; 
}

// --- Feedback Modal ---
interface FeedbackModalProps {
    feedback: Feedback;
    onClose: () => void;
    onMarkAsRead: (feedbackId: string) => Promise<void>; 
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedback, onClose, onMarkAsRead }) => {
    let displayDate = 'N/A';
    if ((feedback.date as any)?.seconds) {
        displayDate = new Date((feedback.date as any).seconds * 1000).toLocaleDateString();
    } else if (typeof feedback.date === 'string') {
        displayDate = new Date(feedback.date).toLocaleDateString();
    }

    const handleMarkAsRead = async () => {
        await onMarkAsRead(feedback.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
            {/* UPDATED: Added flex-col and max-h-[90vh] to the main container.
                Removed 'p-6' from here to apply it more granularly. 
            */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 flex flex-col max-h-[90vh]">
                
                {/* Header (Fixed) */}
                <div className="flex justify-between items-center border-b p-6 pb-3">
                    <h3 className="text-xl font-bold text-gray-800">Feedback ({feedback.id.substring(0, 8)}...)</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body (Scrollable) */}
                {/* UPDATED: Added flex-grow and overflow-y-auto to allow content scrolling 
                    while keeping header/footer visible.
                */}
                <div className="p-6 pt-4 flex-grow overflow-y-auto">
                    <div className="space-y-4">
                        <div className={`p-2 rounded-md font-semibold text-white text-center ${feedback.read ? 'bg-green-500' : 'bg-red-500'}`}>
                            {feedback.read ? <FaEnvelopeOpen className='inline mr-2' /> : <FaEnvelope className='inline mr-2' />}
                            Status: {feedback.read ? 'Read' : 'Unread'}
                        </div>
                        <p><strong>Name:</strong> {feedback.firstName || 'N/A'}</p>
                        <p><strong>Email:</strong> {feedback.email || 'N/A'}</p>
                        <p><strong>Date Submitted:</strong> {displayDate}</p>
                        
                        {/* Message Content */}
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                            <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
                        </div>
                    </div>
                </div>

                {/* Footer (Fixed) */}
                <div className="p-6 pt-4 border-t flex justify-between">
                    {!feedback.read && (
                        <button 
                            onClick={handleMarkAsRead} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                            <FaEnvelopeOpen className="mr-2" /> Mark as Read
                        </button>
                    )}
                    <button onClick={onClose} className="ml-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

interface AdminFeedbackProps {
    initialFeedbackId?: string;
}

// --- Admin Feedback Component ---
const AdminFeedback: React.FC<AdminFeedbackProps> = ({ initialFeedbackId }) => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

    // Function to update the 'read' status in Firestore
    const handleMarkAsRead = useCallback(async (feedbackId: string) => {
        try {
            await updateDoc(doc(db, 'userFeedback', feedbackId), {
                read: true,
            });
            setFeedbacks(prev => prev.map(f => 
                f.id === feedbackId ? { ...f, read: true } : f
            ));
        } catch (err) {
            console.error('Error marking feedback as read:', err);
        }
    }, []);


    // Fetch firstName from users collection if not in feedback
    const fetchFirstName = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return data?.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : 'N/A'; 
            }
            return 'N/A';
        } catch (err) {
            console.error('Error fetching firstName:', err);
            return 'N/A';
        }
    };

    const fetchFeedbacks = useCallback(() => {
        setError(null);
        setIsLoading(true);
        
        const feedbacksQuery = query(
            collection(db, 'userFeedback'),
            orderBy('submittedAt', 'desc') // Sort by newest first
        );

        const unsubscribe = onSnapshot(
            feedbacksQuery,
            async (snapshot) => {
                const fetchedPromises: Promise<Feedback>[] = snapshot.docs.map(async docSnap => {
                    const data = docSnap.data();
                    const userId = data.submittedBy;
                    const userFullName = data.firstName || (await fetchFirstName(userId));
                    
                    return {
                        id: docSnap.id,
                        userId: userId,
                        firstName: userFullName,
                        email: data.email,
                        message: data.feedback,
                        date: data.submittedAt,
                        read: data.read ?? false, 
                    } as Feedback;
                });

                let fetched: Feedback[] = await Promise.all(fetchedPromises);
                
                // Second-level sorting: Unread first (read: false)
                fetched.sort((a, b) => {
                    if (a.read === false && b.read === true) return -1; 
                    if (a.read === true && b.read === false) return 1;  
                    return 0; // maintain original date order
                });

                setFeedbacks(fetched);
                setIsLoading(false);
            },
            (err) => {
                console.error('Firebase Feedback Listener Error:', err);
                setError(err.message);
                setIsLoading(false);
            }
        );

        return unsubscribe;
    }, [handleMarkAsRead]);

    useEffect(() => {
        const unsubscribe = fetchFeedbacks();
        return () => unsubscribe();
    }, [fetchFeedbacks]);

    useEffect(() => {
        if (!initialFeedbackId || feedbacks.length === 0) return;
        const match = feedbacks.find((item) => item.id === initialFeedbackId);
        if (match) {
            setSelectedFeedback(match);
            if (!match.read) {
                handleMarkAsRead(match.id);
            }
        }
    }, [initialFeedbackId, feedbacks, handleMarkAsRead]);

    const handleDetailsClick = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        if (!feedback.read) {
            handleMarkAsRead(feedback.id);
        }
    };
    const handleCloseModal = () => setSelectedFeedback(null);

    // --- Render Logic ---

    if (isLoading) {
        return <div className="text-center py-12 text-blue-500 font-semibold"><FaSpinner className="animate-spin inline mr-2" /> Loading feedback...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600 font-medium">
                <p>⚠️ Error fetching feedback: {error}</p>
                <button onClick={() => fetchFeedbacks()} className="mt-3 text-blue-600 hover:text-blue-800 flex items-center mx-auto">
                    <FaSyncAlt className="mr-1" /> Retry
                </button>
            </div>
        );
    }

    if (feedbacks.length === 0) {
        return <div className="text-center py-12 text-gray-500">No feedback submitted yet.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                User Feedback 
                <span className="ml-3 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                    {feedbacks.filter(f => !f.read).length} Unread
                </span>
            </h2>
            <p className="text-gray-600">Read and review user thoughts or suggestions about the app. Sorted by Unread, then Date.</p>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {feedbacks.map(f => (
                            <tr key={f.id} className={`${!f.read ? 'bg-yellow-50 hover:bg-yellow-100 font-semibold' : 'hover:bg-gray-50'}`}>
                                <td className="px-4 py-4 text-center">
                                    {!f.read ? <FaEnvelope className="text-red-500" title="Unread" /> : <FaEnvelopeOpen className="text-green-500" title="Read" />}
                                </td>
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{f.id.substring(0, 5)}...</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{f.firstName}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{f.email || 'N/A'}</td>
                                <td className="px-4 py-4 text-sm text-gray-600 truncate max-w-xs">{f.message}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    {typeof f.date === 'string' ? new Date(f.date).toLocaleDateString() : (f.date as any)?.seconds ? new Date((f.date as any).seconds * 1000).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <button onClick={() => handleDetailsClick(f)} className="text-blue-600 hover:text-blue-900 px-2">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Feedback Modal */}
            {selectedFeedback && <FeedbackModal feedback={selectedFeedback} onClose={handleCloseModal} onMarkAsRead={handleMarkAsRead} />}
        </div>
    );
};

export default AdminFeedback;
