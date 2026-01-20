export interface ICompany {
  id: string;
  name: string;
  logo: string; // URL to company logo
  website: string;
  description: string;
  industry: string;
  employees: number;
  location: string;
  partneredSince: number; // timestamp
  workshopIds: string[]; // Workshops conducted/participated
  trainersCount: number;
  testimonials: number;
  isActive: boolean;
  order: number;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  contact: {
    email: string;
    phone: string;
    contactPerson: string;
  };
  createdAt: number;
  updatedAt: number;
}

export const COMPANIES_COLLECTION = 'companies';
