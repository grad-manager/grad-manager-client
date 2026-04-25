// src/types/Program.ts

export interface Program {
  alreadyAdded: boolean;
  id: string; 
  _id: string;
  university: string;
  department: string;
  professors: string; // <-- Changed to a single string
  funding: string;
  fundingAmount: string;
  deadline: string;
  greWaiver: string;
  ieltsWaiver: string;
  appFeeWaiver: string;
  requiredDocs: string | string[];
  appLink: string;
}

// Interface for the populated application data
export interface PopulatedApplication {
  _id: string;
  schoolName: string;
  programName: string;
}

// Document interface that uses the populated type
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