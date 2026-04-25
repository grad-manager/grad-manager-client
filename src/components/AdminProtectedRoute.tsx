import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shouldRestrictAppAccess } from '../utils/trial';

const AdminProtectedRoute: React.FC = () => {
    const { currentUser, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; 
    }

    if (currentUser && shouldRestrictAppAccess(userProfile)) {
        const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
        return (
            <Navigate
                to={`/subscribe?reason=trial-expired&next=${encodeURIComponent(redirectTarget)}`}
                replace
                state={{ from: redirectTarget }}
            />
        );
    }

    return currentUser && userProfile?.role === 'admin' ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export default AdminProtectedRoute;
