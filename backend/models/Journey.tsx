export interface IJourney {
  id?: string;
  name: string;
  company: string;
  position: string; // Job title/role after workshop
  workshopName?: string; // e.g., "Niklaus"
  photo?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  isActive: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export const JOURNEYS_COLLECTION = 'journeys';
