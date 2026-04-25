/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FaTimes, FaCheck, FaBan } from 'react-icons/fa';
import { FaPenFancy } from 'react-icons/fa';

interface NotificationModalProps {
    notifications: any[];
    mentorRequests: any[];
    unreadCount: number;
    isLoading: boolean;
    onClose: () => void;
    onAcceptRequest?: (requestId: string) => void;
    onDeclineRequest?: (requestId: string) => void;
    userRole: string; // New prop for user role
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    notifications,
    mentorRequests,
    unreadCount,
    isLoading,
    onClose,
    onAcceptRequest,
    onDeclineRequest,
    userRole
}) => {
    const handleNotificationClick = (notification: any) => {
        // Example: If an admin gets a new SOP request, they can be redirected
        if (userRole === 'admin' && notification.type === 'sop_request_received') {
            // Redirect or open a new page to view the request details
            // window.location.href = `/admin/sop-requests/${notification.metadata?.requestId}`;
            console.log("Admin clicked on SOP request. Redirecting to view details.");
        }
    };

    const renderNotificationContent = (notification: any) => {
        // Logic to render different content based on notification type
        switch (notification.type) {
            case 'sop_request_received':
                if (userRole === 'admin') {
                    return (
                        <>
                            <p className="text-sm font-semibold text-gray-800 flex items-center">
                                <FaPenFancy className="mr-2 text-primary" />
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">A new SOP writing request is pending review.</p>
                            {/* Optional button to navigate to the admin SOP dashboard */}
                            {/* <button className="mt-2 text-blue-600 hover:underline text-sm">View Request</button> */}
                        </>
                    );
                }
                return <p className="text-sm font-semibold text-gray-800">{notification.message}</p>;

            case 'sop_request_status_update':
                return (
                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                        <FaPenFancy className="mr-2 text-green-500" />
                        {notification.message}
                    </p>
                );

            default:
                // Default rendering for generic messages
                return <p className="text-sm font-semibold text-gray-800">{notification.message}</p>;
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-gray-600 bg-opacity-40"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="fixed bottom-20 right-6 z-[70] w-[90%] sm:w-80 max-h-[70vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform scale-100 opacity-100"
            >
                <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white sticky top-0">
                    <h3 className="font-bold text-lg">Notifications ({unreadCount})</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : (
                        <>
                            {mentorRequests.length > 0 && (
                                <div className="p-2 bg-yellow-50 border-b">
                                    <h4 className="font-bold text-yellow-800">Pending Requests</h4>
                                    {mentorRequests.map(request => (
                                        <div key={request.id} className="p-3 my-2 bg-white border rounded-md shadow-sm flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Mentorship request from {request.menteeName}.
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {request.createdAt ? new Date(request.createdAt).toLocaleString() : ''}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => onAcceptRequest?.(request.id)}
                                                    className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                                                >
                                                    <FaCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDeclineRequest?.(request.id)}
                                                    className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <FaBan className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="p-2">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-gray-200 transition-all duration-200 cursor-pointer ${
                                                !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            {renderNotificationContent(notification)}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">No new notifications.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;