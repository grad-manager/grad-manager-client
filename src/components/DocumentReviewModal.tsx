// src/components/DocumentReviewModal.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Application } from '../types/Application';
import DocumentReview from './DocumentReview';

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onDocumentUpdated: () => void;
}

const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({ isOpen, onClose, application, onDocumentUpdated }) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-secondary">
            Documents for {application.schoolName}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-dark hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-neutral-100"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
        <DocumentReview
          application={application}
          onDocumentUpdated={onDocumentUpdated}
        />
      </div>
    </div>
  );
};

export default DocumentReviewModal; 