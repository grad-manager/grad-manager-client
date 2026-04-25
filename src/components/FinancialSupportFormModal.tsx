import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import Modal from './Modal';
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';
import { useModal } from '../context/ModalContext';
import type { Application } from '../types/Application';
import type { Group } from '../types/Group';

interface FinancialSupportFormModalProps {
  applications: Application[];
  userGroups: Group[];
  onClose: () => void;
}

const FinancialSupportFormModal: React.FC<FinancialSupportFormModalProps> = ({ applications, userGroups, onClose }) => {
  const { currentUser } = useAuth();
  const { openModal, closeModal } = useModal();
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [notes, setNotes] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = selectedApplicationId !== '' && requestedAmount !== '';

  // The confirmRequest function now accepts selectedApplicationData as a parameter
  const confirmRequest = async (selectedApplicationData: Application) => {
    closeModal();
    setLoading(true);
    if (!currentUser) {
      toast.error(<ErrorToast message="Unexpected error. Please try again." />);
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, 'financial_support_requests'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        applicationId: selectedApplicationData._id,
        universityName: selectedApplicationData.schoolName || '',
        requestedAmount: parseFloat(requestedAmount) || 0,
        notes,
        groupId: selectedGroupId,
        status: 'pending',
        requestedAt: Timestamp.now(),
      });
      toast.success(<SuccessToast message="Financial support request sent successfully!" />);
      onClose();
    } catch (error) {
      console.error('Error sending financial support request:', error);
      toast.error(<ErrorToast message="Failed to send request. Please try again." />);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error(<ErrorToast message="Please fill in all required fields." />);
      return;
    }
    if (!currentUser) {
      toast.error(<ErrorToast message="Authentication error. Please log in again." />);
      return;
    }
    const selectedApp = applications.find(app => app._id === selectedApplicationId);
    if (!selectedApp) {
      toast.error(<ErrorToast message="Selected application not found. Please refresh and try again." />);
      return;
    }
    
    // Pass the selected application data directly to the confirmRequest function
    openModal('confirmationModal', {
      message: "Are you sure you want to submit this financial support request? A mentor will be notified.",
      onConfirm: () => confirmRequest(selectedApp), // Use a new function to pass the data
      onCancel: closeModal,
      title: "Confirm Request",
      confirmButtonText: "Submit Request",
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Request Financial Support">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Application Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Select Application</label>
          <select
            value={selectedApplicationId}
            onChange={(e) => setSelectedApplicationId(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm 
                       focus:border-indigo-600 focus:ring focus:ring-indigo-300"
            required
          >
            <option value="">-- Select an application --</option>
            {applications.map(app => (
              <option key={app._id} value={app._id}>
                {app.schoolName} - {app.programName}
              </option>
            ))}
          </select>
        </div>

        {/* Group Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Select Group (Optional)</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm 
                       focus:border-indigo-600 focus:ring focus:ring-indigo-300"
          >
            <option value="">-- Select a group --</option>
            {userGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <p className="text-sm text-gray-400 mt-1">Optional: select a group to associate your request.</p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Requested Amount ($)</label>
          <input
            type="number"
            value={requestedAmount}
            onChange={(e) => setRequestedAmount(e.target.value)}
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm 
                       focus:border-indigo-600 focus:ring focus:ring-indigo-300"
            placeholder="e.g., 5000"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm 
                       focus:border-indigo-600 focus:ring focus:ring-indigo-300"
            placeholder="e.g., questions about scholarships or budgeting"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full bg-indigo-600 text-white py-3 px-6 rounded-lg shadow-md 
                     hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 
                     flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed`}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <FaSpinner className="animate-spin text-white" />
              <span>Sending...</span>
            </div>
          ) : (
            <span>Submit Request</span>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default FinancialSupportFormModal;