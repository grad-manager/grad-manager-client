// client/src/pages/GroupsPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUsers } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface Group {
  id: string;
  name: string;
}

const GroupsPage: React.FC = () => {
  const { currentUser, token } = useAuth(); // <-- DESTRUCTURE 'token' HERE
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Use the 'token' variable directly
    if (!currentUser?.uid || !token) { // <-- CHECK 'token' HERE
      setLoading(false);
      setError('User not authenticated or token is missing.');
      return;
    }

    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_URL}/groups`, {
          // Pass the 'token' in the Authorization header
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(response.data);
      } catch (err) {
        console.error('Failed to fetch groups:', err);
        setError('Failed to load groups.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser, token]); // <-- ADD 'token' to dependency array

  if (loading) return <div className="text-center mt-24">Loading groups...</div>;
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;


  return (
    <div className="container mx-auto p-4 mt-24">
      <h1 className="text-3xl font-bold text-center mb-8">My Groups</h1>
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        {groups.length === 0 ? (
          <p className="text-center text-gray-500">You are not a member of any groups.</p>
        ) : (
          groups.map((group) => (
            <Link 
              key={group.id}
              to={`/group-chat/${group.id}`}
              className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition rounded-lg"
            >
              <FaUsers size={48} className="text-gray-400" />
              <span className="text-lg font-medium">{group.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupsPage;