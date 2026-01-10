export interface ITrainer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  expertise: string[]; // Array of skills/expertise
  experience: string; // e.g., "5+ years"
  qualifications?: string[];
  workshopIds: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  rating: number; // 0-5
  reviewCount: number;
  isActive: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export const TRAINERS_COLLECTION = 'trainers';
