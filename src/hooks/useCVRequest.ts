import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { AcademicCVRequest } from '../types/AcademicCVRequest';
import type { User } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL;

export const useCVRequest = (currentUser: User | null | undefined, token: string | null) => {
  const [cvRequest, setCvRequest] = useState<AcademicCVRequest | null>(null);

  const fetchCVRequest = useCallback(async () => {
    if (!currentUser || !token) return;
    try {
      const response = await axios.get(`${API_URL}/cv-service/my-request`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const backendData = response.data;

      
      if (backendData.status === 'none') {
        setCvRequest(null);
      } else {
        // NOTE: The status logic can be simplified since the client component now handles 'review_complete'.
        // However, to strictly match the previous client type definition that only included 'completed', 
        // we'll keep the conditional mapping here for safety, but use the spread operator for fields.
        const status = backendData.status === 'review_complete' ? 'completed' : backendData.status;

        // 2. CRITICAL FIX: Include all fields correctly mapped by the server
        setCvRequest({
          id: backendData.id,
          status: status,
          
          // These fields were missing from the previous setCvRequest call:
          timestamp: backendData.timestamp,
          uploadedFileUrl: backendData.uploadedFileUrl, // Mapped from DB 'cvUrl'
          finalDocumentUrl: backendData.finalDocumentUrl, // Mapped from DB 'correctedCvUrl'
          mentorFeedback: backendData.mentorFeedback,
          notes: backendData.notes,
          type: backendData.type || 'cv_upload',

          // These fields were present but should be explicitly included
          scheduledDate: backendData.scheduledDate,
          scheduledTime: backendData.scheduledTime,
          zoomLink: backendData.zoomLink,
          
          // **NOTE**: The old line 'correctedCvUrl: backendData.correctedCvUrl' was a triple error: 
          // 1. Incorrect client interface name. 
          // 2. Incorrect server response name (should be 'finalDocumentUrl'). 
          // I have replaced it with the correct mapping above.
        });
      }
    } catch (error) {
      console.error('Error fetching CV request:', error);
      setCvRequest(null);
    }
  }, [currentUser, token]);

  const handleCVUpload = async (file: File) => {
    if (!currentUser || !token) {
      toast.error('You must be logged in to submit a request.');
      throw new Error('User not authenticated.');
    }

    const formData = new FormData();
    formData.append('cvFile', file);

    try {
      await axios.post(`${API_URL}/cv-service/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Your CV has been uploaded and submitted for review!');
      fetchCVRequest();
    } catch (error: unknown) {
      console.error('Failed to upload CV file:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error('You already have a pending CV review request.');
        } else {
          toast.error('Failed to upload file. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred during file upload.');
      }
      throw error;
    }
  };

  const handleNewCVRequest = async (data: { notes: string }) => {
    if (!currentUser || !token) {
      toast.error('You must be logged in to submit a request.');
      throw new Error('User not authenticated.');
    }

    try {
      await axios.post(`${API_URL}/cv-service/new-request`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Your new CV request has been submitted successfully!');
      fetchCVRequest();
    } catch (error: unknown) {
      console.error('Failed to submit new CV request:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error('You already have a pending CV review request.');
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
      throw error;
    }
  };
  
  useEffect(() => {
    fetchCVRequest();
  }, [fetchCVRequest]);

  return { cvRequest, fetchCVRequest, handleCVUpload, handleNewCVRequest };
};