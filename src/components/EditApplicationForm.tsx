import React, { useState } from 'react';
import axios from 'axios';
import type { Application } from '../types/Application';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface EditApplicationFormProps {
    application: Application;
    onApplicationUpdated: () => void;
    onClose: () => void;
}

const EditApplicationForm: React.FC<EditApplicationFormProps> = ({ application, onApplicationUpdated, onClose }) => {
    // Initialize all state variables with data from the `application` prop
    const [schoolName, setSchoolName] = useState(application.schoolName);
    const [programName, setProgramName] = useState(application.programName);
    const [deadline, setDeadline] = useState(application.deadline ? application.deadline.split('T')[0] : '');
    const [status, setStatus] = useState(application.status);
    const [notes, setNotes] = useState(application.notes || '');
    const [funding, setFunding] = useState(application.funding || '');
    const [fundingAmount, setFundingAmount] = useState(application.fundingAmount || '');
    const [greWaiver, setGreWaiver] = useState(application.greWaiver || '');
    const [ieltsWaiver, setIeltsWaiver] = useState(application.ieltsWaiver || '');
    const [appFeeWaiver, setAppFeeWaiver] = useState(application.appFeeWaiver || '');
    const [requiredDocs, setRequiredDocs] = useState(Array.isArray(application.requiredDocs) ? application.requiredDocs.join(', ') : application.requiredDocs || '');
    const [appLink, setAppLink] = useState(application.appLink || '');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const updatedData = {
                schoolName,
                programName,
                deadline,
                status,
                notes,
                funding,
                fundingAmount,
                greWaiver,
                ieltsWaiver,
                appFeeWaiver,
                requiredDocs: requiredDocs.split(',').map(doc => doc.trim()),
                appLink,
            };

            await axios.put(`${API_URL}/applications/${application._id}`, updatedData);
            onApplicationUpdated();
            onClose();
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to update application. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-300 scale-100 animate-slide-up-fade h-fit max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                    <h2 className="text-3xl font-extrabold text-gray-800">Edit Application</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
                    >
                        <FaTimes />
                    </button>
                </div>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">University Name</label>
                            <input
                                type="text"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                                required
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Program Name</label>
                            <input
                                type="text"
                                value={programName}
                                onChange={(e) => setProgramName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                                required
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Application['status'])}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            >
                                <option value="Interested">Interested</option>
                                <option value="Applying">Applying</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Additional fields */}
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Funding</label>
                            <input
                                type="text"
                                value={funding}
                                onChange={(e) => setFunding(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Funding Amount</label>
                            <input
                                type="text"
                                value={fundingAmount}
                                onChange={(e) => setFundingAmount(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">GRE Waiver</label>
                            <input
                                type="text"
                                value={greWaiver}
                                onChange={(e) => setGreWaiver(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">IELTS Waiver</label>
                            <input
                                type="text"
                                value={ieltsWaiver}
                                onChange={(e) => setIeltsWaiver(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">App Fee Waiver</label>
                            <input
                                type="text"
                                value={appFeeWaiver}
                                onChange={(e) => setAppFeeWaiver(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Link</label>
                            <input
                                type="text"
                                value={appLink}
                                onChange={(e) => setAppLink(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Required Docs (comma separated)</label>
                            <textarea
                                value={requiredDocs}
                                onChange={(e) => setRequiredDocs(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                                rows={2}
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
                                rows={4}
                            />
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 font-bold rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:bg-gray-400 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditApplicationForm;