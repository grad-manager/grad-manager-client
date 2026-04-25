// src/types/AcademicCVRequest.ts

export interface AcademicCVRequest {
    id: string;
    
    // FIX 1: Include all statuses used in the application.
    status: 'pending' | 'review' | 'feedback' | 'completed' | 'declined' | 'scheduled' | 'review_complete' | 'none';
    
    // FIX 2: Add the missing data fields (which caused the TypeScript error in useCVRequest):
    timestamp: string;             // Mapped from DB's createdAt
    uploadedFileUrl?: string | null; // Mapped from DB's cvUrl (Original file)
    finalDocumentUrl?: string | null; // Mapped from DB's correctedCvUrl (Final file)

    // FIX 3: Correct the name for the final document link (client component expects finalDocumentUrl)
    // We will include 'correctedCvUrl' as well in case other parts of the app are using it, 
    // but the primary link should be finalDocumentUrl to match the server-side mapping.
    // NOTE: If you remove 'correctedCvUrl' from the interface, ensure you remove it from the useCVRequest hook as well.
    correctedCvUrl?: string | null; // Keeping this for backwards compatibility, but use finalDocumentUrl

    // FIX 4: Add other important fields returned by the server
    mentorFeedback?: string | null;
    notes?: string | null;
    type?: 'cv_upload' | 'new_cv_request'; // Ensure type is present

    // Existing scheduling fields (Updated to allow null/undefined as per server)
    scheduledDate?: string | null;
    scheduledTime?: string | null;
    zoomLink?: string | null;
}