/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, type ReactNode } from "react";
import type { DropResult } from "@hello-pangea/dnd"; // Assuming DropResult is available

// --- IMPORT ALL COMPONENTS ---
import Modal from "../components/Modal";
import FinancialSupportHistory from "../components/Dashboard/FinancialSupportHistory";
import FinancialSupportFormModal from "../components/FinancialSupportFormModal";
import ConfirmationModal from "../components/common/ConfirmationModal";
import JoinProjectsModal from "../components/JoinProjectsModal";
import AddApplicationForm from "../components/AddApplicationForm";
import EditApplicationForm from "../components/EditApplicationForm";
import FeedbackForm from "../components/FeedbackForm";
import ApplicationTrackerModal from "../components/ApplicationTrackerModal";
import AcademicCVRequestForm from "../components/AcademicCVRequestForm";
import DocumentReviewServices from "../components/Dashboard/DocumentReviewServices";
import MentorSelectionModal from "../components/MentorSelection";
import ApplicationDetail from "../components/ApplicationDetail";

// IMPORTANT FIX: These imports must point to your actual type files.
import type { Application } from "../types/Application";
import type { Group } from "../types/Group";
import type { CVRequest } from "../types/documents"; // Corrected import
// 🟢 CRITICAL FIX 1: Import the missing type
import type { UserSOPStats } from "../hooks/useSOPStats"; 


// ----------------------------------------------------
// ------------- MODAL CONTEXT TYPES ------------------
// ----------------------------------------------------

// 1. Define Props for each specific Modal Type
interface BaseModalProps {
    onClose?: () => void;
}

interface ConfirmationModalProps extends BaseModalProps {
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    title?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

interface ApplicationBaseProps extends BaseModalProps {
    application: Application;
}

// 🚨 FIX FOR Dashboard.tsx ERROR (TrackerModal)
interface TrackerModalPayload extends BaseModalProps {
    applications: Application[];
    onApplicationStatusChange: (result: DropResult) => void;
    // 💡 THE MISSING PROP: This is what Dashboard.tsx was trying to pass
    onRefreshApplications: () => void; 
}

// 🚨 FIX FOR ApplicationTrackerPage.tsx Error (AddApplicationModal)
interface AddApplicationModalPayload extends BaseModalProps {
    // This is the prop the Add Application Modal component calls on success
    onSuccess: () => void; 
}

// 2. Create the Discriminated Union Type (ModalMap)
export type ModalMap = {
    // --- CONFIRMATION ---
    confirmationModal: { type: 'confirmationModal'; props: ConfirmationModalProps };

    // --- APPLICATION TRACKER ---
    addApplicationModal: { type: 'addApplicationModal'; props: AddApplicationModalPayload };
    editApplicationModal: { type: 'editApplicationModal'; props: ApplicationBaseProps };
    applicationDetailModal: { type: 'applicationDetailModal'; props: ApplicationBaseProps };
    // 💡 THE CRITICAL UNION MEMBER
    trackerModal: { type: 'trackerModal'; props: TrackerModalPayload };
    
    // --- FINANCIAL/PROJECTS ---
    financialSupportForm: { type: 'financialSupportForm'; props: BaseModalProps & { applications?: Application[]; userGroups?: Group[]; } };
    financialSupportHistory: { type: 'financialSupportHistory'; props: BaseModalProps };
    projectsModal: { type: 'projectsModal'; props: BaseModalProps };
    financialSupportModal: { type: 'financialSupportModal'; props: BaseModalProps };

    // --- SERVICES ---
    feedbackModal: { type: 'feedbackModal'; props: BaseModalProps };
    documentReviewModal: { type: 'documentReviewModal'; props: BaseModalProps };
    cvServiceModal: { type: 'cvServiceModal'; props: BaseModalProps };
    mentorConnectionModal: { type: 'mentorConnectionModal'; props: BaseModalProps };
    aiPredictorModal: { type: 'aiPredictorModal'; props: BaseModalProps };

    [key: string]: { type: string; props: any }; // Fallback for untyped modals
};

// 3. Extract the names and props for the context
export type ModalName = keyof ModalMap;
export type ModalPayload<T extends ModalName> = ModalMap[T]['props'];

interface ModalState {
    name: ModalName | null;
    props: any; // Use any here, as the full payload is only guaranteed in openModal call
}

interface ModalContextType {
    modalState: ModalState;
    // 4. Set openModal to use the Discriminated Union
    openModal: <T extends ModalName>(name: T, props?: ModalPayload<T>) => void;
    closeModal: () => void;
    
    // 💡 Pass the SOP Stats needed by App/Consumers
    userSOPStats?: UserSOPStats; 
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};

// ----------------------------------------------------
// ----------- MODAL PROVIDER SERVICE PROPS (FIXED) ---
// ----------------------------------------------------

interface ModalProviderServiceProps {
    applications: Application[];
    onApplicationUpdated: () => void;
    openEditModal: (application: Application) => void;
    onApplicationDeleted: (id: string) => void;
    onDragEnd: (result: any) => void;
    currentUserUid: string | undefined;
    handleCVUpload: (file: File) => Promise<void>;
    handleNewCVRequest: (data: any) => Promise<void>;
    handleRequestSOPWriting: (applicationId: string) => Promise<void>;
    handleSendMentorRequest: (mentorId: string) => Promise<void>;
    userGroups: Group[];
    cvRequest: CVRequest | null;
    
    // 🟢 CRITICAL FIX 2: Add the missing prop from App.tsx
    userSOPStats?: UserSOPStats; 
}

interface ModalProviderProps extends ModalProviderServiceProps {
    children: ReactNode;
}

// ----------------------------------------------------
// ----------------- MODAL PROVIDER (FIXED) -----------
// ----------------------------------------------------

export const ModalProvider = ({
    children,
    applications,
    onDragEnd,
    currentUserUid,
    onApplicationUpdated,
    onApplicationDeleted,
    handleCVUpload,
    handleNewCVRequest,
    handleRequestSOPWriting,
    handleSendMentorRequest,
    userGroups,
    cvRequest,
    userSOPStats, // 🟢 CRITICAL FIX 3: Destructure the new prop
}: ModalProviderProps) => {
    const [modalState, setModalState] = useState<ModalState>({
        name: null,
        props: {},
    });

    // 5. Use the specific ModalName type for the state name
    const openModal = <T extends ModalName>(name: T, props: ModalPayload<T> = {} as ModalPayload<T>) => {
        // We cast props to 'any' for the state, as its type is inferred by 'name' on retrieval
        setModalState({ name, props: props as any }); 
    };

    const closeModal = () => {
        setModalState({ name: null, props: {} });
    };

    // Application that was passed into the openModal call
    // Cast the props to the expected ApplicationBaseProps when accessing 'application'
    const selectedApplication = (modalState.props as ApplicationBaseProps)?.application;

    // Handlers
    const handleViewDetailsFromTracker = (application: Application) => {
        closeModal();
        openModal("applicationDetailModal", { application });
    };

    const handleViewDashboardSections = () => {
        console.log('Scrolling to dashboard sections is a Dashboard-specific action.');
        closeModal();
    };
    
    // Local function to open the edit modal using the global system
    const openEditModal = (application: Application) => {
        openModal("editApplicationModal", { application });
    }

    const renderModal = () => {
        if (!modalState.name) return null;

        const baseProps = { isOpen: true, onClose: closeModal };
        
        // Use a generic type for props extraction since the name is known in the switch block
        const modalProps = modalState.props;

        switch (modalState.name) {

            // --- FINANCIAL/PROJECTS ---
            case "financialSupportForm": {
                // Now accessing generic props (not guaranteed by type but available at runtime)
                const apps = modalProps.applications || applications;
                const groups = modalProps.userGroups || userGroups;
                return (
                    <FinancialSupportFormModal
                        {...baseProps}
                        applications={apps}
                        userGroups={groups}
                    />
                );
            }

            case "financialSupportHistory":
                return (
                    <Modal {...baseProps} title="Financial Support History">
                        <FinancialSupportHistory onClose={closeModal} />
                    </Modal>
                );

            case "projectsModal":
                return (
                    <Modal {...baseProps} title="Join Ongoing Projects" size="lg">
                        <JoinProjectsModal onClose={closeModal} />
                    </Modal>
                );

            // --- SERVICES ---
            case "addApplicationModal": {
                // 🚨 FIX: Safely access onSuccess (guaranteed by type AddApplicationModalPayload)
                const { onSuccess } = modalProps as AddApplicationModalPayload;
                return (
                    <Modal {...baseProps} title="Add New Application" size="lg">
                        <AddApplicationForm
                            onApplicationAdded={() => {
                                onApplicationUpdated(); // Default action: refresh applications
                                if (onSuccess) {
                                    onSuccess(); // The callback passed from ApplicationTrackerPage/Dashboard
                                }
                                closeModal(); // Close the modal upon success
                            }}
                            onClose={closeModal}
                        />
                    </Modal>
                );
            }

            case "feedbackModal":
                return (
                    <Modal {...baseProps} title="Feedback" size="md">
                        <FeedbackForm onClose={closeModal} onFeedbackSubmitted={closeModal} />
                    </Modal>
                );

            case "applicationDetailModal":
                // selectedApplication is available via ModalProvider state
                return selectedApplication ? (
                    <ApplicationDetail
                        application={selectedApplication}
                        onClose={closeModal}
                        onDelete={onApplicationDeleted}
                        onEdit={() => openEditModal(selectedApplication)}
                        onApplicationUpdated={onApplicationUpdated}
                    />
                ) : null;

            case "editApplicationModal":
                // selectedApplication is available via ModalProvider state
                return selectedApplication ? (
                    <Modal {...baseProps} title="Edit Application" size="lg">
                        <EditApplicationForm
                            application={selectedApplication}
                            onApplicationUpdated={() => {
                                onApplicationUpdated();
                                closeModal();
                            }}
                            onClose={closeModal}
                        />
                    </Modal>
                ) : null;

            case "trackerModal": {
                // 🚨 FIX: Access props guaranteed by type TrackerModalPayload
                const { applications: appsPayload, onApplicationStatusChange, onRefreshApplications } = modalProps as TrackerModalPayload;
                
                const apps = appsPayload || applications;
                const onStatusChange = onApplicationStatusChange || onDragEnd;
                
                return (
                    <ApplicationTrackerModal
                        isOpen
                        onClose={closeModal}
                        applications={apps}
                        onApplicationStatusChange={onStatusChange}
                        onViewDetailsModal={handleViewDetailsFromTracker}
                        onEditApplicationModal={openEditModal} // Use the local helper
                        onViewDashboardSections={handleViewDashboardSections}
                        // 💡 FIX: Pass the refresh prop received from Dashboard
                        onRefreshApplications={onRefreshApplications || onApplicationUpdated} 
                    />
                );
            }

            case "documentReviewModal":
                return currentUserUid ? (
                    <Modal {...baseProps} title="SOP & CV Live Writing" size="lg">
                        <DocumentReviewServices
                            applications={applications}
                            // NOTE: Since DocumentReviewServices is a component in your hierarchy, it should probably
                            // use the useSOPStats hook directly, or receive the userSOPStats prop here if it's required.
                            onRequestSOPWriting={handleRequestSOPWriting as (applicationId: string) => void}
                            currentUserUid={currentUserUid}
                            // Pass the needed prop down if the component requires it
                            // userSOPStats={userSOPStats} 
                        />
                    </Modal>
                ) : null;

            case "cvServiceModal":
                return (
                    <Modal {...baseProps} title="Academic CV Service" size="lg">
                        <AcademicCVRequestForm
                            onClose={closeModal}
                            onUpload={handleCVUpload}
                            onNewRequest={handleNewCVRequest}
                            cvRequest={cvRequest}
                        />
                    </Modal>
                );

            case "mentorConnectionModal":
                return (
                    <Modal {...baseProps} title="Select a Mentor" size="lg">
                        <MentorSelectionModal
                            onClose={closeModal}
                            onSendRequest={handleSendMentorRequest}
                        />
                    </Modal>
                );

            case "financialSupportModal":
                return (
                    <FinancialSupportFormModal
                        applications={applications}
                        userGroups={userGroups}
                        onClose={closeModal}
                    />
                );

            case "aiPredictorModal":
                return (
                    <Modal {...baseProps} title="AI Prediction Results" size="md">
                        <div className="p-4 text-gray-700">AI Prediction component goes here.</div>
                    </Modal>
                );

            // --- CONFIRMATION ---
            case "confirmationModal": {
                // Safely access props (guaranteed by type ConfirmationModalProps)
                const { onConfirm, onCancel, message, title, confirmButtonText, cancelButtonText } = modalProps as ConfirmationModalProps;
                return (
                    <ConfirmationModal
                        isOpen={true}
                        onCancel={onCancel || closeModal}
                        onConfirm={onConfirm || (() => {})}
                        message={message ?? ""}
                        title={title}
                        confirmButtonText={confirmButtonText}
                        cancelButtonText={cancelButtonText}
                    />
                );
            }

            default:
                return null;
        }
    };

    const value = { modalState, openModal, closeModal, userSOPStats }; // 🟢 Include userSOPStats in context value

    return (
        <ModalContext.Provider value={value}>
            {children}
            {renderModal()}
        </ModalContext.Provider>
    );
};