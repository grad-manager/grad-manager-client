// src/components/Dashboard/DashboardHeader.tsx

import React from 'react';
import { FaCalendarPlus, FaCommentAlt } from 'react-icons/fa';

interface DashboardHeaderProps {
    displayName: string;
    handleCalendarSync: () => void;
    setIsFeedbackOpen: (isOpen: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ displayName, handleCalendarSync, setIsFeedbackOpen }) => (
    // Removed fixed, top-0, left-0, right-0, and z-40
    <header className="bg-white shadow-md rounded-2xl p-4 sm:p-6 md:p-6 mb-6">
        <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Hi, {displayName}! 👋
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                    onClick={handleCalendarSync}
                    className="p-2 sm:p-3 rounded-full text-blue-600 hover:bg-gray-200 transition-colors"
                    title="Sync with Calendar"
                >
                    <FaCalendarPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className="p-2 sm:p-3 rounded-full text-blue-600 hover:bg-gray-200 transition-colors"
                    title="Give Feedback"
                >
                    <FaCommentAlt className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
            </div>
        </div>
    </header>
);

export default DashboardHeader;