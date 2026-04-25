// src/pages/ApplicationTrackerPage.tsx
import React from "react";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { Application } from "../types/Application";
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DropResult,
} from "@hello-pangea/dnd";
import { 
    FaArrowLeft, 
    FaFolderOpen, 
    FaFolder, 
    FaGraduationCap, 
    FaScroll, 
    FaSyncAlt, 
} from "react-icons/fa";
import ApplicationCard from "../components/ApplicationCard";
import { useModal } from "../context/ModalContext";
import { getEffectivePlanLower } from "../utils/trial";
import TrialBanner from "../components/TrialBanner";

// 🟢 FIX: Simplified ApplicationTrackerPageProps interface.
interface ApplicationTrackerPageProps {
    applications: Application[];
    onApplicationStatusChange: (result: DropResult) => void;
    // This is the only additional handler needed from the parent (to refresh data after modal interaction)
    onRefreshApplications: () => void; 
}

const statusColumns = ["Interested", "Submitted", "Accepted", "Rejected"];
const INTERESTED_COLUMN = "Interested";

const APPLICATION_LIMITS: Record<string, number> = {
    free: 2,
    pro: Number.POSITIVE_INFINITY,
};

const ApplicationTrackerPage: React.FC<ApplicationTrackerPageProps> = ({
    applications = [],
    onApplicationStatusChange,
}) => {
    const { userProfile } = useAuth();
    const userPlan = getEffectivePlanLower(userProfile);
    // Use the actual applications array length as the current count (more accurate and real-time)
    const currentApplicationCount = applications.length;
    const maxApplications = APPLICATION_LIMITS[userPlan] ?? 2;
    const maxApplicationsDisplay = maxApplications === Number.POSITIVE_INFINITY ? 'Unlimited' : maxApplications;
    // USE the actual modal context for reliable modal opening
    const { openModal } = useModal(); 

    // Define the real handler using the context function
    const handleViewDetailsModal = (application: Application) => {
        openModal("applicationDetailModal", { application }); 
    };

    // Define the real handler for editing using the context function
    const handleEditApplicationModal = (application: Application) => {
        openModal("editApplicationModal", { application }); 
    };
    
    // 1. UPDATED HANDLER: Opens the Add Application Modal and passes the API refresh function
    
    // 2. NEW HANDLER: Forces a full browser page reload
    const handleFullPageRefresh = () => {
        window.location.reload();
    };


    // NEW: Handler for button-based status change
    const handleStatusChangeClick = (applicationId: string | number, newStatus: string) => {
        // We construct a mock DropResult object to reuse the existing onApplicationStatusChange logic
        const mockDropResult: DropResult = {
            draggableId: String(applicationId),
            type: "DEFAULT",
            source: {
                droppableId: applications.find(app => String(app._id) === String(applicationId))?.status || INTERESTED_COLUMN,
                index: -1, // Not used by the status change logic but required by DropResult type
            },
            destination: {
                droppableId: newStatus,
                index: -1, // Not used by the status change logic but required by DropResult type
            },
            reason: "DROP",
            combine: null, 
            mode: "FLUID",
        };

        if (mockDropResult.source.droppableId !== mockDropResult.destination?.droppableId) {
            onApplicationStatusChange(mockDropResult);
        }
    };

    // **Using your original grouping logic (do not change kanban board logic)**
    const applicationsByStatus = statusColumns.reduce((acc, status) => {
        const lowerStatus = status.toLowerCase();
        const isInterestedColumn = status === INTERESTED_COLUMN;

        acc[status] = applications.filter((app) => {
            const appStatusLower = (app.status || "").toLowerCase();
            const isMatch = appStatusLower === lowerStatus;

            if (isInterestedColumn) {
                const isUnassigned = statusColumns.every(col => (app.status || "").toLowerCase() !== col.toLowerCase());
                return isMatch || isUnassigned;
            }
            return isMatch;
        });

        return acc;
    }, {} as Record<string, Application[]>);


    // Helper to get status-specific colors
    const getStatusColors = (status: string) => {
        switch (status) {
            case "Accepted":
                return { 
                    light: "bg-green-100", 
                    dark: "text-green-700", 
                    border: "border-green-500", 
                    ring: "ring-green-500", 
                    folder: "text-green-600" 
                };
            case "Rejected":
                return { 
                    light: "bg-red-100", 
                    dark: "text-red-700", 
                    border: "border-red-500", 
                    ring: "ring-red-500", 
                    folder: "text-red-600" 
                };
            case "Submitted":
                return { 
                    light: "bg-blue-100", 
                    dark: "text-blue-700", 
                    border: "border-blue-500", 
                    ring: "ring-blue-500", 
                    folder: "text-blue-600" 
                };
            case "Interested":
            default:
                return { 
                    light: "bg-yellow-100", 
                    dark: "text-yellow-700", 
                    border: "border-yellow-500", 
                    ring: "ring-yellow-500", 
                    folder: "text-yellow-600" 
                };
        }
    };

    // Helper for the folder icon (enhanced)
    const getFolderIcon = (status: string, isDraggingOver: boolean) => {
        const { folder } = getStatusColors(status);
        // Using a slightly smaller size on mobile for better fit
        if (isDraggingOver) return <FaFolderOpen className={`text-lg sm:text-xl ${folder} mr-2`} />;
        return <FaFolder className={`text-lg sm:text-xl text-gray-400 mr-2`} />;
    };

    return (
        // Adjusted padding for smaller screens
        <div
            className="w-full min-h-screen mt-24 bg-gray-50 pt-16 p-2 sm:p-4 md:p-8"
            role="main"
        >
            <div className="relative w-full max-w-7xl mx-auto h-full max-h-full bg-white rounded-xl sm:rounded-2xl shadow-3xl p-4 sm:p-6 md:p-8 flex flex-col">
                <TrialBanner userProfile={userProfile} />

                {/* Main Header and Controls - Adjusted for stacking on mobile */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-start mb-4 md:mb-0">
                        {/* The main title is on the left */}
                        <div>
                            {/* Reduced text size for better fit on small phones */}
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center mb-1">
                                <FaGraduationCap className="mr-3 text-indigo-600 text-xl sm:text-2xl"/>
                                <span className="hidden sm:inline">Grad Manager Application Tracker</span>
                                <span className="sm:hidden">App Tracker</span> {/* Shorter name for max mobile space */}
                            </h2>
                            {/* Beautiful Header Message */}
                            <p className="text-xs sm:text-sm text-gray-500 ml-1">
                                Visualize your journey to acceptance. Drag and drop applications across the pipeline.
                            </p>
                        </div>
                    </div>
                    
                    {/* Actions: Add New and Back to Dashboard - Adjusted for responsive button group */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        
                        {/* 3. 🟢 Refresh Button calls the FULL PAGE RELOAD handler */}
                        {/* Note: We use a <button> instead of <Link> since we are forcing a full reload */}
                        <button
                            onClick={handleFullPageRefresh}
                            className="w-full sm:w-auto justify-center px-4 py-2 sm:px-5 sm:py-3 text-gray-600 bg-gray-200 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center space-x-2 hover:bg-gray-300 transition shadow-sm"
                            aria-label="Refresh applications data"
                        >
                            <FaSyncAlt className="text-sm" />
                            <span className="hidden sm:inline">Refresh Data</span>
                            <span className="sm:hidden">Refresh</span>
                        </button>

                        {/* Standardized Dashboard Link - Smaller padding on mobile */}
                        <Link 
                            to="/" 
                            className="w-full sm:w-auto justify-center px-4 py-2 sm:px-5 sm:py-3 text-indigo-600 bg-indigo-50 text-sm font-semibold rounded-lg sm:rounded-xl flex items-center space-x-2 hover:bg-indigo-100 transition shadow-sm"
                        > 
                            <FaArrowLeft className="text-sm" />
                            <span className="hidden sm:inline">Go to Dashboard</span>
                            <span className="sm:hidden">Dashboard</span>
                        </Link>
                    </div>
                </header>

                {/* Smart Application Tracker banner (moved here from Programs page) */}
                {userProfile && (
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 w-full">
                        <div className="bg-blue-50 p-3 rounded-lg flex flex-col md:flex-row items-center justify-between text-sm border border-blue-200 shadow">
                            <p className="font-medium text-blue-800 mb-2 md:mb-0 text-center md:text-left">
                                Your <strong className="uppercase">{userPlan}</strong> Plan: <span className="font-bold">Smart Application Tracker</span> limit: {currentApplicationCount} of {maxApplicationsDisplay} schools tracked.
                            </p>
                            {userPlan !== 'pro' && (
                                <Link to="/subscribe" className="w-full md:w-auto text-center bg-blue-600 text-white py-1.5 px-3 rounded-full hover:bg-blue-700 transition-colors font-semibold">
                                    Upgrade Now
                                </Link>
                            )}
                        </div>
                    </div>
                )}


                <DragDropContext onDragEnd={onApplicationStatusChange}>
                    {/* The kanban board container - Ensures proper mobile horizontal scroll setup */}
                    <section className="flex-grow flex gap-4 sm:gap-6 pb-4 pt-2 overflow-x-auto custom-scrollbar lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:whitespace-normal">
                        {statusColumns.map((status) => {
                            const { dark, border, light, ring } = getStatusColors(status);
                            return (
                                <Droppable key={status} droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`
                                                w-64 sm:w-72 lg:w-full flex-shrink-0 p-3 sm:p-4 border rounded-xl transition-all duration-300
                                                ${
                                                    snapshot.isDraggingOver
                                                        ? `${light} shadow-inner ${border} ${ring} ring-2`
                                                        : "bg-gray-100 border-gray-200 shadow-md"
                                                }
                                            `}
                                        >
                                            {/* Column Header */}
                                            <div className="sticky top-0 bg-inherit/80 backdrop-blur-sm z-10 border-b border-gray-200 pb-2 mb-3 flex justify-between items-center">
                                                <div className="flex items-center">
                                                    {getFolderIcon(status, snapshot.isDraggingOver)}
                                                    {/* Reduced font size for mobile */}
                                                    <span className={`capitalize text-base sm:text-lg font-extrabold ${dark}`}>
                                                        {status}
                                                    </span>
                                                </div>

                                                <span
                                                    className={`text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${light} ${dark} shadow-sm`}
                                                >
                                                    {applicationsByStatus[status].length}
                                                </span>
                                            </div>

                                            {/* Column Content (Vertical Scroll) */}
                                            {/* Adjusted max-height calculation for mobile viewing area */}
                                            <div className="flex flex-col gap-3 min-h-[50px] overflow-y-auto pr-1 custom-scrollbar max-h-[calc(100vh-18rem)] sm:max-h-[calc(100vh-250px)]">
                                                {applicationsByStatus[status].length > 0 ? (
                                                    applicationsByStatus[status].map((app, index) => (
                                                        <Draggable
                                                            key={String(app._id || `${status}-${index}`)}
                                                            draggableId={String(app._id || `${status}-${index}`)}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <ApplicationCard
                                                                    application={app}
                                                                    onViewDetailsModal={handleViewDetailsModal}
                                                                    onEditApplicationModal={handleEditApplicationModal} 
                                                                    onViewDashboardSections={() => {/* Empty func as prop is required */}}
                                                                    // PASS THE NEW HANDLER
                                                                    onStatusChangeClick={handleStatusChangeClick} 
                                                                    isDragging={snapshot.isDragging}
                                                                    ref={provided.innerRef}
                                                                    draggableProps={provided.draggableProps}
                                                                    dragHandleProps={provided.dragHandleProps}
                                                                />
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <div
                                                        className={`p-6 rounded-xl text-center text-gray-500 italic border border-dashed transition-all duration-300
                                                            ${
                                                                snapshot.isDraggingOver
                                                                    ? `${light} border-4 ${border} font-semibold`
                                                                    : "bg-gray-50 border-gray-300"
                                                            }`}
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                                                            <FaScroll className="text-gray-400 text-xl" />
                                                        </div>
                                                        <p className="mb-1 text-sm">No applications here.</p>
                                                        <p className="text-xs text-gray-500">
                                                            Drop or add a new application.
                                                        </p>
                                                    </div>
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </section>
                </DragDropContext>
            </div>
        </div>
    );
};

export default ApplicationTrackerPage;
