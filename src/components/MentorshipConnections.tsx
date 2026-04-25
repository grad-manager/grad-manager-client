import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUserTie, FaSpinner, FaTrashAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface Connection {
    id: string;
    menteeName: string;
    mentorName?: string; // Optional for mentor view
    status: 'pending' | 'accepted' | 'declined' | 'revoked';
    createdAt: string;
}

const MentorshipConnections: React.FC = () => {
    const { token, userProfile } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !userProfile) return;

        const fetchConnections = async () => {
            let endpoint = '';
            if (userProfile.role === 'admin') {
                endpoint = `${API_URL}/admin/mentorship/connections`;
            } else if (userProfile.role === 'mentor') {
                endpoint = `${API_URL}/mentors/connections`;
            } else {
                setError('You do not have permission to view this page.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get<Connection[]>(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setConnections(response.data);
            } catch (err) {
                console.error('Failed to fetch connections:', err);
                setError('Failed to load connections. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, [token, userProfile]);

    const handleRevokeConnection = async (connectionId: string) => {
        if (!window.confirm('Are you sure you want to revoke this mentorship connection? This action cannot be undone.')) {
            return;
        }

        let endpoint = '';
        if (userProfile?.role === 'admin') {
            endpoint = `${API_URL}/admin/mentorship/connections/${connectionId}`;
        } else if (userProfile?.role === 'mentor') {
            endpoint = `${API_URL}/mentors/connections/${connectionId}`;
        } else {
            return;
        }

        try {
            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConnections(prevConnections => 
                prevConnections.filter(conn => conn.id !== connectionId)
            );
            alert('Mentorship connection revoked successfully.');
        } catch (err) {
            console.error('Failed to revoke connection:', err);
            alert('Failed to revoke connection. Please try again.');
        }
    };

    const renderConnectionStatus = (status: Connection['status']) => {
        switch (status) {
            case 'accepted':
                return <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">Accepted</span>;
            case 'pending':
                return <span className="px-3 py-1 text-sm font-semibold text-yellow-700 bg-yellow-100 rounded-full">Pending</span>;
            case 'revoked':
                return <span className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">Revoked</span>;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-24">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                {userProfile?.role === 'admin' ? 'All Mentorship Connections' : 'My Mentorship Connections'}
            </h1>
            
            {loading && (
                <div className="flex items-center justify-center p-8">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            )}
            
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {connections.length > 0 ? (
                            connections.map(connection => (
                                <li key={connection.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {userProfile?.role === 'admin' && (
                                            <FaUserTie className="text-purple-600 text-2xl" />
                                        )}
                                        <FaGraduationCap className="text-blue-600 text-2xl" />
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {userProfile?.role === 'admin'
                                                    ? `Mentee: ${connection.menteeName} | Mentor: ${connection.mentorName}`
                                                    : `Mentee: ${connection.menteeName}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Request Date: {new Date(connection.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {renderConnectionStatus(connection.status)}
                                        {connection.status === 'accepted' && (
                                            <button
                                                onClick={() => handleRevokeConnection(connection.id)}
                                                className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200 rounded-full"
                                                aria-label="Revoke connection"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No connections found.
                            </div>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MentorshipConnections;