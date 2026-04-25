import { useState, useEffect, useCallback } from 'react';
import type { Group } from '../types/Group';
import type { User } from 'firebase/auth';
import { fetchMyGroups } from '../services/groupService';

export const useUserGroups = (currentUser: User | null | undefined, token: string | null) => {
    const [userGroups, setUserGroups] = useState<Group[]>([]);

    const fetchUserGroups = useCallback(async () => {
        if (!currentUser || !token) return;
        try {
            const groups = await fetchMyGroups(currentUser.uid, token);
            setUserGroups(groups);
        } catch (error) {
            console.error('Error fetching user groups:', error);
        }
    }, [currentUser, token]);
    
    useEffect(() => {
        fetchUserGroups();
    }, [fetchUserGroups]);

    return { userGroups, fetchUserGroups };
};