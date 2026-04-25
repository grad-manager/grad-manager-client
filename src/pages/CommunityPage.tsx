// This is the beginning of CommunityPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TrialBanner from '../components/TrialBanner';
import {
  FaUserCircle,
  FaUsers,
  FaPlusCircle,
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaRocket,
  FaEnvelopeOpenText,
} from 'react-icons/fa';
import { IoIosChatbubbles } from 'react-icons/io';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, type DocumentData } from 'firebase/firestore';
import { fetchMyGroups, fetchAllGroups, joinGroup, createGroup, type Group } from '../services/groupService';

const API_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface User {
  id: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  role?: string;
}

interface ConnectionRequest {
  requestId: string;
  sender: User;
  status: 'pending' | 'accepted' | 'decline';
  createdAt: string;
}

interface GroupJoinRequest {
  requestId: string;
  sender: User;
  group: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// NOTE: The 'SentRequest' interface from your prompt was only an abstract object.
// I'm updating it here to match the recipient object received from the backend, 
// though the logic only uses the recipient ID, so we can simplify the declaration
// to align with the actual data structure in the `useEffect`.
interface SentRequest { 
    requestId: string;
    recipient: User; 
    status: 'pending' | 'accepted' | 'decline';
    createdAt: string;
}
// --- END Interfaces ---

// --- Service Function ---
const fetchPendingGroupRequests = async (token: string): Promise<GroupJoinRequest[]> => {
  const response = await axios.get(`${API_URL}/groups/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.requests;
};
// --- END Service Function ---

// --- Reusable User Avatar Display Component ---
const UserAvatarDisplay: React.FC<{ user: User; size?: 'small' | 'medium' | 'large' }> = ({ user, size = 'medium' }) => {
  let classes = 'rounded-full object-cover';
  let iconSize = 40;

  switch (size) {
    case 'small':
      classes += ' w-8 h-8';
      iconSize = 28;
      break;
    case 'large':
      // REVISION: Set to full width/height to fill the parent container (the ring wrapper)
      classes += ' w-full h-full';
      iconSize = 64; // Set a large icon size for the fallback
      break;
    case 'medium':
    default:
      classes += ' w-10 h-10 sm:w-12 sm:h-12';
      iconSize = 40;
      break;
  }

  if (user.photoURL) {
    return <img src={user.photoURL} alt={`${user.firstName} avatar`} className={classes} loading="lazy" />;
  }

  // Ensure the icon is centered and contained within the parent element.
  return <FaUserCircle size={iconSize} className={`text-slate-500 ${classes}`} />;
};
// --- END Reusable User Avatar Display Component ---


const CommunityPage: React.FC = () => {
  const { currentUser, token, userProfile } = useAuth();
  const [connections, setConnections] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [pendingGroupRequests, setPendingGroupRequests] = useState<GroupJoinRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // Array of recipient IDs
  const [sentGroupRequests, setSentGroupRequests] = useState<string[]>([]);
  const [unreadChatCounts, setUnreadChatCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'friends' | 'community' | 'groups'>('friends');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching and Realtime Listener (UPDATED LOGIC HERE) ---
  useEffect(() => {
    if (!currentUser?.uid || !token) {
      setLoading(false);
      setError('User not authenticated.');
      return;
    }

    const fetchData = async () => {
      try {
        const [connectionsResponse, myGroupsData, allUsersResponse, allGroupsData, pendingGroupRequestsData] =
          await Promise.all([
            axios.get(`${API_URL}/connections`, { headers: { Authorization: `Bearer ${token}` } }),
            fetchMyGroups(currentUser.uid, token),
            axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
            fetchAllGroups(token),
            fetchPendingGroupRequests(token)
          ]);

        const connectionsData: User[] = connectionsResponse.data.acceptedConnections || [];
        const pendingRequestsData: ConnectionRequest[] = connectionsResponse.data.pendingRequests || [];
        
        // **CRITICAL UPDATE: GET SENT REQUESTS FROM BACKEND**
        const sentRequestsData: SentRequest[] = connectionsResponse.data.sentRequests || [];
        const sentRequestUserIds = sentRequestsData.map((req) => req.recipient.id);
        
        setConnections(connectionsData);
        setGroups(myGroupsData);
        setPendingRequests(pendingRequestsData);
        setPendingGroupRequests(pendingGroupRequestsData);
        setSentRequests(sentRequestUserIds); // Set the array of IDs for quick lookup

        const allUsersData: User[] = allUsersResponse.data || [];
        
        // Consolidate IDs to filter out
        const connectedUserIds = new Set([
          ...connectionsData.map((conn) => conn.id),
          ...sentRequestUserIds,                                 // Requests sent BY me
          ...pendingRequestsData.map((req) => req.sender.id),    // Requests sent TO me
          currentUser.uid
        ]);
        
        // Filter out users who are connected, have a pending request with the user, or are the user themselves
        setAllUsers(allUsersData.filter((user) => !connectedUserIds.has(user.id)));

        const myGroupsIds = new Set(myGroupsData.map((g) => g.id));
        const availableGroups = (allGroupsData.groups || []).filter(
          (g: Group) => !myGroupsIds.has(g.id) && !(allGroupsData.sentRequests || []).includes(g.id)
        );
        setAllGroups(availableGroups);
        setSentGroupRequests(allGroupsData.sentRequests || []);
      } catch (err) {
        console.error('Failed to fetch community data:', err);
        setError('Failed to load community data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // --- Realtime Chat Listener ---
    const q = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUnreadCounts: { [key: string]: number } = {};
      querySnapshot.forEach((doc) => {
        const chatData = doc.data() as DocumentData;
        const chatId = doc.id;
        const lastReadTimestamp = chatData.lastRead?.[currentUser.uid]?.toDate();
        const updatedAtTimestamp = chatData.updatedAt?.toDate();

        let unreadCount = 0;
        if (updatedAtTimestamp && (!lastReadTimestamp || updatedAtTimestamp > lastReadTimestamp)) {
          // This logic typically indicates one unread message/activity. 
          // For a more accurate count, you would query the 'messages' subcollection.
          // Keeping the current simple implementation for consistency.
          unreadCount = 1; 
        }
        fetchedUnreadCounts[chatId] = unreadCount;
      });
      setUnreadChatCounts(fetchedUnreadCounts);
    },
      (error) => console.error('Error fetching real-time chat data:', error)
    );

    return () => unsubscribe();
  }, [currentUser, token]);
  // --- END Data Fetching and Realtime Listener ---

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // --- Handlers ---
  const handleConnectRequest = useCallback(async (recipientId: string) => {
    if (!currentUser?.uid || !token) {
      setError('Authentication is required.');
      return;
    }
    try {
      await axios.post(`${API_URL}/connections/request/${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // OPTIMISTIC UPDATE: Add the recipient ID to sentRequests immediately
      setSentRequests((prev) => [...prev, recipientId]);
      
      // OPTIMISTIC UPDATE: Also remove the user from the discoverable list (allUsers)
      setAllUsers((prev) => prev.filter(user => user.id !== recipientId));

    } catch (err) {
      console.error('Failed to send connection request:', err);
      alert('Failed to send connection request.');
      // If the API failed, a full re-fetch/sync would be safer, 
      // but for simplicity, we'll rely on the existing refresh mechanism.
    }
  }, [currentUser, token]);

  const handleAcceptRequest = useCallback(async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/connections/accept/${requestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const acceptedRequest = pendingRequests.find((req) => req.requestId === requestId);
      if (acceptedRequest) {
        setConnections((prev) => [...prev, acceptedRequest.sender]);
        setPendingRequests((prev) => prev.filter((req) => req.requestId !== requestId));
        // Remove the newly connected user from the general discoverable list
        setAllUsers((prev) => prev.filter((user) => user.id !== acceptedRequest.sender.id));
      }
    } catch (err) {
      console.error('Failed to accept connection request:', err);
    }
  }, [token, pendingRequests]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/connections/decline/${requestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const declinedRequest = pendingRequests.find((req) => req.requestId === requestId);
      if (declinedRequest) {
          // The sender of the declined request should now be visible in 'allUsers'
          setAllUsers((prev) => [...prev, declinedRequest.sender]);
      }
      setPendingRequests((prev) => prev.filter((req) => req.requestId !== requestId));
    } catch (err) {
      console.error('Failed to decline connection request:', err);
    }
  }, [token, pendingRequests]);

  const handleApproveGroupRequest = useCallback(async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/groups/requests/${requestId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPendingGroupRequests((prev) => prev.filter((req) => req.requestId !== requestId));
      // No need to update the `groups` state here, as the Firestore listener will handle the new group member status
    } catch (err) {
      console.error('Failed to approve group join request:', err);
    }
  }, [token]);

  const handleDeclineGroupRequest = useCallback(async (requestId: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/groups/requests/${requestId}/decline`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPendingGroupRequests((prev) => prev.filter((req) => req.requestId !== requestId));
    } catch (err) {
      console.error('Failed to decline group join request:', err);
    }
  }, [token]);

  const handleCreateGroup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0 || !token) {
      alert('Group name and members are required.');
      return;
    }
    setIsCreatingGroup(true);
    try {
      const response = await createGroup(newGroupName, selectedMembers, token);
      // OPTIMISTIC UPDATE: Add the new group
      setGroups((prev) => [...prev, { id: response.groupId, name: newGroupName }]);
      setActiveTab('groups');
      setNewGroupName('');
      setSelectedMembers([]);
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Failed to create group.');
    } finally {
      setIsCreatingGroup(false);
    }
  }, [newGroupName, selectedMembers, token]);

  const handleToggleMember = useCallback((userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleJoinGroup = useCallback(async (groupId: string) => {
    if (!token) return;
    try {
      await joinGroup(groupId, token);
      // OPTIMISTIC UPDATE: Add the group ID to sentGroupRequests
      setSentGroupRequests((prev) => [...prev, groupId]);
    } catch (err) {
      console.error('Failed to send group join request:', err);
      alert('Failed to send group join request.');
    }
  }, [token]);
  // --- END Handlers ---

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 z-50">
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-emerald-400" />
    </div>
  );
  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-12 mt-24 pb-4 sm:py-12 px-2 sm:px-4 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#ffffff80,_transparent_60%)] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          <main className="flex-1">
            <TrialBanner userProfile={userProfile} />
            <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 md:p-8 border border-indigo-200">
              <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-700 tracking-tight">
                  Connect and Chat
                </h1>
                <Link
                  to="/"
                  className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm sm:text-base font-semibold shadow-md transition"
                >
                  Back to Dashboard
                </Link>
              </header>

              {/* Tabs Navigation */}
              <nav className="mb-6 md:mb-8">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1 rounded-xl bg-pink-100 shadow-inner">
                  {
                    (['friends', 'community', 'groups'] as const).map(tab => {
                      const isActive = activeTab === tab;
                      let label = '';
                      let Icon = FaUserCircle;
                      let count = 0;

                      switch (tab) {
                        case 'friends':
                          label = 'Friends';
                          Icon = IoIosChatbubbles;
                          count = pendingRequests.length;
                          break;
                        case 'community':
                          label = 'Community';
                          Icon = FaRocket;
                          break;
                        case 'groups':
                          label = 'Groups';
                          Icon = FaUsers;
                          count = pendingGroupRequests.length;
                          break;
                      }

                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 sm:px-3 rounded-xl text-xs sm:text-sm md:text-base font-bold transition duration-200 transform hover:scale-[1.03] shadow-md
                            ${isActive
                              ? 'bg-[#4F46E5] text-white shadow-lg'
                              : 'bg-white text-slate-700 hover:bg-white/90'
                            } relative`}
                        >
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <Icon className='text-lg' />
                            <span>{label}</span>
                            {count > 0 && (
                              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white/80">
                                {count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  }
                </div>
              </nav>

              {/* Content area */}
              <div
                ref={contentRef}
                className="max-h-[60vh] overflow-y-auto p-2 sm:p-4 bg-rose-50 rounded-xl border border-pink-200/50 space-y-6"
              >

                {/* --- Friends Tab (Connections + Connection Requests) --- */}
                {activeTab === 'friends' && (
                  <section className="space-y-6">

                    {/* Connection Requests Section */}
                    {pendingRequests.length > 0 && (
                      <div className='bg-white rounded-xl p-4 shadow-lg border border-white/90'>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200 flex items-center gap-2">
                          <FaEnvelopeOpenText className='text-[#1F2937]' /> Connection Requests ({pendingRequests.length})
                        </h2>
                        <ul className="space-y-3">
                          {pendingRequests.map((request) => (
                            <li key={request.requestId} className="flex items-center justify-between p-3 bg-white/90 rounded-lg shadow-sm border border-slate-100">
                              <div className="flex items-center gap-4">
                                {/* Container for size='large' is now w-16 h-16/sm:w-20 sm:h-20 */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                                  <UserAvatarDisplay user={request.sender} size='large' />
                                </div>
                                <Link to={`/profile/${request.sender.id}`} className='group'>
                                  <p className="text-base sm:text-lg text-slate-900 font-semibold group-hover:text-indigo-600 transition">{request.sender.firstName} {request.sender.lastName}</p>
                                  {request.sender.role && <p className="text-sm text-slate-600">{request.sender.role}</p>}
                                </Link>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleAcceptRequest(request.requestId)} className="p-2 rounded-full bg-[#4F46E5] text-white hover:bg-[#3e35e9] transition shadow-md text-sm">
                                  <FaCheckCircle />
                                </button>
                                <button onClick={() => handleDeclineRequest(request.requestId)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition shadow-md text-sm">
                                  <FaTimesCircle />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Accepted Connections List Section */}
                    <div className='bg-white rounded-xl p-4 shadow-lg border border-white/90'>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200 flex items-center gap-2">
                        <IoIosChatbubbles className='text-[#4F46E5]' /> Friends
                      </h2>
                      {connections.length === 0 ? (
                        <div className="p-4 sm:p-8 bg-white/80 rounded-lg text-center shadow-inner text-slate-600">
                          <p className="mb-4">You haven't made any connections yet. Use the <strong>Community</strong> tab to find people!</p>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {connections.map((connection) => {
                            const chatId = [currentUser!.uid, connection.id].sort().join('_');
                            const unreadCount = unreadChatCounts[chatId] || 0;
                            return (
                              <li key={connection.id}>
                                <div
                                  className="flex items-center gap-5 p-3 rounded-xl bg-white shadow-sm border border-white/90 hover:shadow-lg transition duration-200"
                                >
                                  {/* RING REVISION: Avatar will now be w-full h-full, filling this container perfectly, with the ring applied to the container */}
                                  <Link to={`/profile/${connection.id}`} className="ring-4 ring-[#25D366]/50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                    <UserAvatarDisplay user={connection} size='large' />
                                  </Link>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <Link to={`/chat/${connection.id}`} className='group'>
                                        <p className="text-base sm:text-lg text-slate-900 font-bold truncate group-hover:text-indigo-600 transition">{connection.firstName} {connection.lastName}</p>
                                      </Link>
                                      {unreadCount > 0 && (
                                        <span className="bg-[#4F46E5] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                          {unreadCount}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">{connection.role || 'Member'}</p>
                                  </div>
                                  <Link
                                    to={`/chat/${connection.id}`}
                                    className='p-2 rounded-full text-white bg-green-500 hover:bg-green-600 transition shadow-md flex-shrink-0'
                                    aria-label={`Chat with ${connection.firstName}`}
                                  >
                                    <IoIosChatbubbles size={20} />
                                  </Link>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </section>
                )}


                {/* --- Community Tab (Find Users) --- */}
                {activeTab === 'community' && (
                  <section className="space-y-6">
                    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-white/90">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2 border-slate-200">
                        <FaUserPlus className='text-[#4F46E5]' /> Discover New Users & Connect
                      </h3>
                      <ul className="space-y-3">
                        {allUsers.length > 0 ? allUsers.map((user) => (
                          <li key={user.id} className="flex items-center justify-between bg-white/90 p-3 rounded-lg shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                              {/* Container for size='large' is now w-16 h-16/sm:w-20 sm:h-20 */}
                              <Link to={`/profile/${user.id}`} className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                                <UserAvatarDisplay user={user} size='large' />
                              </Link>
                              <Link to={`/profile/${user.id}`} className='group'>
                                <p className="text-base sm:text-lg text-slate-900 font-semibold group-hover:text-indigo-600 transition">{user.firstName} {user.lastName}</p>
                                {user.role && <p className="text-sm text-slate-600">{user.role}</p>}
                              </Link>
                            </div>
                            {/* **CRITICAL RENDERING LOGIC**: Check if user.id is in sentRequests */}
                            {sentRequests.includes(user.id) ? (
                              <span className="text-sm italic text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">Request Sent</span>
                            ) : (
                              <button
                                onClick={() => handleConnectRequest(user.id)}
                                className="bg-[#4F46E5] hover:bg-[#3f38b8] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition"
                              >
                                Connect
                              </button>
                            )}
                          </li>
                        )) : (
                          <p className="text-slate-600 text-center py-4">No new users to connect with.</p>
                        )}
                      </ul>
                    </div>
                  </section>
                )}


                {/* --- Groups Tab (All Group Functionality) --- */}
                {activeTab === 'groups' && (
                  <section className="space-y-6">
                    
                    {/* Create Group Card Section */}
                    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-white/90">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2 border-slate-200">
                        <FaPlusCircle className='text-[#4F46E5]' /> Start a New Group Chat
                      </h3>
                      <form onSubmit={handleCreateGroup} className="space-y-4">
                        <div>
                          <label htmlFor="groupName" className="text-sm font-medium text-slate-700 block mb-1">Group Name</label>
                          <input
                            id="groupName"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g., Spring Admission 2024 Prep"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm text-slate-900"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-800 mb-2">Invite Members (Connections)</h4>
                          <div className="h-32 overflow-y-auto space-y-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                            {connections.length > 0 ? connections.map((user) => (
                              <div key={user.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 flex-shrink-0"> {/* AVATAR SIZE UP slightly for compact list */}
                                    <UserAvatarDisplay user={user} /> 
                                  </div>
                                  <p className="text-base text-slate-900 font-medium">{user.firstName} {user.lastName}</p> {/* FONT SIZE UP */}
                                </div>
                                <input
                                  type="checkbox"
                                  checked={selectedMembers.includes(user.id)}
                                  onChange={() => handleToggleMember(user.id)}
                                  className="h-5 w-5 text-[#4F46E5] rounded focus:ring-[#835669]"
                                />
                              </div>
                            )) : (
                              <p className="text-slate-600 text-center py-4 text-sm">Connect with users first to create a group!</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isCreatingGroup || selectedMembers.length === 0 || !newGroupName.trim()}
                          className={`w-full py-2.5 rounded-xl font-bold transition shadow-md text-sm sm:text-base
                            ${isCreatingGroup || selectedMembers.length === 0 || !newGroupName.trim()
                              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                              : 'bg-[#4F46E5] hover:bg-[#7570cf] text-white shadow-[#25D366]/50'
                            }`}
                        >
                          {isCreatingGroup ? 'Creating Group...' : 'Create Group'}
                        </button>
                      </form>
                    </div>

                    {/* Group Join Requests Section: Only renders if pendingGroupRequests > 0 */}
                    {pendingGroupRequests.length > 0 && (
                        <div className='bg-white rounded-xl p-4 shadow-lg border border-white/90'>
                          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200 flex items-center gap-2">
                            <FaEnvelopeOpenText className='text-[#4F46E5]'/> Group Join Requests ({pendingGroupRequests.length})
                          </h2>
                          <ul className="space-y-3">
                            {pendingGroupRequests.map((request) => (
                              <li key={request.requestId} className="flex items-center justify-between p-3 bg-white/90 rounded-lg shadow-sm border border-slate-100">
                                <div className="flex items-center gap-4"> {/* INCREASED GAP */}
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"> {/* AVATAR SIZE UP */}
                                    <UserAvatarDisplay user={request.sender} />
                                  </div>
                                  <div>
                                    <p className="text-base sm:text-lg text-slate-900 font-semibold">{request.sender.firstName} {request.sender.lastName}</p> {/* FONT SIZE UP */}
                                    <p className="text-sm text-slate-600">wants to join &quot;{request.group.name}&quot;</p> {/* FONT SIZE UP */}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleApproveGroupRequest(request.requestId)} className="p-2 rounded-full bg-[#4F46E5] text-white hover:bg-[#403c92] transition shadow-md text-sm">
                                    <FaCheckCircle />
                                  </button>
                                  <button onClick={() => handleDeclineGroupRequest(request.requestId)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition shadow-md text-sm">
                                    <FaTimesCircle />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                    )}
                    
                    {/* Your Groups Section */}
                    <div className='bg-white rounded-xl p-4 shadow-lg border border-white/90'>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200 flex items-center gap-2">
                        <FaUsers className='text-[#4F46E5]'/> Your Groups
                      </h2>
                      {groups.length === 0 ? (
                        <div className="p-4 sm:p-8 bg-white/80 rounded-lg text-center shadow-inner text-slate-600">You are not a member of any groups.</div>
                      ) : (
                        <ul className="space-y-3">
                          {groups.map((group) => {
                            const unreadCount = unreadChatCounts[group.id] || 0;
                            return (
                              <li key={group.id}>
                                <Link
                                  to={`/group-chat/${group.id}`}
                                  className="flex items-center gap-5 p-3 rounded-xl bg-white shadow-sm border border-white/90 hover:shadow-lg transition duration-200"
                                >
                                  {/* This remains FaUsers as it represents the group itself */}
                                  <FaUsers size={40} className="text-[#4F46E5] w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" /> {/* ICON SIZE UP */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-base sm:text-lg text-slate-900 font-bold truncate">{group.name}</p> {/* FONT SIZE UP + BOLDER */}
                                      {unreadCount > 0 && (
                                        <span className="bg-[#4F46E5] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                          {unreadCount}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-500">View Chat & Members</p> {/* FONT SIZE UP */}
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Find Groups Section */}
                    <div className='bg-white rounded-xl p-4 shadow-lg border border-white/90'>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200 flex items-center gap-2">
                        <FaUsers className='text-[#4F46E5]'/> Find Other Public Groups
                      </h2>
                      {allGroups.length === 0 ? (
                        <div className="p-4 sm:p-8 bg-white/80 rounded-lg text-center shadow-inner text-slate-600">No new public groups available at the moment.</div>
                      ) : (
                        <ul className="space-y-3">
                          {allGroups.map((group) => (
                            <li key={group.id} className="flex items-center justify-between p-3 bg-white shadow-sm rounded-xl border border-white/90">
                              <div className="flex items-center gap-5"> {/* INCREASED GAP */}
                                {/* This remains FaUsers as it represents the group itself */}
                                <FaUsers size={40} className="text-slate-600 w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" /> {/* ICON SIZE UP */}
                                <div>
                                  <p className="text-base sm:text-lg text-slate-900 font-bold">{group.name}</p> {/* FONT SIZE UP + BOLDER */}
                                  <p className="text-sm text-slate-500">Public group</p> {/* FONT SIZE UP */}
                                </div>
                              </div>
                              <div>
                                {sentGroupRequests.includes(group.id) ? (
                                  <span className="text-sm italic text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">Request Sent</span>
                                ) : (
                                  <button
                                    onClick={() => handleJoinGroup(group.id)}
                                    className="bg-[#4F46E5] hover:bg-[#504abb] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition"
                                  >
                                    Request Join
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                )}
              </div>
            {/* FINAL CLOSING TAGS for main structure */}
            </div> 
          </main>
        </div>
      </div>
    </div>
  );
  };
  
  export default CommunityPage; // This must be a default export
