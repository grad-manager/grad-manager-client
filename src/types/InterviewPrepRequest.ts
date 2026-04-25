/* eslint-disable @typescript-eslint/no-explicit-any */
export interface InterviewPrepRequest {
    id?: string;
    userId: string;
    userEmail: string;
    applicationId: string;
    schoolName: string;
    programName: string;
    interviewDate: string;
    notes: string;
    status: 'pending' | 'scheduled' | 'complete' | 'cancelled';
    requestedAt: any; // Using 'any' for serverTimestamp to avoid type issues
    
    // NEW FIELDS
    adminResponse?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    zoomLink?: string;
}