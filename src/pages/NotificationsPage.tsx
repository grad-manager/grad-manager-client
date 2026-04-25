import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationItem from '../components/common/NotificationItem';

const API_URL = import.meta.env.VITE_API_URL;

interface Notification {
    _id?: string;
    id?: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
    relatedEntityId?: string;
    url?: string;
}

const NotificationsPage: React.FC = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        const fetchNotifications = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotifications(response.data || []);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError('Failed to load notifications.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    const handleNavigate = async (notification: Notification) => {
        const id = notification._id || notification.id;
        if (!id || !token) return;
        if (!notification.read) {
            try {
                await axios.put(`${API_URL}/notifications/${id}/mark-as-read`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setNotifications((prev) =>
                    prev.map((item) =>
                        (item._id || item.id) === id ? { ...item, read: true } : item
                    )
                );
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500">
                        {notifications.length} total
                    </p>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-10 text-gray-600">
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Loading notifications...
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-lg bg-red-50 text-red-600 p-4 text-sm">
                        {error}
                    </div>
                )}

                {!isLoading && !error && notifications.length === 0 && (
                    <div className="rounded-lg bg-white border border-gray-200 p-8 text-center text-gray-500">
                        You have no notifications yet.
                    </div>
                )}

                {!isLoading && !error && notifications.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification._id || notification.id}
                                notification={{
                                    _id: (notification._id || notification.id) as string,
                                    type: notification.type as any,
                                    message: notification.message,
                                    read: notification.read,
                                    createdAt: notification.createdAt,
                                    relatedEntityId: notification.relatedEntityId,
                                }}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
