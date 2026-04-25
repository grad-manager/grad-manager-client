// src/components/Dashboard/SOPRequestCard.tsx
import React, { useEffect, useState } from 'react';
import {
  FaSpinner, FaPenFancy, FaClock, FaCheckCircle,
  FaTimesCircle, FaLink, FaCalendarAlt, FaHistory, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { Application } from '../../types/Application';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface SOPRequest {
  id: string;
  applicationId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'rescheduled' | 'not completed';
  timestamp: string;
  acceptanceDetails?: { date: string; time: string; zoomLink: string };
  declineReason?: string;
  rescheduleDetails?: { newDate: string; newTime: string; reason?: string };
  uncompletionReason?: string;
}

interface Props {
  applications: Application[];
  onRequestSOPWriting: (applicationId: string) => void;
  currentUserUid: string;
}

const SOPRequestCard: React.FC<Props> = ({ applications, onRequestSOPWriting, currentUserUid }) => {
  const [allSopRequests, setAllSopRequests] = useState<SOPRequest[]>([]);
  const [mostRecentRequest, setMostRecentRequest] = useState<SOPRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (!currentUserUid) return setIsLoading(false);

    const q = query(collection(db, "sop_requests"), where("userId", "==", currentUserUid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: SOPRequest[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SOPRequest));
        requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAllSopRequests(requests);
        setMostRecentRequest(requests[0] || null);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUserUid]);

  const getApplicationById = (id: string) => applications.find(app => app._id === id);
  const hasActiveRequest = (appId: string) =>
    allSopRequests.some(req =>
      req.applicationId === appId &&
      ['pending', 'accepted', 'rescheduled'].includes(req.status)
    );

  const renderRequestCardContent = (req: SOPRequest) => {
    const app = getApplicationById(req.applicationId);
    if (!app) return null;

    const statusClasses: Record<string, string> = {
      pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      accepted: 'bg-green-50 border-green-200 text-green-700',
      rescheduled: 'bg-blue-50 border-blue-200 text-blue-700',
    };
    const cls = statusClasses[req.status] || 'bg-gray-50 border-gray-200 text-gray-700';

    switch (req.status) {
      case 'pending':
        return (
          <div className={`rounded-lg p-4 border ${cls}`}>
            <h4 className="font-semibold flex items-center">
              <FaClock className="mr-2" /> Request Submitted: <strong>{app.schoolName}</strong>
            </h4>
            <p className="mt-2">Your request is currently being reviewed.</p>
          </div>
        );
      case 'accepted':
        return req.acceptanceDetails && (
          <div className={`rounded-lg p-4 border ${cls}`}>
            <h4 className="font-semibold flex items-center">
              <FaCheckCircle className="mr-2" /> Session Confirmed: <strong>{app.schoolName}</strong>
            </h4>
            <p className="mt-2"><strong>Date:</strong> {req.acceptanceDetails.date}</p>
            <p><strong>Time:</strong> {req.acceptanceDetails.time}</p>
            <a href={req.acceptanceDetails.zoomLink} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center mt-2">
              <FaLink className="mr-1" /> Join Session
            </a>
          </div>
        );
      case 'rescheduled':
        return req.rescheduleDetails && (
          <div className={`rounded-lg p-4 border ${cls}`}>
            <h4 className="font-semibold flex items-center">
              <FaCalendarAlt className="mr-2" /> Session Rescheduled: <strong>{app.schoolName}</strong>
            </h4>
            <p className="mt-2"><strong>New Date:</strong> {req.rescheduleDetails.newDate}</p>
            <p><strong>New Time:</strong> {req.rescheduleDetails.newTime}</p>
            {req.rescheduleDetails.reason && (
              <p className="italic mt-2">Reason: {req.rescheduleDetails.reason}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Reusable Modal Wrapper with motion (updated for responsiveness)
  const ModalWrapper: React.FC<{ show: boolean; onClose: () => void; title: string; children: React.ReactNode }> =
    ({ show, onClose, title, children }) => (
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[95%] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {/* Header */}
              <div className="relative px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white">
                <h2 className="text-base sm:text-lg font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full bg-white/20 hover:bg-white/30 p-1 transition"
                >
                  <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mt-6 transition hover:shadow-2xl">
      <h2 className="text-xl sm:text-2xl font-bold text-secondary flex items-center mb-6">
        <FaPenFancy className="mr-2 text-primary" /> SOP Live Writing
      </h2>

      <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center justify-center w-full sm:w-auto text-white font-semibold py-2 px-3 sm:px-4 rounded-full bg-blue-500 hover:bg-blue-600 transition text-sm sm:text-base"
        >
          <FaPenFancy className="sm:mr-2" /> <span className="hidden sm:inline">Request New Session</span>
        </button>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center justify-center w-full sm:w-auto text-primary-dark font-semibold py-2 px-3 sm:px-4 rounded-full bg-primary hover:bg-primaryDark transition text-sm sm:text-base"
        >
          <FaHistory className="sm:mr-2" /> <span className="hidden sm:inline">View History</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-3xl text-primary" />
          <span className="ml-3 text-gray-600">Loading requests...</span>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <p>Use the buttons above to manage your SOP writing sessions.</p>
        </div>
      )}

      {/* Request Modal */}
      <ModalWrapper
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="SOP Live Writing Session"
      >
        {mostRecentRequest && hasActiveRequest(mostRecentRequest.applicationId)
          ? renderRequestCardContent(mostRecentRequest)
          : <p className="text-gray-500 mb-6">No active requests.</p>}

        <h4 className="text-lg font-bold text-secondary mb-4 mt-6">Request a New Session</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map(app => (
            <div key={app._id}
              className={`p-4 rounded-xl border-2 transition ${hasActiveRequest(app._id)
                ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                : 'bg-white border-primary-light hover:shadow-lg'}`}
            >
              <h4 className="font-bold text-lg text-secondary">{app.schoolName}</h4>
              <p className="text-sm text-neutral-dark mb-2">{app.programName}</p>
              {hasActiveRequest(app._id) ? (
                <div className="flex items-center text-sm font-semibold text-gray-500 mt-2">
                  <FaTimesCircle className="mr-1" /> Active request exists
                </div>
              ) : (
                <button
                  onClick={() => onRequestSOPWriting(app._id)}
                  className="mt-2 w-full bg-primary text-white font-semibold py-2 px-3 sm:px-4 rounded-full hover:bg-indigo-700 transition text-sm sm:text-base"
                >
                  Request SOP Writing
                </button>
              )}
            </div>
          ))}
        </div>
      </ModalWrapper>

      {/* History Modal */}
      <ModalWrapper
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="SOP Request History"
      >
        <div className="space-y-4">
          {allSopRequests.length > 0 ? allSopRequests.map(req => {
            const app = getApplicationById(req.applicationId);
            if (!app) return null;

            const statusColor: Record<string, string> = {
              accepted: 'green', rescheduled: 'blue', pending: 'yellow',
              completed: 'gray', declined: 'red', 'not completed': 'red'
            };
            const color = statusColor[req.status] || 'gray';
            const formattedDate = new Date(req.timestamp).toLocaleDateString();

            return (
              <div key={req.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-semibold text-${color}-700 text-base sm:text-lg`}>{app.schoolName}</span>
                  <span className={`px-2 py-1 text-xs sm:text-sm font-semibold rounded-full text-white bg-${color}-500`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  <FaClock className="inline mr-1" /> Requested on: {formattedDate}
                </p>
              </div>
            );
          }) : <p className="text-center text-gray-500">No requests found.</p>}
        </div>
      </ModalWrapper>
    </div>
  );
};

export default SOPRequestCard;
