/* eslint-disable no-irregular-whitespace */
// src/types/documents.ts

// The main Program interface, which seems to be the core application data
export interface Program {
  _id: string;
  university: string;
  department: string;
  funding: string;
  fundingAmount: string;
  deadline: string;
  greWaiver: string;
  ieltsWaiver: string;
  appFeeWaiver: string;
  requiredDocs: string[];
  appLink: string;
}

// Interface for the populated application data returned from the API
export interface PopulatedApplication {
  _id: string;
  schoolName: string;
  programName: string;
}

// The Document interface, which now correctly uses the populated application type
export interface Document {
  _id: string;
  applicationId: PopulatedApplication;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  status: 'uploaded' | 'pending_review' | 'review_complete';
  correctedFileUrl?: string;
}

// You can add other related types here as well
export interface Email {
  subject: string;
  body: string;
  recipient: string;
  sentAt: string;
}

// --- CENTRALIZED TYPE DEFINITION for CV Request ---

// The complete set of status options for a CV request
// UPDATED: Added 'scheduled' status
export type CVRequestStatus = 'pending' | 'review' | 'feedback' | 'completed' | 'declined' | 'scheduled';

export interface CVRequest {
    // Using the API's standard primary key
    _id: string; // Changed 'id' to '_id' for Mongoose convention consistency
    userId: string;

    // ⭐ CRITICAL FIX: Added 'type' field to distinguish between request origins
    type: 'cv_upload' | 'new_cv_request'; 

    // Using the single, comprehensive CVRequestStatus type
    status: CVRequestStatus; 

    // Use property names consistent with AcademicCVHistory.tsx
    timestamp: string; // The submission/creation date

    uploadedFileUrl?: string | null; // Corresponds to user's initial file (if 'cv_upload')
    finalDocumentUrl?: string | null; // Corresponds to the mentor's final reviewed document

    mentorFeedback?: string; // Corresponds to the mentor's response
    notes?: string; // Corresponds to user's initial notes

    // Added scheduling fields for 'new_cv_request' type
    scheduledDate?: string; 
    scheduledTime?: string;
    zoomLink?: string;
}

// ---------------------------------------------------
// NOTE: SOPRequest definition would also typically go here
// but is omitted as it was not provided in the original file.
// ---------------------------------------------------