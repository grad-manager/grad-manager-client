import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import type { Application } from '../types/Application';
import type { Program } from '../types/Program';
import { getEffectivePlanLower } from '../utils/trial';

const API_URL = import.meta.env.VITE_API_URL;

interface AddApplicationFormProps {
    onApplicationAdded: () => void;
    onClose: () => void;
}

const AddApplicationForm: React.FC<AddApplicationFormProps> = ({ onApplicationAdded, onClose }) => {
    const { currentUser, userProfile } = useAuth();

    // Application tracker limits (must be kept in sync with ProgramList)
    const APPLICATION_LIMITS: Record<string, number> = {
        free: 2,
        pro: Number.POSITIVE_INFINITY,
    };
    const userPlan = getEffectivePlanLower(userProfile);
    const currentApplicationCount = userProfile?.applicationsCount || 0;
    const maxApplications = APPLICATION_LIMITS[userPlan] ?? 2;

    // State variables
    const [university, setUniversity] = useState('');
    const [department, setDepartment] = useState('');
    const [deadline, setDeadline] = useState('');
    const [notes, setNotes] = useState('');
    const [funding, setFunding] = useState('');
    const [fundingAmount, setFundingAmount] = useState('');
    const [greWaiver, setGreWaiver] = useState('');
    const [ieltsWaiver, setIeltsWaiver] = useState('');
    const [appFeeWaiver, setAppFeeWaiver] = useState('');
    
    // State variables for the textarea inputs
    const [requiredDocsInput, setRequiredDocsInput] = useState('');
    const [professorsInput, setProfessorsInput] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || event.data.type !== 'GRAD_TRACKER_DATA') {
                return;
            }

            const {
                university,
                department,
                deadline,
                funding,
                fundingAmount,
                greWaiver,
                ieltsWaiver,
                appFeeWaiver,
                requiredDocs,
                professors,
            } = event.data.payload as Program;

            if (university) setUniversity(university);
            if (department) setDepartment(department);
            if (deadline) setDeadline(deadline);
            if (funding) setFunding(funding);
            if (fundingAmount) setFundingAmount(fundingAmount);
            if (greWaiver) setGreWaiver(greWaiver);
            if (ieltsWaiver) setIeltsWaiver(ieltsWaiver);
            if (appFeeWaiver) setAppFeeWaiver(appFeeWaiver);

            // Here, professors is already a string, no need to join.
            if (requiredDocs && Array.isArray(requiredDocs)) {
                setRequiredDocsInput(requiredDocs.join(', '));
            }
            if (professors) {
                setProfessorsInput(professors);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUser || !currentUser.email) {
            setError('You must be logged in with a valid email to add an application.');
            setLoading(false);
            return;
        }

        // Client-side enforcement of application tracker limits
        if (currentApplicationCount >= maxApplications) {
            const limitDisplay = maxApplications === Number.POSITIVE_INFINITY ? 'Unlimited' : maxApplications;
            setError(`Application limit reached (${currentApplicationCount} of ${limitDisplay}). Upgrade your plan to add more.`);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const applicationData: Omit<Application, '_id' | 'emails' | 'status'> = {
                schoolName: university,
                programName: department,
                deadline,
                notes,
                funding,
                fundingAmount,
                greWaiver,
                ieltsWaiver,
                appFeeWaiver,
                // Split the string input into a string array for the payload
                requiredDocs: requiredDocsInput.split(',').map(doc => doc.trim()).filter(doc => doc.length > 0),
                // Directly assign the string input
                professors: professorsInput,
                appLink: '',
                contactEmail: '',
                userId: currentUser.uid,
                userEmail: currentUser.email,
                position: 'N/A',
            };

            await axios.post(`${API_URL}/applications`, {
                ...applicationData,
                status: 'Interested',
            });

            onApplicationAdded();
            onClose();
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to add application. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-300 scale-100 animate-slide-up-fade h-fit max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-800">Add New Application</h2>
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
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            required
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Department Name</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            required
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Funding</label>
                        <input
                            type="text"
                            value={funding}
                            onChange={(e) => setFunding(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Funding Amount</label>
                        <input
                            type="text"
                            value={fundingAmount}
                            onChange={(e) => setFundingAmount(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">GRE Waiver</label>
                        <input
                            type="text"
                            value={greWaiver}
                            onChange={(e) => setGreWaiver(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">IELTS Waiver</label>
                        <input
                            type="text"
                            value={ieltsWaiver}
                            onChange={(e) => setIeltsWaiver(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">App Fee Waiver</label>
                        <input
                            type="text"
                            value={appFeeWaiver}
                            onChange={(e) => setAppFeeWaiver(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Required Docs (comma separated)</label>
                        <textarea
                            value={requiredDocsInput}
                            onChange={(e) => setRequiredDocsInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            rows={4}
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Professors (URL)</label>
                        <textarea
                            value={professorsInput}
                            onChange={(e) => setProfessorsInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                            rows={2}
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
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
                                <span>Save Application</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddApplicationForm;
