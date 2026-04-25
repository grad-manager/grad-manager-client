/* eslint-disable no-irregular-whitespace */
// src/components/ApplicationTrackerModal.tsx
import React from "react";
import type { Application } from "../types/Application";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
// 🚨 FIX: Import FaSyncAlt for a refresh button icon
import { FaTimes, FaPlus, FaGraduationCap, FaSyncAlt } from "react-icons/fa";
import ApplicationCard from "./ApplicationCard";

interface ApplicationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  onApplicationStatusChange: (result: DropResult) => void;
  onViewDetailsModal: (application: Application) => void;
  onEditApplicationModal: (application: Application) => void; 
  onViewDashboardSections: (application: Application) => void;
  // CRITICAL FIX: Prop definition is correct
  onRefreshApplications: () => void; 
}

const statusColumns = ["Interested", "Submitted", "Accepted", "Rejected"];
const INTERESTED_COLUMN = "Interested";

const ApplicationTrackerModal: React.FC<ApplicationTrackerModalProps> = ({
  isOpen,
  onClose,
  applications = [], 
  onApplicationStatusChange,
  onViewDetailsModal,
  onEditApplicationModal, 
  onViewDashboardSections,
  // 🚨 FIX: Now `onRefreshApplications` will be used to clear the warning
  onRefreshApplications,
}) => {
  if (!isOpen) return null;

  // FIX: Dummy function to satisfy ApplicationCard's required prop
  // In a real app, this should call an API or a state setter in the parent component.
  const handleManualStatusChange = (applicationId: string | number, newStatus: string) => {
    // NOTE: For the sake of the kanban board, we are mocking the logic 
    // by building a DropResult and calling the main handler, as done in ApplicationTrackerPage.tsx
    const mockDropResult: DropResult = {
        draggableId: String(applicationId),
        type: "DEFAULT",
        source: {
            // Find the current status based on the application list
            droppableId: applications.find(app => String(app._id) === String(applicationId))?.status || INTERESTED_COLUMN,
            index: -1, 
        },
        destination: {
            droppableId: newStatus,
            index: -1,
        },
        reason: "DROP",
        combine: null, 
        mode: "FLUID",
    };

    if (mockDropResult.source.droppableId !== mockDropResult.destination?.droppableId) {
        onApplicationStatusChange(mockDropResult);
    }
  };


  // Grouping logic (kept your existing, robust logic)
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

  return (
    // 🛑 FIX 1: Increased z-index from z-50 to z-[1000] to ensure it sits above all other content.
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      // Allow clicking the overlay to close
      onClick={onClose} 
    >
      {/* Modal Content Container */}
      <div 
        className="relative w-full max-w-7xl h-[90vh] bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-up flex flex-col"
        // 🛑 FIX 2: Stop event propagation so clicking inside the modal doesn't close it
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors z-20 p-2 rounded-full hover:bg-gray-100"
          aria-label="Close application tracker modal"
        >
          <FaTimes className="text-2xl" />
        </button>

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-3xl font-extrabold text-indigo-600 flex items-center">
              <FaGraduationCap className="mr-3 text-3xl" />
              Application Tracker Board
            </h2>
            {/* 🚨 FIX: Use the onRefreshApplications prop */}
            <button
                onClick={onRefreshApplications}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-3 py-1 rounded-full bg-gray-200 hover:bg-indigo-100"
                aria-label="Refresh applications data"
            >
                <FaSyncAlt className="mr-2 text-xs" /> Refresh
            </button>
        </div>
        
        {/* Drag & Drop Context */}
        <DragDropContext onDragEnd={onApplicationStatusChange}>
          <section className="flex-grow flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {statusColumns.map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-shrink-0 w-80 rounded-xl p-4 shadow-inner border border-gray-200 transition-all duration-300 min-h-full
                      ${
                        snapshot.isDraggingOver
                          ? "bg-indigo-100/50 shadow-indigo-300 ring-2 ring-indigo-300"
                          : "bg-gray-100"
                      }`}
                  >
                    {/* Column Header */}
                    <div className="sticky top-0 bg-inherit/80 backdrop-blur-sm z-10 border-b border-gray-200 pb-2 mb-3 flex justify-between items-center">
                      <span className="capitalize text-lg font-bold text-gray-800">
                        {status}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : status === "Submitted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {applicationsByStatus[status].length}
                      </span>
                    </div>

                    {/* Column Content */}
                    <div className="flex flex-col gap-3 min-h-[150px] overflow-y-auto pr-2 custom-scrollbar max-h-[calc(90vh-170px)]">
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
                                onViewDetailsModal={onViewDetailsModal}
                                onEditApplicationModal={onEditApplicationModal} 
                                onViewDashboardSections={onViewDashboardSections}
                                onStatusChangeClick={handleManualStatusChange} 
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
                          className={`p-6 rounded-xl text-center text-gray-500 italic shadow-sm border border-dashed border-gray-300 transition-all duration-300
                            ${
                              snapshot.isDraggingOver
                                ? "bg-indigo-50/50"
                                : "bg-gray-50"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                            <FaPlus className="text-gray-400 text-base" />
                          </div>
                          <p className="text-xs text-gray-500">Drop or add a new application</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </div> 
                  </div>
                )}
              </Droppable>
            ))}
          </section>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ApplicationTrackerModal;