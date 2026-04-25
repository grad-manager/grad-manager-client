// src/components/AdminRoleManagement.tsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; // Your configured Axios instance

const AdminRoleManagement: React.FC = () => {
    const { userProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        // The backend's `isAdmin` middleware will handle the real security check.
        // This is a simple client-side check for user experience.
        if (userProfile?.role !== 'admin') {
            setMessage('Error: You do not have permission to perform this action.');
            return;
        }

        try {
            const response = await api.post('/api/admin/set-user-role', { email, role });
            setMessage(response.data.message);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setMessage(`Error: ${error.response?.data?.message || 'Failed to update user role.'}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Set User Role</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">User Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Update Role
                </button>
            </form>
            {message && <p className="mt-4 text-center text-sm font-medium">{message}</p>}
        </div>
    );
};

export default AdminRoleManagement;