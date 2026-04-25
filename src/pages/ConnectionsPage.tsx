import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface Connection {
  id: string;
  name: string;
  photoURL?: string;
}

const ConnectionsPage: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser?.uid || !token) {
      setLoading(false);
      setError('User not authenticated or token is missing.');
      return;
    }

    const fetchConnections = async () => {
      try {
        const response = await axios.get(`${API_URL}/connections`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check if the received data is an array before setting state
        if (Array.isArray(response.data)) {
          setConnections(response.data);
        } else {
          // If the data is not an array, log the issue and set state to an empty array
          console.error('API response was not an array:', response.data);
          setConnections([]);
        }
      } catch (err) {
        console.error('Failed to fetch connections:', err);
        setError('Failed to load connections.');
        setConnections([]); // Important: Reset state to an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [currentUser, token]);

  if (loading) return <div className="text-center mt-24">Loading connections...</div>;
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 mt-24">
      <h1 className="text-3xl font-bold text-center mb-8">My Connections</h1>
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        {connections.length === 0 ? (
          <p className="text-center text-gray-500">You have no connections yet.</p>
        ) : (
          connections.map((connection) => (
            <Link 
              key={connection.id}
              to={`/chat/${connection.id}`}
              className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition rounded-lg"
            >
              {connection.photoURL ? (
                <img src={connection.photoURL} alt={connection.name} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <FaUserCircle size={48} className="text-gray-400" />
              )}
              <span className="text-lg font-medium">{connection.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;