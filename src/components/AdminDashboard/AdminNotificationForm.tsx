import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

// Define the possible types for strong typing
type NotificationType = 'global_info' | 'global_warning' | 'global_alert' | 'global_success';

const AdminNotificationForm: React.FC = () => {
    const { token } = useAuth();
    const [message, setMessage] = useState('');
    // NEW: State for the notification type, matching backend's expected values
    const [type, setType] = useState<NotificationType>('global_info');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('');
        setError('');
        setIsSending(true);

        if (!token) {
            setError('Authentication token is missing. Please log in again.');
            setIsSending(false);
            return;
        }

        try {
            await axios.post(
                `${API_URL}/notifications/admin`,
                // UPDATED: Send the selected type along with the message
                { message, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus('Global notification sent successfully!');
            setMessage('');
            // Keep the selected type for convenience, or reset to 'global_info'
            // setType('global_info'); 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error sending notification:', err);
            setError(err.response?.data?.message || 'Failed to send notification.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Send Global Notification</h2>
            <form onSubmit={handleSubmit}>
                {/* NEW: Notification Type Selection Field */}
                <div className="mb-4">
                    <label htmlFor="notificationType" className="block text-gray-700 font-medium mb-2">
                        Notification Urgency
                    </label>
                    <select
                        id="notificationType"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        value={type}
                        // Cast the event target value to the strong type
                        onChange={(e) => setType(e.target.value as NotificationType)} 
                        required
                    >
                        <option value="global_info">Info (Standard)</option>
                        <option value="global_success">Success (Positive Update)</option>
                        <option value="global_warning">Warning (Maintenance/Caution)</option>
                        <option value="global_alert">Alert (Urgent Action/Issue)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="notificationMessage" className="block text-gray-700 font-medium mb-2">
                        Message to all users
                    </label>
                    <textarea
                        id="notificationMessage"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your message here..."
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    disabled={!message.trim() || isSending}
                >
                    {isSending ? 'Sending...' : 'Send Notification'}
                </button>
            </form>
            {status && <p className="mt-4 text-green-600 font-semibold">{status}</p>}
            {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
        </div>
    );
};

export default AdminNotificationForm;