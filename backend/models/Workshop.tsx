export interface IWorkshop {
  id?: string;
  title: string;
  description: string;
  duration: string; // e.g., "6 Weeks"
  mode: 'Online' | 'Offline' | 'Hybrid';
  startDate: string; // ISO date format
  price: number;
  instructorId: string;
  instructorName?: string;
  capacity: number;
  enrolled: number;
  color: string; // bg-red-500, bg-blue-500, etc.
  isFeatured: boolean;
  isActive: boolean;
  learningOutcomes?: string[]; // Array of key learning outcomes
  requirements?: string[]; // Prerequisites
  image?: string; // Course image URL
  certificateTemplate?: string; // Certificate URL
  createdAt: number;
  updatedAt: number;
}

export const WORKSHOPS_COLLECTION = 'workshops';
