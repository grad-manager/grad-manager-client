// src/components/ExitPopup.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface ExitPopupProps {
  show: boolean;
  onClose: () => void;
}

const ExitPopup: React.FC<ExitPopupProps> = ({ show, onClose }) => {
  const { logout } = useAuth();

  const handleStay = () => {
    onClose();
  };

  const handleLeave = async () => {
    await logout();
    onClose();
    window.location.href = "/login"; 
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold text-secondary mb-3">
              👋 Leaving so soon?
            </h2>
            <p className="text-neutral-600 mb-6">
              Before you go, do you want to save your progress or explore more
              features of Grad Manager?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleStay}
                className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-700 transition"
              >
                Stay Here
              </button>
              <button
                onClick={handleLeave}
                className="px-5 py-2 rounded-lg bg-neutral-200 text-secondary font-semibold hover:bg-neutral-300 transition"
              >
                Leave Anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitPopup;
