/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ApplicationCard.tsx
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import type { Application } from '../types/Application';
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaEllipsisV, FaEye, FaArrowsAltH, FaChevronRight } from 'react-icons/fa'; // FaGripLines removed

interface ApplicationCardProps {
    application: Application;
    onViewDetailsModal: (application: Application) => void;
    onEditApplicationModal: (application: Application) => void; 
    onViewDashboardSections: (application: Application) => void;
    isDragging: boolean;
    // The dragHandleProps are still required, but we'll apply them to the whole card
    dragHandleProps?: any; 
    draggableProps?: any;
    // Handler for click-based status change
    onStatusChangeClick: (applicationId: string | number, newStatus: string) => void;
}

const getStatusBgClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'bg-green-100 text-green-700';
        case 'Rejected':
            return 'bg-red-100 text-red-700';
        case 'Submitted':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const getStatusBorderClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'border-green-500';
        case 'Rejected':
            return 'border-red-500';
        case 'Submitted':
            return 'border-blue-500';
        default:
            return 'border-gray-500';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Accepted':
            return <FaCheckCircle className="text-green-500" />;
        case 'Rejected':
            return <FaTimesCircle className="text-red-500" />;
        case 'Submitted':
            return <FaPaperPlane className="text-blue-500" />;
        default:
            return <FaGraduationCap className="text-gray-500" />;
    }
};

// Define all possible statuses for the "Move to" menu (must match ApplicationTrackerPage)
const ALL_STATUSES = ["Interested", "Submitted", "Accepted", "Rejected"];

const ApplicationCard = forwardRef<HTMLDivElement, ApplicationCardProps>(
    ({ application, onViewDetailsModal, onStatusChangeClick, isDragging, dragHandleProps, draggableProps }, ref) => {
        const [isMenuOpen, setIsMenuOpen] = useState(false);
        const [isMoveSubMenuOpen, setIsMoveSubMenuOpen] = useState(false); 
        const menuRef = useRef<HTMLDivElement>(null);

        // Reset sub-menu state when main menu closes
        useEffect(() => {
            if (!isMenuOpen) {
                setIsMoveSubMenuOpen(false);
            }
        }, [isMenuOpen]);

        useEffect(() => {
            const handleOutsideClick = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    setIsMenuOpen(false);
                }
            };

            document.addEventListener('mousedown', handleOutsideClick);
            return () => {
                document.removeEventListener('mousedown', handleOutsideClick);
            };
        }, []);

        const handleMenuToggle = (event: React.MouseEvent) => {
            event.stopPropagation();
            setIsMenuOpen(prev => !prev);
        };

        const handleViewDetails = (event: React.MouseEvent) => {
            event.stopPropagation();
            onViewDetailsModal(application);
            setIsMenuOpen(false);
        };
        
        // Handler for changing status via button click
        const handleStatusChange = (newStatus: string) => (event: React.MouseEvent) => {
            event.stopPropagation();
            if (application._id) {
                onStatusChangeClick(application._id, newStatus);
            }
            setIsMenuOpen(false); // Close both menus
        };

        // Handler to toggle the Move sub-menu
        const handleMoveToClick = (event: React.MouseEvent) => {
            event.stopPropagation();
            setIsMoveSubMenuOpen(prev => !prev);
        };

        const otherStatuses = ALL_STATUSES.filter(s => s !== application.status);


        return (
            <div
                ref={ref}
                {...draggableProps}
                {...dragHandleProps} 
                className={`
                    relative bg-white rounded-xl p-5 border-l-4
                    shadow-md transition-all duration-300
                    hover:shadow-lg
                    ${isDragging ? 'shadow-xl scale-105 opacity-80' : 'cursor-grab'} {/* 🔑 Added cursor-grab */}
                    ${getStatusBorderClass(application.status)}
                `}
            >
                {/* Menu Toggle on the top right */}
                <div className="absolute top-2 right-2">
                    <button onClick={handleMenuToggle} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <FaEllipsisV />
                    </button>
                </div>
                
                {/* Card Content (Cleaned up) */}
                <div className="flex justify-between items-start mb-4 pr-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{application.schoolName}</h3>
                        <p className="text-gray-600 text-sm mt-1">{application.programName}</p>
                    </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex-shrink-0">
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBgClass(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span>{application.status}</span>
                    </span>
                </div>
                
                {/* Action Menu (MODIFIED for sub-menu) */}
                {isMenuOpen && (
                    <div ref={menuRef} className="absolute top-10 right-2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                        <button
                            onClick={handleViewDetails}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <FaEye className="mr-2 text-indigo-400" /> View Details
                        </button>

                        {/* Move To Sub-Menu Button */}
                        {otherStatuses.length > 0 && (
                            <div className="relative">
                                <button
                                    onClick={handleMoveToClick}
                                    className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-t border-gray-100"
                                >
                                    <span className="flex items-center">
                                        <FaArrowsAltH className="mr-2 text-indigo-400" /> Move to...
                                    </span>
                                    <FaChevronRight className="text-xs text-gray-400" />
                                </button>

                                {isMoveSubMenuOpen && (
                                    <div className="absolute top-0 right-full mr-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30"> {/* Adjusted position */}
                                        {otherStatuses.map(status => (
                                            <button
                                                key={status}
                                                onClick={handleStatusChange(status)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

ApplicationCard.displayName = 'ApplicationCard';

export default ApplicationCard;