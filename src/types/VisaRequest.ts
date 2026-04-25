// src/types/VisaRequest.ts

import { Timestamp } from 'firebase/firestore';

export interface VisaRequest {
    id?: string;
    userId: string;
    userEmail: string;
    country: string;
    embassy: string;
    visaType: string;
    interviewDate: string; // Stored as YYYY-MM-DD string
    notes: string;
    status: 'pending' | 'scheduled' | 'declined'; // Updated status type
    requestedAt: Timestamp;
    adminResponse?: string;
    scheduledDate?: string; // New: Date scheduled by admin
    scheduledTime?: string; // New: Time scheduled by admin
    zoomLink?: string; // New: Zoom link provided by admin
    respondedAt?: Timestamp;
}