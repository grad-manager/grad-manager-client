/* eslint-disable no-irregular-whitespace */
// src/components/admin/AcademicCVUploadModal.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// Use the environment variable for the API URL
const API_URL = import.meta.env.VITE_API_URL;

interface AcademicCVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  isSessionCompletion?: boolean;
}

const AcademicCVUploadModal: React.FC<AcademicCVUploadModalProps> = ({ isOpen, onClose, requestId, isSessionCompletion }) => {
  // Get the authentication token from the context
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('correctedCV', file);

    // ACTION: Determine the correct status for the unified backend route
    const status = isSessionCompletion ? 'completed' : 'review_complete';
    
    // ACTION: The backend expects 'status' as a field, which must be added to the FormData
    formData.append('status', status);

    // ENDPOINT: Use the unified backend route for all updates
    const endpoint = `${API_URL}/admin/cv-service/review/${requestId}`;

    try {
        // ACTION: Changed from POST to PUT
        await axios.put(endpoint, formData, {
            headers: {
                // Setting Content-Type here is actually unnecessary for FormData, but good practice
                // as Axios handles it automatically. Keeping it for clarity.
                'Content-Type': 'multipart/form-data', 
                Authorization: `Bearer ${token}`, // Use token from useAuth
            },
        });
        setUploadSuccess(`Request marked as ${status} and CV uploaded successfully!`);
        setTimeout(onClose, 1500); // Close modal after a delay
    // CORRECTED code:
    } catch (err) {
      console.error('Error uploading corrected CV:', err);
      setUploadError(`Failed to upload file. Status and file must be sent together. Please try again.`); 
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-6 border w-full max-w-lg shadow-lg rounded-md bg-white mx-4">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{isSessionCompletion ? 'Upload Final CV After Session' : 'Upload Corrected CV'}</h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Select corrected CV file
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {uploadSuccess && (
            <div className="text-green-600 text-sm font-semibold">{uploadSuccess}</div>
          )}
          {uploadError && (
            <div className="text-red-600 text-sm font-semibold">{uploadError}</div>
          )}
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? <><FaSpinner className="animate-spin mr-2" /> Uploading...</> : isSessionCompletion ? 'Complete Session & Upload CV' : 'Upload Corrected CV'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcademicCVUploadModal;