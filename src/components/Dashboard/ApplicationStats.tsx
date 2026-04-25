import React, { useState } from 'react';
import type { Application } from '../../types/Application';
import ApplicationStatusChart from '../ApplicationStatusChart';
import {
    FaSpinner,
    FaChartPie,
    FaCheckCircle,
    FaTimesCircle,
    FaPaperPlane,
    FaHourglassHalf,
    FaLightbulb,
    FaExchangeAlt,
} from 'react-icons/fa';
import ApplicationListModal from '../ApplicationListModal';

interface ApplicationStatsProps {
    applications: Application[];
    applicationsByStatus: Record<string, Application[]>;
    statusColumns: string[];
    loading: boolean;
    onOpenTracker: () => void;
}

const statusIconMap: Record<string, React.ReactNode> = {
    Interested: <FaLightbulb className="text-yellow-500" />,
    Applying: <FaHourglassHalf className="text-blue-500" />,
    Submitted: <FaPaperPlane className="text-indigo-500" />,
    Accepted: <FaCheckCircle className="text-green-500" />,
    Rejected: <FaTimesCircle className="text-red-500" />,
};

const ApplicationStats: React.FC<ApplicationStatsProps> = ({
    applications,
    applicationsByStatus,
    statusColumns,
    loading,
    onOpenTracker,
}) => {
    const totalApplications = applications.length;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const getStatusCounts = () => {
        return statusColumns.map((status) => ({
            status,
            count: applicationsByStatus[status]?.length || 0,
        }));
    };

    const handleCardClick = (status: string) => {
        if (applicationsByStatus[status]?.length > 0) {
            setSelectedStatus(status);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStatus(null);
    };

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-10 animate-fade-in">
            {/* Main Chart Section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10 flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaChartPie className="mr-2 text-primary" />
                    Application Progress
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center flex-1">
                        <FaSpinner className="animate-spin text-4xl text-primary" />
                    </div>
                ) : totalApplications > 0 ? (
                    <div className="flex-1 flex items-center justify-center min-h-[220px]">
                        <ApplicationStatusChart data={getStatusCounts()} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-500 italic text-center text-sm">
                        Add your first application to see your progress chart!
                    </div>
                )}
            </div>

            {/* Stats Grid Section */}
            <div className="col-span-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Stats</h2>
                <div className="grid grid-cols-2 gap-4 flex-1">
                    {statusColumns.map((status) => (
                        <div
                            key={status}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 flex flex-col items-center justify-center shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                            onClick={() => handleCardClick(status)}
                        >
                            <div className="text-2xl mb-2">{statusIconMap[status]}</div>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {applicationsByStatus[status]?.length || 0}
                            </p>
                            <p className="text-sm font-semibold text-gray-500 text-center mt-1">
                                {status}
                            </p>
                        </div>
                    ))}

                    {/* Total Applications Card */}
                    <div className="col-span-full bg-gradient-to-r from-primary/10 to-primary/20 rounded-xl p-6 flex flex-col items-center justify-center shadow-md">
                        <p className="text-5xl font-extrabold text-primary">{totalApplications}</p>
                        <p className="text-base font-semibold text-secondary mt-2 text-center">
                            Total Applications
                        </p>
                    </div>
                </div>

                {/* Tracker Button */}
                <button
                    onClick={onOpenTracker}
                    className="w-full mt-6 bg-gradient-to-r from-primary to-primary-dark text-black font-semibold py-3 rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                    <FaExchangeAlt />
                    <span>Open Tracker Board</span>
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && selectedStatus && (
                <ApplicationListModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    applications={applicationsByStatus[selectedStatus] || []}
                    status={selectedStatus}
                />
            )}
        </section>
    );
};

export default ApplicationStats;
