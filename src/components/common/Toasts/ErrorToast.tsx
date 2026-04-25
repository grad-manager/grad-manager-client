import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

// 1. UPDATE THE PROPS INTERFACE
interface ErrorToastProps {
    message: string;
    // Allow an optional custom icon to be passed as a React node (e.g., a JSX element)
    icon?: React.ReactNode; 
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, icon }) => {
    return (
        // Enhanced styling for better visual separation and professionalism
        <div className="flex items-center p-4 bg-red-100 border border-red-400 text-red-900 rounded-lg shadow-md">
            
            {/* 2. USE THE PASSED ICON (or fall back to the default FaTimesCircle) */}
            <div className="flex-shrink-0 text-red-500 mr-3">
                {icon || <FaTimesCircle className="text-xl" />}
            </div>

            <span className="font-medium text-sm sm:text-base">{message}</span>
        </div>
    );
};

export default ErrorToast;