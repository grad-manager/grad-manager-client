// src/hooks/useApplications.ts

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Application } from '../types/Application';
import type { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import type { User } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL;

const statusColumns = ['Interested', 'Submitted', 'Accepted', 'Rejected'];

interface UseApplicationsReturn {
    applications: Application[];
    loading: boolean;
    upcomingDeadlines: Application[];
    applicationsByStatus: Record<string, Application[]>;
    fetchApplications: () => Promise<void>; // This is the refresh function
    // ✅ FIX 1: Renamed 'handleApplicationDeleted' to 'deleteApplication' 
    deleteApplication: (id: string) => void; 
    onDragEnd: (result: DropResult) => Promise<void>;
    handleRequestSOPWriting: (applicationId: string) => Promise<void>;
}

export const useApplications = (currentUser: User | null | undefined, token: string | null): UseApplicationsReturn => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<Application[]>([]);
    
    // The core function to fetch and refresh the state
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get<Application[]>(`${API_URL}/applications/${currentUser?.uid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, token]);

    useEffect(() => {
        if (currentUser && token) {
            fetchApplications();
        } else {
            setApplications([]);
            setLoading(false);
        }
    }, [currentUser, token, fetchApplications]); 

    useEffect(() => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const upcoming = applications
            .filter(app =>
                app.deadline && new Date(app.deadline) > today && new Date(app.deadline) <= sevenDaysFromNow
            )
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

        setUpcomingDeadlines(upcoming);
    }, [applications]);

    // ✅ FIX 2: Renamed function body to 'deleteApplication'
    const deleteApplication = (id: string) => {
        // Optimistically remove the application locally
        setApplications(applications.filter(app => app._id !== id));

        // NOTE: In a production app, you would add an axios.delete call here
    };

    const handleRequestSOPWriting = useCallback(async (applicationId: string) => {
        if (!token) return;
        try {
            await axios.post(`${API_URL}/services/sop-request`, { applicationId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Statement of Purpose writing request sent successfully!');
            fetchApplications(); 
        } catch (error) {
            console.error('Error requesting SOP writing:', error);
            toast.error('Failed to send SOP writing request. Please try again.');
            throw error;
        }
    }, [token, fetchApplications]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }
        
        const updatedApplication = applications.find(app => String(app._id) === draggableId);
        if (!updatedApplication || !token) return;
        
        const newStatus = destination.droppableId as Application['status'];
        
        const newApplications = applications.map(app =>
            String(app._id) === draggableId ? { ...app, status: newStatus } : app
        );
        
        // Optimistic State Update
        setApplications(newApplications);
        
        try {
            await axios.put(`${API_URL}/applications/${draggableId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Failed to update application status:', err);
            // Revert state if update fails
            fetchApplications(); 
            toast.error('Failed to update application status. Please try again.');
        }
    };

    const applicationsByStatus = statusColumns.reduce((acc, status) => {
        const lowerStatus = status.toLowerCase();
        acc[status] = applications.filter(app => (app.status || '').toLowerCase() === lowerStatus);
        return acc;
    }, {} as Record<string, Application[]>);

    return {
        applications,
        loading,
        upcomingDeadlines,
        applicationsByStatus,
        fetchApplications, // <-- The function needed for refresh
        // ✅ FIX 3: Renamed the property name in the return object
        deleteApplication, 
        onDragEnd,
        handleRequestSOPWriting,
    };
};