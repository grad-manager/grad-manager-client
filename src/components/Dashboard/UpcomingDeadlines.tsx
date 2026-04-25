import React from 'react';
import type { Application } from '../../types/Application';
import { FaCalendarPlus } from 'react-icons/fa';

interface UpcomingDeadlinesProps {
    upcomingDeadlines: Application[];
    getDaysUntil: (deadline: string) => number;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ upcomingDeadlines, getDaysUntil }) => {
    return (
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-10 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaCalendarPlus className="mr-2 text-blue-500" />
                Upcoming Deadlines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingDeadlines.map(app => (
                    <div key={app._id} className="bg-blue-50 rounded-xl p-4 sm:p-6 shadow-sm border border-blue-100 transition-all duration-300 transform hover:scale-[1.02]">
                        <h3 className="text-lg font-semibold text-blue-800">{app.schoolName}</h3>
                        <p className="text-gray-600 text-sm mt-1">{app.programName}</p>
                        <div className="mt-4 flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-500">
                                {app.deadline ? new Date(app.deadline).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
                                {getDaysUntil(app.deadline) === 0 ? 'Today!' : `${getDaysUntil(app.deadline)} days left`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingDeadlines;