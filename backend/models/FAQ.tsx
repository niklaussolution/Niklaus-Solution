export interface IFAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'pricing' | 'registration' | 'certification';
  workshopId?: string; // Optional, for workshop-specific FAQs
  order: number;
  isActive: boolean;
  tags: string[];
  views: number;
  helpful: number; // Count of "helpful" votes
  unhelpful: number; // Count of "not helpful" votes
  createdAt: number;
  updatedAt: number;
}

export const FAQ_COLLECTION = 'faqs';
