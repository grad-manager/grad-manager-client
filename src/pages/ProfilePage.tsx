/* eslint-disable no-irregular-whitespace */
// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaBriefcase, FaEnvelope, FaExclamationTriangle, FaArrowLeft, FaUsers, FaTimes, FaUserPlus, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa'; 

// Interface for a user's public profile (fetched by ID)
interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  role?: string;
  bio?: string;
  // 🚀 UPDATED: Now an array of strings 🚀
  targetCountries?: string[];
  // Added connections array to the PublicUser interface
  connections?: string[];
}

// Interface for a stripped-down connected user (fetched via get-by-ids)
interface ConnectedUser {
    uid: string;
    firstName: string;
    lastName: string;
    // If your backend's get-by-ids route returns photoURL, you should add it here too
}

// Interface for a Sent Request (needed to check if a request already exists)
interface SentRequest {
    recipient: {
        id: string;
    };
    // Include other fields if necessary, but recipient.id is enough for this check
}


const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, token } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  // State: To store the actual profile objects of the connections
  const [connectionsData, setConnectionsData] = useState<ConnectedUser[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State: For image modal visibility
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // State: To track if a request has been sent (initialized from fetch)
  const [isRequestSent, setIsRequestSent] = useState(false);
  // State: To track if a request is *pending* *from* this user
  const [isPendingRequestFromThisUser, setIsPendingRequestFromThisUser] = useState(false);


  useEffect(() => {
    if (!token || !userId) {
      setError('Authentication token or user ID is missing.');
      setLoading(false);
      return;
    }

    // Handle case where user tries to view their own profile
    if (currentUser?.uid === userId) {
        setLoading(false);
        return; 
    }

    const fetchUserProfile = async () => {
        let fetchedProfile: PublicUser | null = null;
        setConnectionsData([]); // Clear old connections data when fetching a new profile
        
      try {
        // 1. Fetch Public Profile
        const profileResponse = await axios.get(`${API_URL}/users/public-profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedProfile = profileResponse.data;
        setProfile(fetchedProfile);

        // 2. Fetch the VIEWER's connection status (including sent and received requests)
        const connectionsStatusResponse = await axios.get(`${API_URL}/connections`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const sentRequests: SentRequest[] = connectionsStatusResponse.data.sentRequests || [];
        const pendingRequests: { sender: { id: string } }[] = connectionsStatusResponse.data.pendingRequests || [];

        // Check 1: Has the VIEWER already sent a request to the viewed user (userId)?
        const alreadySent = sentRequests.some(req => req.recipient.id === userId);
        setIsRequestSent(alreadySent);

        // Check 2: Does the viewed user (userId) have a pending request to the VIEWER?
        const pendingFromUser = pendingRequests.some(req => req.sender.id === userId);
        setIsPendingRequestFromThisUser(pendingFromUser);


        // 3. Fetch Connection Data for the VIEWED USER (if connections exist)
        if (fetchedProfile && fetchedProfile.connections && fetchedProfile.connections.length > 0) {
            // TypeScript Check: Ensure currentUser and currentUser.uid are available here
            if (currentUser?.uid) {
                // Filter out the current viewer's ID just in case
                const connectionIds = fetchedProfile.connections.filter(id => id !== currentUser.uid);
                
                if (connectionIds.length > 0) {
                    // Use the existing POST /api/users/get-by-ids endpoint
                    const connectionsResponse = await axios.post(`${API_URL}/users/get-by-ids`, 
                        { uids: connectionIds }, // Pass the array of IDs in the request body
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setConnectionsData(connectionsResponse.data);
                }
            }
        }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to fetch user profile or connection status:', err);
        // Do not block the profile if only connection status fails, but set error.
        setError(err.response?.data?.message || 'Failed to load user profile or connection status.');
        setProfile(fetchedProfile); // Keep the fetched profile if available
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, token, currentUser]);

  // Handlers for modal
  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // Handler to send connection request
  const handleConnect = useCallback(async () => {
    // Ensure we have a profile to connect to and the viewer is authenticated
    if (!profile?.id || !token || !currentUser?.uid) {
      setError('Authentication or profile data is missing.');
      return;
    }

    try {
      await axios.post(`${API_URL}/connections/request/${profile.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // On success, update state to show "Request Sent"
      setIsRequestSent(true); 
      // Optionally provide user feedback
      // alert(`Connection request sent to ${profile.firstName}!`);
    } catch (err) {
      console.error('Failed to send connection request:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (err as any).response?.data?.message || 'Failed to send connection request.';
      setError(errorMessage);
    }
  }, [profile, token, currentUser]);


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500" />
        </div>
    );
  }

  // Handle case where user tries to view their own profile via the /profile/:userId route
  if (currentUser?.uid === userId) {
      return <Navigate to="/profile" replace />;
  }
  
  // Helper to get the total number of connections
  const totalConnections = profile?.connections?.length || 0;

  // Logic to check connection status
  // FIX: Using the non-null assertion operator (!) on currentUser.uid since it is guarded by !!currentUser?.uid
  const isConnected = !!currentUser?.uid && (profile?.connections?.includes(currentUser.uid!) ?? false);
  // The connect button should only be visible if NOT connected, NOT already sent a request, and NOT pending a request FROM this user.

  return (
    <div className="min-h-screen py-16 px-4 mt-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Link to="/community" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition mb-6">
            <FaArrowLeft className="mr-2" /> Back to Community
        </Link>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-3 shadow-lg">
            <FaExclamationTriangle />
            <span className="block sm:inline">{error}</span>
          </div>
        ) : profile ? (
          <div className="bg-white shadow-2xl rounded-xl overflow-hidden p-6 sm:p-10">
            
            {/* Header & Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
              <div className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-indigo-500/50 overflow-hidden shadow-lg">
                {profile.photoURL ? (
                    // ADDED onClick to open modal
                  <img 
                        src={profile.photoURL} 
                        alt={`${profile.firstName}'s avatar`}
                        loading="lazy"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                        onClick={openImageModal}
                    />
                ) : (
                  <FaUserCircle className="text-gray-500 w-3/4 h-3/4" />
                )}
              </div>
              
              <div className="text-center sm:text-left pt-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                {/* Role */}
                <p className="mt-1 text-xl text-indigo-600 font-semibold flex items-center justify-center sm:justify-start gap-2">
                    <FaBriefcase className='text-lg' />
                    {profile.role || 'Community Member'}
                </p>

                {/* 🚀 UPDATED: Target Countries Display 🚀 */}
                {profile.targetCountries && profile.targetCountries.length > 0 && (
                    <div className="mt-2 text-md text-gray-500 flex items-start justify-center sm:justify-start gap-2">
                        <FaMapMarkerAlt className='text-base mt-1 flex-shrink-0' />
                        <p>Aspiring to: 
                            <span className="font-medium text-gray-700 block sm:inline">
                                {profile.targetCountries.join(', ')}
                            </span>
                        </p>
                    </div>
                )}
                
                <div className="mt-4 flex flex-col sm:flex-row justify-center sm:justify-start gap-3">
                    {/* CONDITIONAL RENDERING FOR MESSAGE/CONNECT BUTTONS */}
                    {isConnected ? (
                        // User IS connected: Show Send Message Button
                        <Link 
                            to={`/chat/${profile.id}`} 
                            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 transition"
                        >
                            <FaEnvelope className="mr-2" /> Send Message
                        </Link>
                    ) : isRequestSent ? (
                        // Connection request has been sent BY THE VIEWER
                        <span className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 bg-gray-200 cursor-default">
                          <FaCheckCircle className="mr-2" /> Request Sent
                        </span>
                    ) : isPendingRequestFromThisUser ? (
                        // Connection request has been sent TO THE VIEWER
                        <Link 
                            to="/community" 
                            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-300 hover:bg-yellow-400 transition"
                        >
                            <FaEnvelope className="mr-2" /> Accept Request in Community
                        </Link>
                    ) : (
                        // User IS NOT connected and no request sent: Show Connect Button
                        <button 
                            onClick={handleConnect}
                            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
                        >
                            <FaUserPlus className="mr-2" /> Connect
                        </button>
                    )}
                </div>
              </div>
            </div>
            
            {/* Bio Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">About Me</h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {profile.bio || `No public bio provided by ${profile.firstName}.`}
              </p>
            </section>
            
            {/* Connections & Activity Section */}
            <section className="mt-8 pt-4 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-3">
                  <FaUsers /> Connections <span className="text-indigo-600">({totalConnections})</span>
                </h2>
                
                {totalConnections > 0 ? (
                    <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {connectionsData.map((connection) => (
                            <li key={connection.uid} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                                <Link to={`/profile/${connection.uid}`} className="block p-3 text-center">
                                    <FaUserCircle className="w-8 h-8 mx-auto text-gray-400" />
                                    <p className="mt-1 text-sm font-medium text-gray-800 truncate">
                                        {connection.firstName} {connection.lastName}
                                    </p>
                                </Link>
                            </li>
                        ))}
                        {/* Optionally, display the remaining count if the list is too long */}
                        {profile.connections && profile.connections.length > connectionsData.length && (
                            <li className="flex items-center justify-center p-3 text-sm text-gray-500 bg-gray-50 border rounded-lg italic">
                                + {profile.connections.length - connectionsData.length} more
                            </li>
                        )}
                    </ul>
                ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-500 italic">
                        <p>{profile.firstName} does not have any public connections yet.</p>
                    </div>
                )}
            </section>

          </div>
        ) : (
             <div className="text-center py-12 bg-white shadow-xl rounded-xl">
                <FaExclamationTriangle className='mx-auto h-12 w-12 text-yellow-500'/>
                <h3 className="mt-2 text-xl font-medium text-gray-900">User Not Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    The requested user profile could not be found or may be private.
                </p>
            </div>
        )}
      </div>

      {/* Image Modal Component */}
      {isImageModalOpen && profile?.photoURL && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal} // Close modal when clicking outside the image
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}> {/* Prevent modal close when clicking image */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition z-10"
              aria-label="Close image"
            >
              <FaTimes />
            </button>
            <img 
              src={profile.photoURL} 
              alt={`${profile.firstName}'s avatar (full size)`} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;