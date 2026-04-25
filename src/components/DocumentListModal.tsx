/* eslint-disable no-irregular-whitespace */
// src/components/DocumentListModal.tsx

import React from 'react';
import type { Application } from '../types/Application';
import { FaTimes, FaFile, FaDownload, FaTrash, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SuccessToast from './common/Toasts/SuccessToast';
import ErrorToast from './common/Toasts/ErrorToast';
import ConfirmationModal from './common/ConfirmationModal';

interface Document {
    _id: string;
    applicationId: Application;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
    status: 'uploaded' | 'pending_review' | 'review_complete';
    correctedFileUrl?: string;
}

interface DocumentListModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application;
    documents: Document[];
    onDocumentUpdated: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const DocumentListModal: React.FC<DocumentListModalProps> = ({
    isOpen,
    onClose,
    application,
    documents,
    onDocumentUpdated,
}) => {
    const { token, userProfile } = useAuth();
    const [isSubmittingCorrection, setIsSubmittingCorrection] = React.useState<boolean>(false);
    const [correctedFile, setCorrectedFile] = React.useState<File | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState<string | null>(null);
    
    // 👇 REMOVED: isConfirmSubmitOpen state and its handler

    if (!isOpen) {
        return null;
    }

    const getStatusText = (status: Document['status']): string => {
        switch (status) {
            case 'uploaded':
                return 'Saved';
            case 'pending_review':
                return 'Uploaded';
            case 'review_complete':
                return 'Final Version';
            default:
                return 'Status Unknown';
        }
    };

    const handleDownload = async (documentId: string, filename: string) => {
        if (!token) {
            toast.error(<ErrorToast message="Authentication token is missing. Please log in again." />);
            return;
        }

        try {
            const response = await axios.get<{ downloadUrl: string }>(
                `${API_URL}/documents/${documentId}/download-url`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const downloadUrl = response.data.downloadUrl;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(<SuccessToast message="Download started successfully!" />);

        } catch (error) {
            console.error('Error downloading the document:', error);
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                toast.error(<ErrorToast message="You do not have permission to download this document." />);
            } else {
                toast.error(<ErrorToast message="Failed to download document. Please ensure you are logged in and have permission." />);
            }
        }
    };

    const confirmDeletion = async (documentId: string) => {
        setIsConfirmDeleteOpen(null);
        try {
            await axios.delete(`${API_URL}/applications/${application._id}/documents/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onDocumentUpdated();
            toast.success(<SuccessToast message="Document deleted successfully!" />);
        } catch (error) {
            console.error('Failed to delete document:', error);
            toast.error(<ErrorToast message="Failed to delete document. Please try again." />);
        }
    };

    // 👇 REMOVED: confirmSubmitForReview function entirely

    const handleCorrectedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCorrectedFile(e.target.files[0]);
        }
    };

    const handleCorrectedUpload = async (documentId: string) => {
        if (!correctedFile || !token) {
            toast.error(<ErrorToast message="Please select a file to upload." />);
            return;
        }
        setIsSubmittingCorrection(true);

        const formData = new FormData();
        formData.append('correctedDocument', correctedFile);

        try {
            await axios.post(`${API_URL}/admin/documents/correct/${documentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setCorrectedFile(null);
            onDocumentUpdated();
            toast.success(<SuccessToast message="Corrected document uploaded successfully!" />);
        } catch (error) {
            console.error('Failed to upload corrected document:', error);
            toast.error(<ErrorToast message="Failed to upload corrected document." />);
        } finally {
            setIsSubmittingCorrection(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <FaTimes className="text-2xl" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Uploaded Documents</h2>

                {documents.length > 0 ? (
                    <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {documents.map(doc => (
                            <li key={doc._id} className="bg-gray-50 p-4 rounded-xl shadow-sm flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center space-x-3 truncate">
                                    <FaFile className="text-blue-500" />
                                    <div>
                                        <p className="font-semibold text-gray-800 truncate">{doc.fileName}</p>
                                        <p className="text-sm text-gray-500">{doc.fileType}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 items-center flex-shrink-0">
                                    {/* Updated Status Badge Text */}
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                        doc.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                                        doc.status === 'review_complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {getStatusText(doc.status)}
                                    </span>
                                    {/* Download original document */}
                                    <button
                                        onClick={() => handleDownload(doc._id, doc.fileName)}
                                        className="p-2 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                        title="Download Original Document"
                                    >
                                        <FaDownload />
                                    </button>
                                    {/* REMOVED: Submit for Review Button */}

                                    {/* Download corrected version */}
                                    {doc.status === 'review_complete' && doc.correctedFileUrl && (
                                        <button
                                            onClick={() => handleDownload(doc._id, `${doc.fileName}_corrected`)}
                                            className="p-2 text-green-600 rounded-full hover:bg-green-100 transition-colors duration-200"
                                            title="Download Final Version"
                                        >
                                            <FaDownload />
                                        </button>
                                    )}
                                    {/* Admin upload corrected version */}
                                    {userProfile?.role === 'admin' && doc.status === 'pending_review' && (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="file"
                                                onChange={handleCorrectedFileChange}
                                                className="text-sm"
                                            />
                                            <button
                                                onClick={() => handleCorrectedUpload(doc._id)}
                                                disabled={!correctedFile || isSubmittingCorrection}
                                                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
                                                title="Upload Corrected Document"
                                            >
                                                {isSubmittingCorrection ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                            </button>
                                        </div>
                                    )}
                                    {/* Delete button */}
                                    {userProfile?.role !== 'admin' && (
                                        <button
                                            onClick={() => setIsConfirmDeleteOpen(doc._id)}
                                            className="p-2 text-red-600 rounded-full hover:bg-red-100 transition-colors duration-200"
                                            title="Delete Document"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic p-4 text-center bg-gray-100 rounded-xl">No documents uploaded yet.</p>
                )}
            </div>

            {/* Confirmation Modal for Deletion */}
            {isConfirmDeleteOpen && (
                <ConfirmationModal
                    isOpen={!!isConfirmDeleteOpen} // Add this prop
                    message="Are you sure you want to delete this document? This action cannot be undone."
                    onConfirm={() => confirmDeletion(isConfirmDeleteOpen)}
                    onCancel={() => setIsConfirmDeleteOpen(null)}
                    title="Delete Document"
                    confirmButtonText="Delete"
                />
            )}

            {/* REMOVED: Confirmation Modal for Submission */}
        </div>
    );
};

export default DocumentListModal;