export interface IPricingPlan {
  id?: string;
  name: string;
  price: number;
  duration: string; // e.g., "per workshop", "per month"
  description: string;
  features: string[];
  isPopular: boolean;
  discountCode?: string;
  discountPercentage?: number;
  validFrom?: string; // ISO date
  validTo?: string; // ISO date
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export const PRICING_PLANS_COLLECTION = 'pricingPlans';
