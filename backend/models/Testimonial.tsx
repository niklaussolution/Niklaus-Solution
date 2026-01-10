export interface ITestimonial {
  id?: string;
  name: string;
  photo: string;
  imageUrl?: string;
  company: string;
  role: string;
  review: string;
  rating: number; // 1-5
  workshopId: string;
  workshopTitle?: string;
  email?: string;
  isFeatured: boolean;
  isApproved: boolean;
  isActive: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export const TESTIMONIALS_COLLECTION = 'testimonials';
