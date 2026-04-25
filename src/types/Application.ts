// src/types/Application.ts or a new file like src/types/index.ts

export interface Email {
  subject: string;
  body: string;
  recipient: string;
  sentAt: string;
}

export interface Document {
  _id: string;
  applicationId: Application;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  // Fields for the document review feature
  status: 'uploaded' | 'pending_review' | 'review_complete';
  correctedFileUrl?: string;
}

export interface Application {
  contactEmail: string;
  _id: string;
  userId: string;
  userEmail: string;
  schoolName: string;
  position: string;
  programName: string;
  funding: string;
  fundingAmount: string;
  deadline: string;
  status: 'Interested' | 'Submitted' | 'Accepted' | 'Rejected';
  notes: string;
  emails: Email[];
  greWaiver: string;
  ieltsWaiver: string;
  appFeeWaiver: string;
  requiredDocs: string[];
  appLink: string;
  professors: string;
}