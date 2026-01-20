export interface ICertificate {
  id?: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  certificateId: string;
  completionDate: string; // ISO date
  issueDate: string; // ISO date
  instructorName?: string;
  courseCode?: string;
  certificateUrl?: string;
  status: 'issued' | 'pending' | 'revoked';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export const CERTIFICATES_COLLECTION = 'certificates';
