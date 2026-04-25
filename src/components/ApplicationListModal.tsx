import React from "react";
import type { Application } from "../types/Application";
import { FaTimes } from "react-icons/fa";

interface ApplicationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  status: string;
}

const ApplicationListModal: React.FC<ApplicationListModalProps> = ({
  isOpen,
  onClose,
  applications,
  status,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-11/12 md:w-1/2 lg:w-1/3 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 animate-slide-up">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-extrabold text-gray-800 flex items-center justify-between">
            {status} Applications
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
              {applications.length}
            </span>
          </h3>
          <p className="text-sm text-gray-500 italic mt-1">
            A list of your {status.toLowerCase()} program applications
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {applications.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              No applications found
            </p>
          ) : (
            <ul className="space-y-3">
              {applications.map((app) => (
                <li
                  key={app._id}
                  className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 border border-gray-100"
                >
                  <p className="font-semibold text-sm text-gray-800">
                    {app.programName}
                  </p>
                  <p className="text-xs text-gray-500">{app.schoolName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationListModal;
