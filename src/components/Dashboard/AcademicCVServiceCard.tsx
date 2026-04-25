import React from 'react';
import { FaFileAlt, FaCalendarAlt, FaDownload, FaVideo } from 'react-icons/fa';

interface AcademicCVServiceCardProps {
    onRequestCVService: () => void;
    requestStatus: 'pending' | 'scheduled' | 'completed' | 'none';
    scheduledDate?: string;
    scheduledTime?: string;
    zoomLink?: string;
    downloadUrl?: string;
}

const AcademicCVServiceCard: React.FC<AcademicCVServiceCardProps> = ({
    onRequestCVService,
    requestStatus,
    scheduledDate,
    scheduledTime,
    zoomLink,
    downloadUrl,
}) => {

    const renderContent = () => {
        switch (requestStatus) {
            case 'pending':
                return (
                    <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                        <FaFileAlt className="animate-pulse text-yellow-500" />
                        <span>Request submitted. An admin will contact you shortly.</span>
                    </div>
                );
            case 'scheduled':
                return (
                    <div className="flex flex-col space-y-2 text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span className="font-semibold">Scheduled:</span>
                            <span>{scheduledDate ? `${scheduledDate} at ${scheduledTime}` : 'Date to be confirmed'}</span>
                        </div>
                        {zoomLink && (
                            <a
                                href={zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-blue-600 hover:underline font-semibold"
                            >
                                <FaVideo />
                                <span>Join Zoom Meeting</span>
                            </a>
                        )}
                    </div>
                );
            case 'completed':
                return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                            <FaDownload className="text-green-500" />
                            <span className="font-semibold text-green-700">Your CV is ready!</span>
                        </div>
                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-green-700 transition-colors"
                            >
                                Download CV
                            </a>
                        )}
                    </div>
                );
            default: // 'none'
                return (
                    <button
                        onClick={onRequestCVService}
                        className="bg-primary text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 w-full sm:w-auto"
                    >
                        <span>Request Service</span>
                        <FaFileAlt />
                    </button>
                );
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mt-6 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 transform hover:scale-[1.01]">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-bold text-secondary flex items-center">
                    <FaFileAlt className="mr-2 text-primary" /> Academic CV Writing Service
                </h3>
                <p className="text-primary mt-1 text-sm sm:text-base">
                    Request a professional review and writing service for your Academic CV.
                </p>
            </div>
            <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default AcademicCVServiceCard;
