/* eslint-disable no-irregular-whitespace */
import React from 'react';
import { FaDollarSign, FaHistory } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import type { Application } from '../../types/Application';
import type { Group } from '../../types/Group';

interface FinancialSupportCardProps {
  applications: Application[];
  userGroups: Group[];
  onOpenFinancialSupport: () => void;
}

const FinancialSupportCard: React.FC<FinancialSupportCardProps> = ({ applications, userGroups }) => {
  const { openModal } = useModal();

  const handleOpenForm = () => {
    openModal('financialSupportForm', {
      applications,
      userGroups
    });
  };

  const handleOpenHistory = () => {
    openModal('financialSupportHistory');
  };

  return (
    <div
      className="bg-dashboard-gradient bg-[length:200%_200%] animate-gradient-shift 
                 text-white backdrop-blur-md rounded-2xl shadow-card-xl p-6 sm:p-8 mt-6 
                 flex flex-col sm:flex-row justify-between items-center 
                 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
    >
      {/* Left Section */}
      <div className="text-center sm:text-left mb-4 sm:mb-0 max-w-lg">
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center">
          <FaDollarSign className="mr-2 text-white text-xl sm:text-2xl" />
          Financial Support Request
        </h3>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/90">
          Request <span className="font-semibold">personalized sessions</span> for
          <span className="font-semibold"> scholarship & funding guidance</span> to help ease your financial journey.
        </p>
      </div>

      {/* Right Section: Actions */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <button
          onClick={handleOpenForm}
          className="bg-white text-indigo-600 font-semibold py-2 px-6 sm:py-3 sm:px-8 rounded-full 
                     shadow-md hover:bg-indigo-50 hover:text-indigo-700 transform hover:scale-105 
                     transition-all duration-300 flex items-center justify-center space-x-2 w-full"
        >
          <span>Request Session</span>
          <FaDollarSign />
        </button>

        <button
          onClick={handleOpenHistory}
          className="bg-transparent border border-white/70 text-white font-semibold py-2 px-6 sm:py-3 sm:px-8 
                     rounded-full shadow-md hover:bg-white hover:text-indigo-700 transform hover:scale-105 
                     transition-all duration-300 flex items-center justify-center space-x-2 w-full"
        >
          <span>View History</span>
          <FaHistory />
        </button>
      </div>
    </div>
  );
};

export default FinancialSupportCard;