// src/components/Dashboard/DocumentReviewServices.tsx
import React from 'react';
import SOPRequestCard from './SOPRequestCard';
import type { Application } from '../../types/Application';

interface DocumentReviewServicesProps {
    applications: Application[];
    onRequestSOPWriting: (applicationId: string) => void;
    currentUserUid: string;
}

const DocumentReviewServices: React.FC<DocumentReviewServicesProps> = ({
    applications,
    onRequestSOPWriting,
    currentUserUid,
}) => {
    return (
        <section className="section-gradient rounded-xl2 shadow-card-xl border border-gray-100 p-6 sm:p-10 mt-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary flex items-center space-x-2 text-gradient">
                    <span>📄</span>
                    <span>Document Review & Writing Services</span>
                </h2>
                <p className="text-sm text-neutralDark mt-2 sm:mt-0 italic">
                    Get professional feedback & polished documents for your applications
                </p>
            </div>

            {/* SOP Live Writing Card */}
            <div className="card-hover">
                <SOPRequestCard
                    applications={applications}
                    onRequestSOPWriting={onRequestSOPWriting}
                    currentUserUid={currentUserUid}
                />
            </div>
        </section>
    );
};

export default DocumentReviewServices;
