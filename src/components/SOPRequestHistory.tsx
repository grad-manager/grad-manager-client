/* eslint-disable no-irregular-whitespace */
// src/components/SOPRequestHistory.tsx (FIXED to handle null applicationId)
import React from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaHistory, FaLink, FaFolderOpen, FaEnvelopeOpenText } from 'react-icons/fa';
import type { SOPRequest } from '../hooks/useSOPRequests'; // Use the type from the new hook
// Use the type from the new hook
import type { Application } from '../types/Application'; // Assuming Application is in this path

interface SOPRequestHistoryProps {
  sopRequests: SOPRequest[];
  applications: Application[];
  onClose: () => void; // To go back to the service menu
}

const SOPRequestHistory: React.FC<SOPRequestHistoryProps> = ({ sopRequests, applications, onClose }) => {
  // Update: getApplicationById is now only called if applicationId is not null
  const getApplicationById = (id: string) => applications.find(app => app._id === id);

  const statusColorMap: Record<SOPRequest['status'], { bg: string, icon: React.FC }> = {
    pending: { bg: 'bg-yellow-500', icon: FaClock },
    accepted: { bg: 'bg-green-500', icon: FaCheckCircle },
    rescheduled: { bg: 'bg-blue-500', icon: FaCalendarAlt },
    completed: { bg: 'bg-indigo-600', icon: FaCheckCircle }, // Changed to indigo for completion highlight
    declined: { bg: 'bg-red-500', icon: FaTimesCircle },
    'not completed': { bg: 'bg-red-500', icon: FaTimesCircle },
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaHistory className="mr-2 text-indigo-600" /> SOP Request History
        </h2>
        <button
          onClick={onClose}
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition text-sm"
        >
          Back to Services
        </button>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {sopRequests.length > 0 ? (
          sopRequests.map(req => {
            // Determine the application details safely
            const app = req.applicationId ? getApplicationById(req.applicationId) : null;
            
            // If application ID exists but application object is not found (e.g., deleted application),
            // we can still display a placeholder instead of returning null.
            const schoolName = app?.schoolName || (req.applicationId === null ? 'General SOP Request' : 'Application Not Found');
            
            // Use a different icon/color if it's a general request
            const isGeneralRequest = req.applicationId === null;

            const statusInfo = statusColorMap[req.status];
            const formattedDate = new Date(req.timestamp).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            return (
              <div 
                key={req.id} 
                className={`p-4 rounded-lg border-l-4 shadow-sm transition ${
                    // Highlight accepted/rescheduled/completed requests
                    req.status === 'accepted' || req.status === 'rescheduled' || req.status === 'completed'
                    ? 'border-indigo-500 bg-white hover:shadow-lg' 
                    : isGeneralRequest ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold text-lg ${isGeneralRequest ? 'text-gray-600' : 'text-gray-900'} flex items-center`}>
                        {isGeneralRequest && <FaFolderOpen className='mr-2 text-gray-500' />}
                        {schoolName}
                  </span>
                  <div className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${statusInfo.bg}`}>
                    {req.status.toUpperCase()}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  <FaClock className="inline mr-1 text-gray-500" /> Requested: {formattedDate}
                </p>

                {req.status === 'accepted' && req.acceptanceDetails && (
                  <div className="mt-2 text-sm">
                    <p><strong>Session:</strong> {req.acceptanceDetails.date} at {req.acceptanceDetails.time}</p>
                    <a 
                      href={req.acceptanceDetails.zoomLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center mt-1 font-medium"
                    >
                      <FaLink className="mr-1" /> Join Session Link
                    </a>
                  </div>
                )}
                
                {req.status === 'rescheduled' && req.rescheduleDetails && (
                    <div className="mt-2 text-sm text-blue-700">
                        <p className='font-semibold'>Rescheduled:</p>
                        <p><strong>New Date:</strong> {req.rescheduleDetails.newDate} at {req.rescheduleDetails.newTime}</p>
                        {req.rescheduleDetails.reason && <p className="italic">Reason: {req.rescheduleDetails.reason}</p>}
                    </div>
                )}
                
                {/* >>> NEW BLOCK FOR COMPLETED STATUS <<< */}
                {req.status === 'completed' && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                        <p className="font-semibold text-indigo-700 flex items-center">
                            <FaEnvelopeOpenText className="mr-2 text-indigo-500" />
                            Session Completed!
                        </p>
                        <p className="text-sm text-indigo-600 mt-1">
                            Your final SOP document has been reviewed and corrected. It will be sent to your registered email address shortly.
                        </p>
                        {/* Optionally, you might provide a download link here if you prefer immediate access */}
                        {/* {req.completionDetails?.finalSOPUrl && (
                            <a href={req.completionDetails.finalSOPUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 flex items-center mt-2 font-medium">
                                <FaLink className="mr-1" /> Download Final SOP (Immediate)
                            </a>
                        )} */}
                    </div>
                )}
                {/* >>> END NEW BLOCK <<< */}

                {(req.status === 'declined' || req.status === 'not completed') && (
                    <p className="mt-2 text-sm text-red-600 italic">
                        Reason: {req.declineReason || req.uncompletionReason || 'Reason not provided.'}
                    </p>
                )}

              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-10">No SOP requests have been submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default SOPRequestHistory;