/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { shouldRestrictAppAccess } from '../../utils/trial';
import NotificationDropdown from './NotificationDropdown';

const API_URL = import.meta.env.VITE_API_URL;

const NotificationBell: React.FC = () => {
    const { token, userProfile } = useAuth();
    const isSubscriptionLocked = shouldRestrictAppAccess(userProfile);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [mentorRequests, setMentorRequests] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    const resetBellState = useCallback(() => {
        setNotifications([]);
        setMentorRequests([]);
        setUnreadCount(0);
        setIsLoading(false);
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!token || isSubscriptionLocked) {
            resetBellState();
            return;
        }

        setIsLoading(true);
        try {
            const notifResponse = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const nextNotifications = notifResponse.data || [];
            setNotifications(nextNotifications);

            let unread = nextNotifications.filter((notification: any) => !notification.read).length;

            if (userProfile?.role === 'mentor') {
                const requestsResponse = await axios.get(`${API_URL}/mentors/requests`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const nextRequests = requestsResponse.data || [];
                setMentorRequests(nextRequests);
                unread += nextRequests.length;
            } else {
                setMentorRequests([]);
            }

            setUnreadCount(unread);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                resetBellState();
            } else {
                console.error('Error fetching data:', error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, isSubscriptionLocked, userProfile?.role, resetBellState]);

    const handleMarkAllAsRead = useCallback(async () => {
        const hasUnreadNotifications = notifications.some((notification) => !notification.read);
        if (!token || isSubscriptionLocked || !hasUnreadNotifications) return;

        try {
            await axios.put(`${API_URL}/notifications/mark-as-read`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
            setUnreadCount(mentorRequests.length);
        } catch (error) {
            if (!(axios.isAxiosError(error) && error.response?.status === 403)) {
                console.error('Error marking notifications as read:', error);
            }
        }
    }, [token, isSubscriptionLocked, notifications, mentorRequests.length]);

    const handleMarkSingleAsRead = useCallback(async (notificationId: string) => {
        if (!token || isSubscriptionLocked) return;

        try {
            await axios.put(`${API_URL}/notifications/${notificationId}/mark-as-read`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setNotifications((prev) => {
                const wasUnread = prev.find((notification) => notification._id === notificationId && !notification.read);
                if (wasUnread) {
                    setUnreadCount((count) => Math.max(0, count - 1));
                }

                return prev.map((notification) =>
                    notification._id === notificationId ? { ...notification, read: true } : notification
                );
            });
        } catch (error) {
            if (!(axios.isAxiosError(error) && error.response?.status === 403)) {
                console.error('Error marking single notification as read:', error);
            }
        }
    }, [token, isSubscriptionLocked]);

    const handleAcceptRequest = useCallback(async (id: string) => {
        if (!token || isSubscriptionLocked || !id) return;

        try {
            await axios.post(
                `${API_URL}/mentors/accept`,
                { requestId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchNotifications();
            alert('Request accepted successfully!');
        } catch (error) {
            if (!(axios.isAxiosError(error) && error.response?.status === 403)) {
                console.error('Error accepting request:', error);
                alert('Failed to accept request.');
            }
        }
    }, [token, isSubscriptionLocked, fetchNotifications]);

    const handleDeclineRequest = useCallback(async (requestId: string) => {
        if (!token || isSubscriptionLocked) return;

        try {
            await axios.post(
                `${API_URL}/mentors/decline`,
                { requestId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchNotifications();
            alert('Request declined.');
        } catch (error) {
            if (!(axios.isAxiosError(error) && error.response?.status === 403)) {
                console.error('Error declining request:', error);
                alert('Failed to decline request.');
            }
        }
    }, [token, isSubscriptionLocked, fetchNotifications]);

    useEffect(() => {
        void fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);

        if (nextOpen && notifications.some((notification) => !notification.read)) {
            void handleMarkAllAsRead();
        }
    };

    const handleCloseDropdown = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-full text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
            >
                <FaBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <NotificationDropdown
                        notifications={notifications}
                        mentorRequests={mentorRequests}
                        isLoading={isLoading}
                        onClose={handleCloseDropdown}
                        onAcceptRequest={handleAcceptRequest}
                        onDeclineRequest={handleDeclineRequest}
                        userRole={userProfile?.role || 'user'}
                        onMarkAsRead={handleMarkSingleAsRead}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
