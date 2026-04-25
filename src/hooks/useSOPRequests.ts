/* eslint-disable no-irregular-whitespace */
// src/hooks/useSOPRequests.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase'; // Assuming your Firebase setup is here
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';

// Define the SOPRequest type for the hook
export interface SOPRequest {
  id: string;
  applicationId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'rescheduled' | 'not completed';
  timestamp: string;
  acceptanceDetails?: { date: string; time: string; zoomLink: string };
  declineReason?: string;
  rescheduleDetails?: { newDate: string; newTime: string; reason?: string };
  uncompletionReason?: string;
}

interface UseSOPRequestsResult {
  sopRequests: SOPRequest[];
  loading: boolean;
  hasActiveSOPRequest: (applicationId: string) => boolean;
  // ✅ FIX 1: Add the missing request handler to the result interface
  handleRequestSOPWriting: (applicationId: string, notes?: string, file?: File) => Promise<void>; 
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export const useSOPRequests = (currentUser: { uid: string } | null, token?: string | null): UseSOPRequestsResult => {
  const [sopRequests, setSopRequests] = useState<SOPRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      setSopRequests([]);
      return;
    }

    setLoading(true);
    
    // Query for SOP requests tied to the current user
    const q = query(collection(db, "sop_requests"), where("userId", "==", currentUser.uid));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: SOPRequest[] = snapshot.docs.map(doc => ({ 
          ...doc.data(), 
          id: doc.id 
        } as SOPRequest));
        
        // Sort by most recent first
        // NOTE: For production, use 'orderBy("timestamp", "desc")' in the query for better performance.
        requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setSopRequests(requests);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching SOP requests:", err);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);

  /**
   * Checks if an application has an active SOP request (pending, accepted, or rescheduled).
   */
  const hasActiveSOPRequest = (appId: string): boolean => {
    return sopRequests.some(req =>
      req.applicationId === appId &&
      ['pending', 'accepted', 'rescheduled'].includes(req.status)
    );
  };

  /**
   * ✅ FIX 1: Function to create a new SOP request in Firebase.
   */
  const handleRequestSOPWriting = async (applicationId: string, notes?: string, file?: File): Promise<void> => {
    if (!currentUser?.uid) {
      toast.error('User not authenticated.');
      return;
    }

    try {
      const base = API_BASE.replace(/\/$/, '');
      const url = `${base}/sopRequestsRoutes`;

      // If a file is provided, use multipart/form-data
      if (file) {
        const form = new FormData();
        form.append('applicationId', applicationId || '');
        if (notes) form.append('notes', notes);
        form.append('sopFile', file);

        await axios.post(url, form, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // JSON POST
        await axios.post(url, { applicationId, notes }, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error: any) {
      console.error('Error creating SOP request (API):', error?.response?.data || error.message);
      // Bubble up the server error for the UI to handle (e.g., LIMIT_EXCEEDED)
      throw error;
    }
  };

  return { sopRequests, loading, hasActiveSOPRequest, handleRequestSOPWriting };
};