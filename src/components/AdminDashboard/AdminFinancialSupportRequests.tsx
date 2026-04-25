/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { FaMoneyBillWave, FaComments, FaSpinner, FaPaperPlane, FaCalendar, FaClock, FaLink, FaUniversity } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface FinancialSupportRequest {
  id: string;
  userId: string;
  userEmail: string;
  applicationId: string;
  universityName: string;
  requestedAmount: number;
  notes: string;
  status: 'pending' | 'scheduled' | 'declined';
  requestedAt: any; // Firestore Timestamp
  adminResponse?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  zoomLink?: string;
}

const AdminFinancialSupportRequests: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<FinancialSupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<FinancialSupportRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [status, setStatus] = useState<'pending' | 'scheduled' | 'declined'>('pending');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFetchLoading(true);
    const q = query(collection(db, 'financial_support_requests'), orderBy('requestedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancialSupportRequest[];
      setRequests(fetchedRequests);
      setFetchLoading(false);
    }, (err) => {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load requests. Please try again.");
      setFetchLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    // Client-side validation for 'scheduled' status
    if (status === 'scheduled' && (!adminResponse.trim() || !scheduledDate.trim() || !scheduledTime.trim() || !zoomLink.trim())) {
      setError('All fields (response, date, time, and Zoom link) are required for a scheduled response.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestRef = doc(db, 'financial_support_requests', selectedRequest.id);
      const updatedData: any = {
        status,
        adminResponse,
        respondedAt: serverTimestamp(),
      };

      if (status === 'scheduled') {
        updatedData.scheduledDate = scheduledDate;
        updatedData.scheduledTime = scheduledTime;
        updatedData.zoomLink = zoomLink;
      }
      
      await updateDoc(requestRef, updatedData);

      // Optional: Send a backend notification (e.g., email or push notification)
      if (token) {
        await axios.post(`${API_URL}/admin/financial-support/send-response`, {
          requestId: selectedRequest.id,
          message: adminResponse,
          status,
          scheduledDate,
          scheduledTime,
          zoomLink,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert('Request updated successfully!');
      setSelectedRequest(null);
      setAdminResponse('');
      setScheduledDate('');
      setScheduledTime('');
      setZoomLink('');
      setStatus('pending');
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (request: FinancialSupportRequest) => {
    setSelectedRequest(request);
    setAdminResponse(request.adminResponse || '');
    setScheduledDate(request.scheduledDate || '');
    setScheduledTime(request.scheduledTime || '');
    setZoomLink(request.zoomLink || '');
    setStatus(request.status || 'pending');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (fetchLoading) return <div className="text-center py-4"><FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto" /></div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Financial Support Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No financial support requests to display.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div
              key={request.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 
                  ${selectedRequest?.id === request.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'}`}
              onClick={() => handleSelectRequest(request)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                    <FaUniversity className="mr-2 text-gray-600" />
                    {request.universityName}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Requested by: {request.userEmail}</p>
              <p className="text-sm text-gray-600 mt-1">Amount: <span className="font-bold">${request.requestedAmount}</span></p>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FaMoneyBillWave className="mr-2 text-blue-600" />
            Details for Financial Support Request
          </h3>
          <p className="text-sm text-gray-700"><strong>User:</strong> {selectedRequest.userEmail}</p>
          <p className="text-sm text-gray-700"><strong>University:</strong> {selectedRequest.universityName}</p>
          <p className="text-sm text-gray-700"><strong>Application ID:</strong> {selectedRequest.applicationId}</p>
          <p className="text-sm text-gray-700"><strong>Requested Amount:</strong> ${selectedRequest.requestedAmount}</p>
          <p className="text-sm text-gray-700 mt-2"><strong>Notes:</strong> {selectedRequest.notes || 'N/A'}</p>

          <form onSubmit={handleUpdate} className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold flex items-center mb-2">
              <FaComments className="mr-2 text-blue-600" />
              Send a Response
            </h4>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'scheduled' | 'declined')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            
            {status === 'scheduled' && (
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaCalendar className="inline mr-1 text-gray-500" /> Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaClock className="inline mr-1 text-gray-500" /> Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FaLink className="inline mr-1 text-gray-500" /> Zoom Link
                    </label>
                    <input
                      type="url"
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., https://zoom.us/j/1234567890"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your response here..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              required={status !== 'declined'} // Require response for 'pending' and 'scheduled'
            ></textarea>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update Request</span>
                  <FaPaperPlane />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminFinancialSupportRequests;