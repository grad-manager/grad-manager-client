// src/hooks/useSOPStats.ts

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth'; // Assuming Firebase User type

// Interface matching the structure expected by SOPRequestForm and App.tsx
export interface UserSOPStats {
    currentRequestCount: number;
    plan: string; // User's subscription plan (Free, Premium, Pro)
}

interface UseSOPStatsResult {
    userSOPStats: UserSOPStats | undefined;
    loading: boolean;
    error: Error | null;
    fetchStats: () => Promise<void>;
}

/**
 * Custom hook to fetch the user's Statement of Purpose (SOP) service usage statistics.
 * This determines the remaining free requests and premium status.
 * * @param currentUser The current authenticated Firebase user.
 * @param token The user's authentication token.
 * @returns An object containing the SOP stats, loading state, error, and a refetch function.
 */
export const useSOPStats = (currentUser: User | null | undefined, token: string | null): UseSOPStatsResult => {
    // Start with undefined/null data to simulate the loading state
    const [userSOPStats, setUserSOPStats] = useState<UserSOPStats | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchStats = async () => {
        if (!currentUser || !token) {
            // Set to default when logged out, but still "loaded"
            setUserSOPStats({ currentRequestCount: 0, plan: 'Free' });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 🚨 REPLACE THIS WITH YOUR ACTUAL API CALL 🚨
            
            // Placeholder: Simulate API latency
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // Placeholder: Mock data returned from the backend
            const mockData: UserSOPStats = {
                currentRequestCount: 1, // User has used 1 request
                plan: 'Free', // User's subscription plan
            };

            setUserSOPStats(mockData);

        } catch (err) {
            console.error("Failed to fetch SOP stats:", err);
            setError(err as Error);
            setUserSOPStats(undefined); // Reset on error

        } finally {
            setLoading(false);
        }
    };

    // Fetch stats whenever the user or token changes
    useEffect(() => {
        fetchStats();
    }, [currentUser?.uid, token]); // eslint-disable-line react-hooks/exhaustive-deps

    // We omit fetchStats from the dependency array because it's only called on mount/user change, 
    // but include the disable line above to silence the warning.
    
    return {
        userSOPStats,
        loading,
        error,
        fetchStats,
    };
};