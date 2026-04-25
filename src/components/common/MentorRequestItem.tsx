import React from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MentorRequest {
    id: string;
    menteeName: string;
    menteeId: string;
    message: string;
    createdAt: string;
}

interface MentorRequestItemProps {
    request: MentorRequest;
    onAccept: (requestId: string) => void;
    onDecline: (requestId: string) => void;
}

const MentorRequestItem: React.FC<MentorRequestItemProps> = ({ request, onAccept, onDecline }) => {
    const handleAccept = (e: React.MouseEvent) => { e.stopPropagation(); onAccept(request.id); };
    const handleDecline = (e: React.MouseEvent) => { e.stopPropagation(); onDecline(request.id); };

    return (
        <div className="flex flex-col p-3 border-b border-gray-100 bg-yellow-50/50">
            <div className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3">
                    <UserPlus className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-800">
                        <span className="text-yellow-700">{request.menteeName}</span> requested mentorship.
                    </p>
                    <p className="text-xs text-gray-600 italic mt-0.5 line-clamp-2">
                        "{request.message}"
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-yellow-100">
                <button
                    onClick={handleAccept}
                    className="flex items-center text-xs px-2 py-1 rounded-full text-white bg-green-500 hover:bg-green-600 transition"
                >
                    <Check className="w-3 h-3 mr-1" /> Accept
                </button>
                <button
                    onClick={handleDecline}
                    className="flex items-center text-xs px-2 py-1 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                    <X className="w-3 h-3 mr-1" /> Decline
                </button>
            </div>
        </div>
    );
};

export default MentorRequestItem;
