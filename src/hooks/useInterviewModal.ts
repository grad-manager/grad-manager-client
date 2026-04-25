import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const useInterviewModal = () => {
  const { currentUser } = useAuth();

  const [interviewModal, setInterviewModal] = useState<{
    isOpen: boolean;
    type: 'admission' | 'visa' | null;
    view: 'form' | 'history' | null;
  }>({
    isOpen: false,
    type: null,
    view: null,
  });

  const handleOpenInterviewModal = useCallback(
    (type: 'admission' | 'visa', view: 'form' | 'history') => {
      setInterviewModal({
        isOpen: true,
        type,
        view,
      });
    },
    []
  );

  const handleCloseInterviewModal = useCallback(() => {
    setInterviewModal({
      isOpen: false,
      type: null,
      view: null,
    });
  }, []);

  const handleInterviewRequestSent = useCallback(
    async (applicationId?: string) => {
      if (!currentUser) return;

      try {
        const colName =
          interviewModal.type === 'visa'
            ? 'visa_interview_requests'
            : 'admission_interview_requests';

        await addDoc(collection(db, colName), {
          userId: currentUser.uid,
          applicationId: applicationId || null,
          status: 'pending',
          type: interviewModal.type,
          createdAt: new Date().toISOString(),
        });

        toast.success(
          `${
            interviewModal.type === 'visa' ? 'Visa' : 'Admission'
          } interview prep request sent!`
        );
        handleCloseInterviewModal();
      } catch (error) {
        console.error('Error sending interview request:', error);
        toast.error('Failed to send interview request. Try again.');
      }
    },
    [currentUser, interviewModal, handleCloseInterviewModal]
  );

  return {
    interviewModal,
    handleOpenInterviewModal,
    handleCloseInterviewModal,
    handleInterviewRequestSent,
  };
};
