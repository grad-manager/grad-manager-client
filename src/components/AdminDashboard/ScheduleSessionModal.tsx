/* eslint-disable no-irregular-whitespace */
// src/components/admin/ScheduleSessionModal.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

const ScheduleSessionModal: React.FC<Props> = ({ isOpen, onClose, requestId }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    zoomLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare data for the unified backend PUT endpoint
    const requestBody = {
        ...formData,
        // The crucial change: set status to 'scheduled'
        status: 'scheduled', 
    };

    try {
        // ACTION: Changed from POST to PUT
        // ENDPOINT: Changed to match the unified backend route: /admin/cv-service/review/:requestId
        await axios.put(`${API_URL}/admin/cv-service/review/${requestId}`, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        alert('Session scheduled successfully!');
        onClose();
    } catch (err) {
        console.error('Error scheduling session:', err);
        // Display a more informative error message
        setError('Failed to schedule session. Check network and ensure backend is running.');
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Schedule New CV Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="zoomLink" className="block text-sm font-medium text-gray-700">Zoom Link</label>
            <input
              type="url"
              id="zoomLink"
              name="zoomLink"
              value={formData.zoomLink}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;