import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { shouldRestrictAppAccess } from '../utils/trial';

const API_URL = import.meta.env.VITE_API_URL;

interface MentorRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export const useMentorRequests = (token: string | null) => {
  const { userProfile } = useAuth();
  const isSubscriptionLocked = shouldRestrictAppAccess(userProfile);
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [loadingMentorRequests, setLoadingMentorRequests] = useState(true);

  const fetchMentorRequests = useCallback(async () => {
    if (!token || isSubscriptionLocked) {
      setMentorRequests([]);
      setLoadingMentorRequests(false);
      return;
    }
    setLoadingMentorRequests(true);
    try {
      const response = await axios.get<MentorRequest[]>(`${API_URL}/mentee/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentorRequests(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setMentorRequests([]);
      } else {
        console.error('Error fetching mentee requests:', error);
      }
    } finally {
      setLoadingMentorRequests(false);
    }
  }, [token, isSubscriptionLocked]);

  const handleSendMentorRequest = async (mentorId: string) => {
    if (!token || isSubscriptionLocked) return;
    try {
      await axios.post(`${API_URL}/mentors/request`, { mentorId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMentorRequests();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error('Your free trial has ended. Subscribe to continue.');
      } else {
        console.error('Error sending mentor request:', error);
        toast.error('An error occurred while sending the request.');
      }
    }
  };

  useEffect(() => {
    fetchMentorRequests();
  }, [fetchMentorRequests]);

  return { mentorRequests, loadingMentorRequests, handleSendMentorRequest, fetchMentorRequests };
};
