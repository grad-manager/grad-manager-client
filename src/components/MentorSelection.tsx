/* eslint-disable no-irregular-whitespace */
// src/components/MentorSelection.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
}

interface MentorSelectionProps {
  onClose: () => void;
  onSendRequest: (mentorId: string) => Promise<void>;
}

const MentorSelection: React.FC<MentorSelectionProps> = ({
  onSendRequest,
}) => {
  const { token } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!token) {
        setError('Authentication token is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/mentors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Raw Mentors API Response:', response.data);
        setMentors(response.data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, [token]);

  const handleSendRequest = async (mentorId: string) => {
    setIsSending(mentorId);
    await onSendRequest(mentorId);
    setIsSending(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        <p className="text-gray-600 mb-6">Browse the list of available mentors and send a connection request.</p>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : mentors.length > 0 ? (
          <ul className="space-y-4">
            {mentors.map((mentor) => (
              <li
                key={mentor.id}
                className="p-4 border rounded-lg flex items-center justify-between hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUserGraduate className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {mentor.firstName} {mentor.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ready to connect
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(mentor.id)}
                  disabled={isSending !== null}
                  className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                    {isSending === mentor.id ? (
                        <>
                            <FaSpinner className="animate-spin mr-2" />
                            Sending...
                        </>
                    ) : (
                        'Send Request'
                    )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            No mentors are currently available. Check back soon!
          </div>
        )}
    </div>
  );
};

export default MentorSelection;