// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shouldRestrictAppAccess } from '../utils/trial';

const LOCK_ALLOWED_PATHS = new Set(['/settings/billing']);

const ProtectedRoute: React.FC = () => {
    // 🚨 FIX: Destructure both currentUser AND loading state
    const { currentUser, userProfile, loading } = useAuth(); 
    const location = useLocation();

    // 1. CRITICAL: While loading, show a placeholder screen.
    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                fontSize: '24px',
                color: '#333'
            }}>
                Loading session...
            </div>
        );
    }

    // 2. ALLOW: If loading is done and user is logged in
    if (currentUser) {
        if (shouldRestrictAppAccess(userProfile)) {
            if (LOCK_ALLOWED_PATHS.has(location.pathname)) {
                return <Outlet />;
            }

            const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
            return (
                <Navigate
                    to={`/subscribe?reason=trial-expired&next=${encodeURIComponent(redirectTarget)}`}
                    replace
                    state={{ from: redirectTarget }}
                />
            );
        }

        return <Outlet />;
    }

    // 3. REDIRECT: If loading is done and user is NOT logged in
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
