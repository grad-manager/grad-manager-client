import React, { useState } from 'react';
import { FaPlusCircle, FaTimes, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';

// A simple type definition for the suggestion form data
interface ProgramSuggestionData {
    university: string;
    department: string;
    deadline: string; // ISO date string (YYYY-MM-DD)
    funding: 'fully funded' | 'partially funded' | 'not applicable' | '';
    fundingAmount: string; // e.g., "$25,000" or "N/A"
    greWaiver: 'Yes' | 'No' | 'N/A' | '';
    ieltsWaiver: 'Yes' | 'No' | 'N/A' | '';
    appFeeWaiver: 'Yes' | 'No' | 'N/A' | '';
    requiredDocs: string; // Comma-separated list for simplicity in a free-form input
    professors: string; // Link to faculty page
    appLink: string; // Link to application page
}

interface SuggestProgramFormProps {
    onClose: () => void;
}

// Define props for the InputField component for clarity
type InputFieldName = keyof ProgramSuggestionData;

interface InputFieldProps {
    label: string;
    name: InputFieldName;
    type?: string;
    placeholder?: string;
    required?: boolean;
    isSelect?: boolean;
    options?: { value: string, label: string }[];
    infoText?: string;
    value: string; // Added explicit value prop
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; // Added explicit onChange prop
}


const initialFormData: ProgramSuggestionData = {
    university: '',
    department: '',
    deadline: '',
    funding: '',
    fundingAmount: '',
    greWaiver: '',
    ieltsWaiver: '',
    appFeeWaiver: '',
    requiredDocs: '',
    professors: '',
    appLink: '',
};

// Refactored InputField to be a separate component for better reusability and type safety
const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    required = false, 
    isSelect = false, 
    options, 
    infoText, 
    value, 
    onChange 
}) => (
    <div className="flex flex-col space-y-1">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
            {infoText && <FaInfoCircle className="ml-2 text-blue-500 cursor-help" title={infoText} />}
        </label>
        {isSelect ? (
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition duration-150"
            >
                {options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value} // The key is to use the passed-in value prop
                onChange={onChange} // The key is to use the passed-in onChange prop
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition duration-150"
            />
        )}
    </div>
);


const SuggestProgramForm: React.FC<SuggestProgramFormProps> = ({ onClose }) => {
    const { currentUser, token } = useAuth();
    const [formData, setFormData] = useState<ProgramSuggestionData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // The state update is correct and efficient.
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const requiredFields: Array<keyof ProgramSuggestionData> = ['university', 'department', 'funding'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                toast.error(() => <ErrorToast message={`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`} />);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !token) {
            toast.error(() => <ErrorToast message="You must be logged in to submit a suggestion." />);
            return;
        }
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Prepare data for the API (convert comma-separated string to array for requiredDocs)
            const submissionData = {
                ...formData,
                userId: currentUser.uid,
                // Ensure requiredDocs is an array of trimmed strings
                requiredDocs: formData.requiredDocs.split(',').map(doc => doc.trim()).filter(doc => doc.length > 0),
            };

            // Assuming a new API endpoint for program suggestions
            await api.post('/program-suggestions', submissionData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(() => <SuccessToast message="Program suggestion submitted! Thank you, we'll review it shortly." />);
            setFormData(initialFormData);
            onClose();

        } catch (error) {
            console.error("Program suggestion failed:", error);
            toast.error(() => <ErrorToast message="Failed to submit suggestion. Please try again." />);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <FaPlusCircle className="mr-3 text-blue-600" /> Suggest a Program
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-red-600 transition"
                    aria-label="Close form"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg border border-yellow-100 dark:border-yellow-700">
                Can't find a program? Submit the details below. Our admin team will **verify** and add it to the list!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField 
                        label="University Name" 
                        name="university" 
                        placeholder="e.g., Harvard University" 
                        required 
                        value={formData.university} 
                        onChange={handleChange} 
                    />
                    <InputField 
                        label="Department/Program Name" 
                        name="department" 
                        placeholder="e.g., Computer Science (PhD)" 
                        required 
                        value={formData.department} 
                        onChange={handleChange} 
                    />
                </div>

                <InputField 
                    label="Application Deadline" 
                    name="deadline" 
                    type="date" 
                    infoText="Required for sorting/tracking"
                    value={formData.deadline} 
                    onChange={handleChange} 
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Funding Status"
                        name="funding"
                        isSelect
                        required
                        value={formData.funding}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select Funding Status' },
                            { value: 'fully funded', label: 'Fully Funded' },
                            { value: 'partially funded', label: 'Partially Funded' },
                            { value: 'not applicable', label: 'Not Applicable' },
                        ]}
                    />
                    <InputField 
                        label="Funding Amount (If Applicable)" 
                        name="fundingAmount" 
                        placeholder="e.g., $30,000/year or N/A"
                        value={formData.fundingAmount} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <InputField
                        label="GRE Waiver"
                        name="greWaiver"
                        isSelect
                        value={formData.greWaiver}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select' },
                            { value: 'Yes', label: 'Yes' },
                            { value: 'No', label: 'No' },
                            { value: 'N/A', label: 'N/A' },
                        ]}
                    />
                    <InputField
                        label="IELTS/TOEFL Waiver"
                        name="ieltsWaiver"
                        isSelect
                        value={formData.ieltsWaiver}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select' },
                            { value: 'Yes', label: 'Yes' },
                            { value: 'No', label: 'No' },
                            { value: 'N/A', label: 'N/A' },
                        ]}
                    />
                    <InputField
                        label="App Fee Waiver"
                        name="appFeeWaiver"
                        isSelect
                        value={formData.appFeeWaiver}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Select' },
                            { value: 'Yes', label: 'Yes' },
                            { value: 'No', label: 'No' },
                            { value: 'N/A', label: 'N/A' },
                        ]}
                    />
                </div>
                
                <InputField 
                    label="Required Documents" 
                    name="requiredDocs" 
                    placeholder="e.g., SOP, CV, Transcript, 3 LORs (comma-separated)" 
                    infoText="Please list all known required documents separated by commas."
                    value={formData.requiredDocs} 
                    onChange={handleChange} 
                />

                <InputField 
                    label="Application Link (URL)" 
                    name="appLink" 
                    type="url" 
                    placeholder="https://apply.university.edu/program" 
                    infoText="Direct link to the program's application page"
                    value={formData.appLink} 
                    onChange={handleChange} 
                />

                <InputField 
                    label="Professors/Faculty Page (URL)" 
                    name="professors" 
                    type="url" 
                    placeholder="https://university.edu/faculty-page"
                    infoText="Direct link to the faculty/research page"
                    value={formData.professors} 
                    onChange={handleChange} 
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 flex items-center justify-center disabled:bg-gray-400"
                >
                    {isSubmitting ? (
                        <>
                            <FaSpinner className="animate-spin mr-2" /> Submitting...
                        </>
                    ) : (
                        <>
                            <FaPlusCircle className="mr-2" /> Submit Program Suggestion
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SuggestProgramForm;