/* eslint-disable no-irregular-whitespace */
// src/components/DocumentServiceMain.tsx
import React from 'react';
import { FaPenFancy, FaFileAlt, FaHistory, FaPlusCircle } from 'react-icons/fa';

interface DocumentServiceMainProps {
  onOpenSOPForm: () => void;
  onOpenSOPHistory: () => void;
  onOpenCVForm: () => void;
  onOpenCVHistory: () => void;
}

const DocumentServiceMain: React.FC<DocumentServiceMainProps> = ({
  onOpenSOPForm,
  onOpenSOPHistory,
  onOpenCVForm,
  onOpenCVHistory,
}) => {
  const ServiceCard: React.FC<{ title: string; icon: React.ReactNode; formAction: () => void; historyAction: () => void }> = ({
    title, icon, formAction, historyAction
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500 flex flex-col justify-between h-full">
      <div className="mb-4">
        <div className="text-3xl text-indigo-600 mb-3">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">Professional writing and review sessions to perfect your documents.</p>
      </div>
      <div className="flex flex-col space-y-2">
        <button
          onClick={formAction}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-500 text-white font-semibold py-2 rounded-full hover:bg-indigo-600 transition"
        >
          <FaPlusCircle /> <span>New Request</span>
        </button>
        <button
          onClick={historyAction}
          className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 font-semibold py-2 rounded-full hover:bg-gray-300 transition"
        >
          <FaHistory /> <span>View History</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-8">
        
        {/* Introduction Panel (NEWLY ADDED) */}
        <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-extrabold mb-2">Perfect Your Application Documents</h2>
            <p className="text-indigo-200">
                Receive <strong>personalized, expert feedback</strong> and <strong>live writing sessions</strong> to ensure your Statement of Purpose (SOP) and Academic CV stand out to admission committees.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* SOP Service Card */}
          <ServiceCard 
            title="SOP Live Writing"
            icon={<FaPenFancy />}
            formAction={onOpenSOPForm}
            historyAction={onOpenSOPHistory}
          />
          {/* CV Service Card */}
          <ServiceCard
            title="Academic CV Service"
            icon={<FaFileAlt />}
            formAction={onOpenCVForm}
            historyAction={onOpenCVHistory}
          />
        </div>
    </div>
  );
};

export default DocumentServiceMain;