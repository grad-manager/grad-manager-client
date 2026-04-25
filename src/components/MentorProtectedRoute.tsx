// src/components/MentorProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shouldRestrictAppAccess } from '../utils/trial';

const MentorProtectedRoute: React.FC = () => {
    const { currentUser, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // You might want a better loading state here
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

    // Check if the user is authenticated and has the 'mentor' role
    if (userProfile && userProfile.role === 'mentor') {
        return <Outlet />;
    } else {
        // Redirect to a dashboard or a page showing an error
        return <Navigate to="/" replace />;
    }
};

export default MentorProtectedRoute;
