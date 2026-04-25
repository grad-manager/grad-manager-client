// src/components/AIPredictorModal.tsx
import React from 'react';
import AIPredictor from './AIPredictorForm';
import type { Application } from '../types/Application';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    applications: Application[];
}

const AIPredictorModal: React.FC<Props> = ({ isOpen, onClose, applications }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                    <div className="mt-4">
                        <AIPredictor applications={applications} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIPredictorModal;