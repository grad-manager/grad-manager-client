/* eslint-disable no-irregular-whitespace */
// src/components/admin/AdminAcademicCVService.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaEye, FaSpinner, FaCalendarAlt, FaCheckCircle, FaRedoAlt } from 'react-icons/fa';
import AcademicCVUploadModal from './AcademicCVUploadModal';
import ScheduleSessionModal from './ScheduleSessionModal';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface CVRequest {
  id: string;
  userId: string;
  userEmail: string;
  cvUrl?: string;
  status: 'pending' | 'review_complete' | 'scheduled' | 'completed'; // Added 'completed' status
  notes?: string;
  type: 'cv_upload' | 'new_cv_request';
  createdAt: string;
  scheduledDate?: string; // Added for scheduled requests
  scheduledTime?: string; // Added for scheduled requests
  zoomLink?: string; // Added for scheduled requests
  correctedCvUrl?: string; // Added for completed requests
}

const AdminAcademicCVService: React.FC = () => {
  const { token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<CVRequest[]>([]);
  const [scheduledRequests, setScheduledRequests] = useState<CVRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<CVRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CVRequest | null>(null);

  const fetchCVRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/admin/cv-service/all-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        const pending = response.data.filter(req => req.status === 'pending');
        const scheduled = response.data.filter(req => req.status === 'scheduled');
        const completed = response.data.filter(req => req.status === 'review_complete' || req.status === 'completed');
        
        setPendingRequests(pending);
        setScheduledRequests(scheduled);
        setCompletedRequests(completed);
      } else {
        console.error('API response for all reviews is not an array:', response.data);
        setPendingRequests([]);
        setScheduledRequests([]);
        setCompletedRequests([]);
      }
    } catch (err) {
      console.error('Error fetching CV requests:', err);
      setError('Failed to load CV requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCVRequests();
    } else {
      setLoading(false);
      setError('Authentication token not found. Please log in.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleReviewClick = (request: CVRequest) => {
    setSelectedRequest(request);
    setIsUploadModalOpen(true);
  };

  const handleScheduleClick = (request: CVRequest) => {
    setSelectedRequest(request);
    setIsScheduleModalOpen(true);
  };

  const handleSessionCompleted = (request: CVRequest) => {
    setSelectedRequest(request);
    setIsUploadModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setSelectedRequest(null);
    fetchCVRequests(); // Refresh list
  };

  const handleScheduleModalClose = () => {
    setIsScheduleModalOpen(false);
    setSelectedRequest(null);
    fetchCVRequests(); // Refresh list
  };

  const handleRescheduleClick = (request: CVRequest) => {
    // Re-open the scheduling modal with the request data
    setSelectedRequest(request);
    setIsScheduleModalOpen(true);
  };

  if (loading) return <div className="text-center py-4"><FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto" /></div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Academic CV Service Admin Dashboard</h1>

      {/* Pending Requests Section */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending CV Reviews & New CV Requests</h2>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 italic">No pending requests at this time.</p>
        ) : (
          <ul className="space-y-4">
            {pendingRequests.map((request) => (
              <li key={request.id} className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">Request from {request.userEmail}</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Type:</span> {request.type === 'cv_upload' ? 'CV Review' : 'New CV Request'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Submitted:</span> {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  {request.notes && (
                    <p className="text-sm text-gray-600 mt-1 italic">
                      <span className="font-semibold">Notes:</span> {request.notes}
                    </p>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  {request.type === 'cv_upload' && (
                    <>
                      {request.cvUrl && (
                        <a
                          href={request.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center"
                        >
                          <FaEye className="mr-2" /> View CV
                        </a>
                      )}
                      <button
                        onClick={() => handleReviewClick(request)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center"
                      >
                        <FaUpload className="mr-2" /> Upload Review
                      </button>
                    </>
                  )}
                  {request.type === 'new_cv_request' && (
                    <button
                      onClick={() => handleScheduleClick(request)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm flex items-center"
                    >
                      <FaCalendarAlt className="mr-2" /> Schedule Session
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Scheduled Sessions Section */}
      {scheduledRequests.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Scheduled Sessions</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <ul className="space-y-4">
              {scheduledRequests.map((request) => (
                <li key={request.id} className="bg-yellow-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Session with {request.userEmail}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Date:</span> {request.scheduledDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Time:</span> {request.scheduledTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Zoom Link:</span> <a href={request.zoomLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{request.zoomLink}</a>
                    </p>
                    {/* NEW: Add link to view original uploaded CV for review requests */}
                    {request.type === 'cv_upload' && request.cvUrl && (
                        <a
                          href={request.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center mt-2"
                        >
                          <FaEye className="mr-1" /> View Original CV File
                        </a>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    <button
                      onClick={() => handleSessionCompleted(request)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm flex items-center"
                    >
                      <FaCheckCircle className="mr-2" /> Session Completed
                    </button>
                    <button
                      onClick={() => handleRescheduleClick(request)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm flex items-center"
                    >
                      <FaRedoAlt className="mr-2" /> Reschedule
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Completed & Reviewed Section */}
      {completedRequests.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Completed Reviews & Sessions</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="space-y-4">
              {completedRequests.map((request) => (
                <li key={request.id} className="bg-green-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {request.type === 'cv_upload' ? 'Review for' : 'Session with'} {request.userEmail}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Status:</span> {request.status === 'review_complete' ? 'Review Complete' : 'Session Completed'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Completed Date:</span> {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    {/* NEW: Add link to view original uploaded CV for review requests */}
                    {request.type === 'cv_upload' && request.cvUrl && (
                        <a
                          href={request.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center mt-2"
                        >
                          <FaEye className="mr-1" /> View Original CV File
                        </a>
                    )}
                    </div>
                    {request.correctedCvUrl && (
                       <a
                          href={request.correctedCvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 sm:mt-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center"
                        >
                          <FaEye className="mr-2" /> View Final CV
                        </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {selectedRequest && isUploadModalOpen && (
        <AcademicCVUploadModal
          isOpen={isUploadModalOpen}
          onClose={handleModalClose}
          requestId={selectedRequest.id}
          isSessionCompletion={selectedRequest.type === 'new_cv_request'}
        />
      )}

      {selectedRequest && isScheduleModalOpen && (
        <ScheduleSessionModal
          isOpen={isScheduleModalOpen}
          onClose={handleScheduleModalClose}
          requestId={selectedRequest.id}
        />
      )}
    </div>
  );
};

export default AdminAcademicCVService;