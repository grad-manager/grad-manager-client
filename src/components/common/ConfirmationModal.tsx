// src/components/common/ConfirmationModal.tsx
import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmationModalProps {
    isOpen: boolean; // You already have this
    onConfirm: () => void;
    onCancel: () => void; // Make sure this is present and correct
    message: string;
    title?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel, // Destructure onCancel here
    message,
    title = "Confirm Action",
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel"
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform scale-95 transition-all duration-300 ease-in-out">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 mr-2" />
                        {title}
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <FaTimes className="text-2xl" />
                    </button>
                </div>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 font-semibold rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;