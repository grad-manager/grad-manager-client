import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessToastProps {
  message: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
  return (
    <div className="flex items-center p-4 bg-green-500 text-white rounded-lg shadow-lg">
      <FaCheckCircle className="text-xl mr-3" />
      <span className="font-semibold text-lg">{message}</span>
    </div>
  );
};

export default SuccessToast;