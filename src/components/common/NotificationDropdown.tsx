/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from 'react'; 
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import NotificationItem from './NotificationItem'; 
import MentorRequestItem from './MentorRequestItem'; 

type NotificationType = string; 

interface Notification {
    _id: string;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: string;
    relatedEntityId?: string; 
    url?: string; 
}

interface MentorRequest {
    id: string;
    menteeName: string;
    menteeId: string;
    message: string;
    createdAt: string;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    mentorRequests: MentorRequest[];
    isLoading: boolean;
    onAcceptRequest: (requestId: string) => void;
    onDeclineRequest: (requestId: string) => void;
    userRole: string;
    onClose: () => void;
    onMarkAsRead: (notificationId: string) => void;
}

const DropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    notifications,
    mentorRequests,
    isLoading,
    onAcceptRequest,
    onDeclineRequest,
    userRole,
    onClose, 
    onMarkAsRead, 
}) => {
    const navigate = useNavigate();

    const allItems = [
        ...(userRole === 'mentor' ? mentorRequests : []).map(req => ({ ...req, isRequest: true })),
        ...notifications.map(notif => ({ ...notif, isRequest: false }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleNotificationClick = useCallback((item: Notification) => {
        if (!item.read) onMarkAsRead(item._id);

        let path = '';
        const entityId = item.relatedEntityId;

        if (item.url) path = item.url;
        else if (!entityId) path = '/notifications';
        else {
            switch (item.type) {
                case 'POST_LIKE':
                case 'POST_COMMENT':
                case 'NEW_FEED_ITEM':
                    path = `/community/${entityId}`; break;
                case 'CHAT_MESSAGE':
                    path = `/chat/${entityId}`; break;
                case 'PROJECT_MESSAGE':
                    path = `/projects/${entityId}`; break;
                case 'APPLICATION_UPDATE':
                    path = `/applications/${entityId}`; break;
                case 'CONNECTION_REQUEST':
                    path = '/connections?tab=pending'; break;
                case 'CONNECTION_ACCEPTED':
                    path = `/profile/${entityId}`; break;
                case 'cv_session_scheduled':
                case 'cv_review_complete':
                case 'cv_review_in_progress':
                    path = '/services/cv-review'; break;
                case 'document_review_complete':
                case 'document_review_requested':
                    path = '/applications/documents'; break;
                case 'mentorship_revoked':
                case 'admin_role_updated':
                case 'admin_profile_updated':
                    path = '/profile'; break;
                case 'interview_prep_response':
                    path = '/interview-prep'; break;
                case 'visa_prep_response':
                    path = '/services/visa-prep'; break;
                case 'financial_support_response':
                    path = '/services/financial-support'; break;
                case 'admin_user_deleted':
                    path = '/notifications'; break;
                case 'admin_new_feedback':
                    path = `/admin?tab=userFeedback&feedbackId=${entityId}`; break;
                case 'GENERAL':
                default:
                    path = '/';
            }
        }

        if (path && path !== '/notifications') navigate(path);
        onClose();
    }, [navigate, onClose, onMarkAsRead]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={DropdownVariants}
            className="
                absolute right-0 mt-3 w-80 max-h-[80vh] 
                overflow-y-auto origin-top-right 
                bg-white border border-gray-200 
                rounded-xl shadow-xl z-50 ring-1 ring-black ring-opacity-5
                sm:w-96
                xs:left-1/2 xs:-translate-x-1/2 xs:top-16 xs:w-[90%] xs:max-h-[70vh]
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
            "
        >
            <div className="py-2">
                <h3 className="text-lg font-bold text-gray-800 px-4 pt-1 pb-2 border-b border-gray-100">
                    Notifications
                </h3>

                {isLoading && (
                    <div className="flex justify-center items-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="ml-2 text-sm text-gray-600">Loading...</span>
                    </div>
                )}

                {!isLoading && allItems.length === 0 && (
                    <p className="text-gray-500 text-sm p-4 text-center">
                        You're all caught up! No new notifications.
                    </p>
                )}

                {!isLoading && allItems.map((item: any) => (
                    <React.Fragment key={item._id}>
                        {item.isRequest ? (
                            <MentorRequestItem 
                                request={item} 
                                onAccept={onAcceptRequest}
                                onDecline={onDeclineRequest}
                            />
                        ) : (
                            <NotificationItem 
                                notification={item} 
                                onNavigate={handleNotificationClick} 
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="p-2 border-t border-gray-100">
                <button 
                    onClick={() => { navigate('/notifications'); onClose(); }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                >
                    View All
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;
