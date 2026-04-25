/* eslint-disable no-irregular-whitespace */
import React from 'react';
import { 
    Mail, Calendar, CheckCircle, Heart, MessageSquare, Rss, User, Clock, FileText, Shield, 
    UserPlus, UserCheck, Megaphone
} from 'lucide-react'; 
import { formatDistanceToNow } from 'date-fns';

export type NotificationType = 
    'APPLICATION_UPDATE' | 'MESSAGE' | 'GENERAL' | 'POST_LIKE' | 'POST_COMMENT' |
    'CHAT_MESSAGE' | 'PROJECT_MESSAGE' | 'NEW_FEED_ITEM' |
    'CONNECTION_REQUEST' | 'CONNECTION_ACCEPTED' |
    'document_review_requested' |
    'cv_session_scheduled' | 'cv_review_complete' | 'cv_review_in_progress' |
    'document_review_complete' | 'mentorship_revoked' |
    'interview_prep_response' | 'visa_prep_response' | 'financial_support_response' |
    'admin_role_updated' | 'admin_profile_updated' | 'admin_user_deleted' | 'admin_new_feedback';

interface Notification {
    _id: string;
    type: NotificationType;
    message: string;
    read: boolean; 
    createdAt: string;
    relatedEntityId?: string;
}

interface NotificationItemProps {
    notification: Notification;
    onNavigate: (item: Notification) => void; 
}

const getIcon = (type: NotificationType) => {
    switch (type) {
        case 'APPLICATION_UPDATE': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'POST_LIKE': return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
        case 'POST_COMMENT': return <MessageSquare className="w-5 h-5 text-purple-500" />;
        case 'NEW_FEED_ITEM': return <Rss className="w-5 h-5 text-orange-500" />;
        case 'CHAT_MESSAGE': return <Mail className="w-5 h-5 text-blue-500" />;
        case 'PROJECT_MESSAGE': return <User className="w-5 h-5 text-indigo-500" />;
        case 'CONNECTION_REQUEST': return <UserPlus className="w-5 h-5 text-indigo-500" />;
        case 'CONNECTION_ACCEPTED': return <UserCheck className="w-5 h-5 text-green-600" />;
        case 'cv_session_scheduled':
        case 'interview_prep_response':
        case 'visa_prep_response':
        case 'financial_support_response': return <Calendar className="w-5 h-5 text-teal-600" />;
        case 'cv_review_complete':
        case 'document_review_complete': return <FileText className="w-5 h-5 text-lime-600" />;
        case 'document_review_requested': return <FileText className="w-5 h-5 text-blue-600" />;
        case 'cv_review_in_progress': return <Clock className="w-5 h-5 text-amber-500" />;
        case 'mentorship_revoked':
        case 'admin_role_updated':
        case 'admin_profile_updated': return <Shield className="w-5 h-5 text-red-600" />;
        case 'admin_user_deleted': return <User className="w-5 h-5 text-red-900" />;
        case 'admin_new_feedback': return <Megaphone className="w-5 h-5 text-pink-600 fill-pink-600" />;
        case 'GENERAL':
        default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onNavigate }) => {
    const handleClick = () => { onNavigate(notification); };

    return (
        <div 
            onClick={handleClick}
            className="flex items-start p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
        >
            <div className="flex-shrink-0 mt-1 mr-3">{getIcon(notification.type)}</div>
            <div className="flex-grow">
                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>
                    {notification.message}
                </p>
                <span className="text-xs text-gray-400 mt-0.5 block">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
            </div>
        </div>
    );
};

export default NotificationItem;
