export interface IScholarship {
  id: string;
  name: string;
  description: string;
  amount: number; // Amount in currency
  percentage: number; // Discount percentage (0-100)
  criteria: string[]; // Eligibility criteria
  category: 'merit' | 'financial' | 'diversity' | 'need-based';
  workshopIds: string[]; // Applicable workshops
  totalSlots: number;
  availableSlots: number;
  awardedTo: string[]; // User IDs who received the scholarship
  startDate: number;
  endDate: number;
  isActive: boolean;
  order: number;
  tags: string[];
  requirements: string[]; // Application requirements
  createdAt: number;
  updatedAt: number;
}

export const SCHOLARSHIPS_COLLECTION = 'scholarships';
