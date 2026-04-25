import React, { useState } from 'react';
import axios from 'axios';
import type { Application, Email } from '../types/Application';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth

const API_URL = import.meta.env.VITE_API_URL;

interface EmailTrackerProps {
  application: Application;
  onEmailAdded: () => void;
}

const EmailTracker: React.FC<EmailTrackerProps> = ({ application, onEmailAdded }) => {
  // 2. Access the token from the useAuth hook
  const { token } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Define your email templates
  const emailTemplates = {
    'Initial Inquiry': {
      subject: `Inquiry about the ${application.programName} program`,
      body: `Dear Professor [Professor's Last Name],

I am writing to express my interest in the ${application.programName} program at ${application.schoolName}. I am a prospective applicant for the [upcoming semester, e.g., Fall 2026] and I was particularly drawn to your research in [mention a specific research area].

I would be grateful for the opportunity to discuss your work and learn more about the program.

Sincerely,
[Your Name]`,
    },
    'Request for Letter of Recommendation': {
      subject: `Recommendation Letter Request - ${application.programName}`,
      body: `Dear Professor [Professor's Last Name],

I hope this email finds you well. I am currently applying to the ${application.programName} at ${application.schoolName} and would like to respectfully request a letter of recommendation from you.

I have attached my CV, personal statement, and the application's deadline. Please let me know if you are able to write a letter on my behalf.

Thank you for your time and consideration.

Best regards,
[Your Name]`,
    },
    'Follow-up after Submission': {
      subject: `Follow-up on my application to the ${application.programName} program`,
      body: `Dear Admissions Committee,

I am writing to follow up on my application to the ${application.programName} program at ${application.schoolName}. I submitted my application on [Date of submission] and wanted to confirm that all materials were received.

Thank you for your time and consideration.

Sincerely,
[Your Name]`,
    },
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = e.target.value;
    if (selectedTemplate in emailTemplates) {
      const template = emailTemplates[selectedTemplate as keyof typeof emailTemplates];
      setSubject(template.subject);
      setBody(template.body);
    } else {
      setSubject('');
      setBody('');
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body || !recipient) {
      setError('All fields are required.');
      return;
    }

    if (!token) {
      // Handle the case where the user is not authenticated
      setError('You must be logged in to perform this action.');
      return;
    }

    try {
      await axios.post(`${API_URL}/applications/${application._id}/emails`, {
        subject,
        body,
        recipient,
      }, {
        // 3. Add the Authorization header
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onEmailAdded();
      setSubject('');
      setBody('');
      setRecipient('');
      setShowForm(false);
    } catch (err) {
      setError('Failed to add email record. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Email Communications</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Email Record'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddEmail} className="bg-gray-100 p-4 rounded-md mb-4">
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Use a Template</label>
            <select
              onChange={handleTemplateChange}
              className="w-full px-2 py-1 border rounded-lg"
              defaultValue=""
            >
              <option value="">Select a template...</option>
              {Object.keys(emailTemplates).map((templateName) => (
                <option key={templateName} value={templateName}>
                  {templateName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Recipient</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-2 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-2 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-2 py-1 border rounded-lg"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600"
          >
            Save Email Record
          </button>
        </form>
      )}

      {application.emails && application.emails.length > 0 ? (
        <ul className="space-y-4">
          {application.emails.map((email: Email, index: number) => (
            <li key={index} className="bg-gray-50 p-4 rounded-md shadow-sm">
              <p className="text-sm font-bold">To: {email.recipient}</p>
              <p className="text-sm font-bold">Subject: {email.subject}</p>
              <p className="text-xs text-gray-500 mb-2">Sent on: {new Date(email.sentAt).toLocaleString()}</p>
              <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">{email.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm text-center">No email records found.</p>
      )}
    </div>
  );
};

export default EmailTracker;