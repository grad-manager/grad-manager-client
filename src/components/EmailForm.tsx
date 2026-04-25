import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface EmailFormProps {
  to: string; // The recipient email address
  onClose: () => void;
}

const EmailForm: React.FC<EmailFormProps> = ({ to, onClose }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSendEmail = async () => {
    if (!subject || !body) {
      setStatus('error');
      setStatusMessage('Subject and body cannot be empty.');
      return;
    }

    try {
      setStatus('sending');
      setStatusMessage('Sending...');
      await axios.post(`${API_URL}/emails/send`, { to, subject, body }, {
        withCredentials: true,
      });
      setStatus('success');
      setStatusMessage('Email sent successfully!');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setStatus('error');
      setStatusMessage('Failed to send email. Please try again.');
    }
  };

  const statusColors = {
    idle: 'text-gray-500',
    sending: 'text-blue-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl transition-all duration-300 transform scale-100">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">Compose Email</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">To:</label>
          <input type="text" value={to} readOnly className="w-full border border-gray-300 p-2 rounded-lg bg-gray-100 font-mono text-gray-600 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-colors duration-200 shadow-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSendEmail}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FaPaperPlane />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
      {status !== 'idle' && (
        <p className={`mt-4 text-center text-sm font-medium ${statusColors[status]}`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default EmailForm;