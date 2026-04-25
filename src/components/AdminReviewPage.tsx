/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import type { Document } from '../types/documents';
import api from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL;

const AdminReviewPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // Corrected state type to allow null values
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

    const fetchDocumentsForReview = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const response = await api.get<Document[]>(`${API_URL}/admin/documents/for-review`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents for review:', error);
            alert('Failed to fetch documents for review.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentsForReview();
    }, [currentUser]);

    const handleFileChange = (docId: string, file: File | null) => {
        setSelectedFiles(prev => ({
            ...prev,
            [docId]: file,
        }));
    };

    const handleCorrectedFileUpload = async (documentId: string, applicationId: string) => {
        const selectedFile = selectedFiles[documentId];
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        setUploadingDocId(documentId);
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            await api.post(
                `${API_URL}/applications/${applicationId}/documents/${documentId}/corrected-version`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            handleFileChange(documentId, null);
            fetchDocumentsForReview();
            alert('Corrected document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading corrected document:', error);
            alert('Failed to upload corrected document.');
        } finally {
            setUploadingDocId(null);
        }
    };
    
    // NOTE: It's better to implement a download logic similar to the first component
    // that fetches a signed URL from the backend to handle secure downloads.
    const handleDownload = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Documents Awaiting Review</h1>
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            ) : documents.length > 0 ? (
                <ul className="space-y-4">
                    {documents.map(doc => (
                        <li key={doc._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-xl font-bold text-gray-700">{doc.fileType} for {doc.applicationId.programName}</h3>
                                <p className="text-gray-500">
                                    School: {doc.applicationId.schoolName}
                                    <br />
                                    Filename: {doc.fileName}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleDownload(doc.fileUrl)}
                                    className="p-3 text-blue-600 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                                    title="Download Original"
                                >
                                    <FaDownload />
                                </button>
                                
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(doc._id, e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                    />
                                    <span className="cursor-pointer p-3 text-purple-600 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-200" title="Upload Corrected Version">
                                        {selectedFiles[doc._id] ? <FaCheck className="text-green-600" /> : <FaUpload />}
                                    </span>
                                </label>
                                
                                <button
                                    onClick={() => handleCorrectedFileUpload(doc._id, doc.applicationId._id)}
                                    disabled={!selectedFiles[doc._id] || uploadingDocId === doc._id}
                                    className="p-3 text-white bg-green-600 rounded-full shadow-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Submit Corrected Document"
                                >
                                    {uploadingDocId === doc._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 italic">No documents currently awaiting review.</p>
            )}
        </div>
    );
};

export default AdminReviewPage;