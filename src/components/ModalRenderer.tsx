/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useModal } from '../context/ModalContext'; 
// Hooks and Types from your Dashboard.tsx
import type { Application } from '../types/Application';
import type { Group } from '../types/Group'; 
// ✅ FIX: Import the authoritative CVRequest type from the centralized documents file
import type { CVRequest } from '../types/documents'; 

// Components (Adjust paths as necessary)
import Modal from './Modal';
import AddApplicationForm from './AddApplicationForm';
import EditApplicationForm from './EditApplicationForm';
import FeedbackForm from './FeedbackForm';
import ApplicationTrackerModal from './ApplicationTrackerModal';
// The actual component is AcademicCVRequestForm, but it's used as a modal content
import AcademicCVRequestModal from './AcademicCVRequestForm'; 
import DocumentReviewServices from './Dashboard/DocumentReviewServices';
import MentorSelectionModal from './MentorSelection';
import JoinProjectsModal from './JoinProjectsModal'; 
import FinancialSupportFormModal from './FinancialSupportFormModal';
import ApplicationDetail from './ApplicationDetail';


// ⚠️ NOTE: The local mock types have been correctly removed in the previous step.

interface ModalRendererProps {
    applications: Application[];
    onApplicationUpdated: () => void; // This acts as the refresh function
    onApplicationDeleted: (id: string) => void;
    openEditModal: (application: Application) => void; 
    onDragEnd: (result: any) => void; 
    currentUserUid: string | undefined;
    // Interview Modal Props (Kept for completeness, though unused in component logic below)
    handleCloseInterviewModal: () => void;
    handleInterviewRequestSent: () => void;
    // CV/Document Props
    handleCVUpload: (file: File) => Promise<void>;
    handleNewCVRequest: (data: any) => Promise<void>;
    handleRequestSOPWriting: (applicationId: string) => Promise<void>;
    // Mentor Props
    handleSendMentorRequest: (mentorId: string) => Promise<void>;
    // Financial/Groups Props (passed to the form)
    userGroups: Group[]; 
    // ✅ FIX: Now correctly using the imported CVRequest type
    activeCVRequest: CVRequest | null;
}

const ModalRenderer: React.FC<ModalRendererProps> = ({
    applications,
    onApplicationUpdated, // This function is needed for the ApplicationTrackerModal refresh
    onApplicationDeleted, 
    openEditModal, 
    onDragEnd,
    currentUserUid,
    handleCVUpload,
    handleNewCVRequest,
    handleRequestSOPWriting,
    handleSendMentorRequest,
    userGroups, 
    activeCVRequest, // Now correctly typed
    // Destructure unused props to satisfy the interface, even if not used in the JSX below
}) => {
    const { modalState, closeModal, openModal } = useModal(); 

    const selectedApplication = modalState.props.application as Application | undefined;
    
    // Handlers specific to ApplicationTrackerModal in Dashboard.tsx
    const handleViewDetailsFromTracker = (application: Application) => {
        closeModal();
        openModal("applicationDetailModal", { application });
    };
    
    // FIX: New handler for editing from tracker (uses the passed-in openEditModal)
    const handleEditDetailsFromTracker = (application: Application) => {
        closeModal();
        openEditModal(application);
    };

    const handleViewDashboardSections = () => {
        console.log('Scrolling to dashboard sections is a Dashboard-specific action.');
        closeModal();
    };

    return (
        <>
            {/* ---------------- GENERIC MODALS ---------------- */}
            {/* Add Application Modal (Used by Admin in Dashboard) */}
            {modalState.name === "addApplicationModal" && (
                <Modal isOpen onClose={closeModal} title="Add New Application" size="lg">
                    <AddApplicationForm
                        // Use modalState.props.onSuccess if provided by the caller (ApplicationTrackerPage) 
                        // otherwise fall back to the default onApplicationUpdated.
                        onApplicationAdded={modalState.props.onSuccess || onApplicationUpdated} 
                        onClose={closeModal}
                    />
                </Modal>
            )}

            {/* Feedback Modal */}
            {modalState.name === "feedbackModal" && (
                <Modal isOpen onClose={closeModal} title="Feedback" size="md">
                    <FeedbackForm
                        onClose={closeModal}
                        onFeedbackSubmitted={closeModal}
                    />
                </Modal>
            )}
            
            {/* ---------------- APPLICATION DETAIL MODALS ---------------- */}
            {/* View Details Modal: Using the full ApplicationDetail component */}
            {modalState.name === "applicationDetailModal" && selectedApplication && (
                <ApplicationDetail
                    application={selectedApplication}
                    onClose={closeModal}
                    onDelete={onApplicationDeleted} 
                    onEdit={() => openEditModal(selectedApplication)} 
                    onApplicationUpdated={onApplicationUpdated} 
                />
            )}

            {/* Edit Application Modal */}
            {modalState.name === "editApplicationModal" && selectedApplication && (
                <Modal isOpen onClose={closeModal} title="Edit Application" size="lg">
                    <EditApplicationForm
                        application={selectedApplication}
                        onApplicationUpdated={onApplicationUpdated} 
                        onClose={closeModal}
                    />
                </Modal>
            )}

            {/* ---------------- SERVICE MODALS ---------------- */}
            {/* Tracker Modal (Used on Home and Dashboard) */}
            {modalState.name === "trackerModal" && (
                <ApplicationTrackerModal
                    isOpen
                    onClose={closeModal}
                    applications={applications}
                    onApplicationStatusChange={onDragEnd}
                    onViewDetailsModal={handleViewDetailsFromTracker}
                    onEditApplicationModal={handleEditDetailsFromTracker} 
                    onViewDashboardSections={handleViewDashboardSections}
                    // ✅ FIX: Pass the required refresh function. onApplicationUpdated is the closest equivalent.
                    onRefreshApplications={onApplicationUpdated}
                />
            )}

            {/* Document Review / SOP & CV Live Writing Modal */}
            {modalState.name === "documentReviewModal" && currentUserUid && (
                <Modal isOpen onClose={closeModal} title="SOP & CV Live Writing" size="lg">
                    <DocumentReviewServices
                        applications={applications}
                        onRequestSOPWriting={handleRequestSOPWriting}
                        currentUserUid={currentUserUid}
                    />
                </Modal>
            )}

            {/* CV Service Modal */}
            {modalState.name === "cvServiceModal" && (
                // ✅ FIX: Wrap AcademicCVRequestModal (the form) in the generic Modal
                <Modal isOpen onClose={closeModal} title="Academic CV Service" size="lg">
                    <AcademicCVRequestModal
                        onClose={closeModal}
                        onUpload={handleCVUpload}
                        onNewRequest={handleNewCVRequest}
                        // ✅ FIX: Pass the required cvRequest prop
                        cvRequest={activeCVRequest} 
                    />
                </Modal>
            )}
            
            
            {/* Mentor Selection Modal */}
            {modalState.name === "mentorConnectionModal" && (
                <Modal isOpen onClose={closeModal} title="Select a Mentor" size="lg">
                    <MentorSelectionModal
                        onClose={closeModal}
                        onSendRequest={handleSendMentorRequest}
                    />
                </Modal>
            )}
            
            {/* Projects Modal */}
            {modalState.name === "projectsModal" && (
                <Modal isOpen onClose={closeModal} title="Join Ongoing Projects" size="lg">
                    <JoinProjectsModal onClose={closeModal} />
                </Modal>
            )}

            {/* Financial Support Modal (NOW USING FinancialSupportFormModal) */}
            {modalState.name === "financialSupportModal" && (
                <FinancialSupportFormModal 
                    applications={applications}
                    userGroups={userGroups}
                    onClose={closeModal}
                />
            )}

            {/* AI Predictor Modal (Placeholder for now) */}
            {modalState.name === "aiPredictorModal" && (
                <Modal isOpen onClose={closeModal} title="AI Prediction Results" size="md">
                    <div className="p-4 text-gray-700">AI Prediction component (e.g., AIPredictor) goes here.</div>
                </Modal>
            )}
            
        </>
    );
};

export default ModalRenderer;