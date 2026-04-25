import React from 'react';

const DashboardSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-pulse">
        {['Interested', 'Applying', 'Submitted', 'Accepted', 'Rejected'].map((status) => (
            <div key={status} className="bg-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="h-6 w-3/4 bg-gray-200 rounded-md mb-4"></div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm mb-4 h-28"></div>
                ))}
            </div>
        ))}
    </div>
);

export default DashboardSkeleton;