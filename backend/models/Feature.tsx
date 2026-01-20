export interface IFeature {
  id: string;
  title: string;
  description: string;
  icon: string; // SVG or icon name from lucide-react
  category: 'core' | 'advanced' | 'premium'; // Feature tier
  isActive: boolean;
  order: number;
  benefits: string[]; // Array of benefit descriptions
  relatedWorkshops: string[]; // Workshop IDs that have this feature
  features: string[]; // Specific capabilities
  tags: string[]; // Tags for filtering/grouping
  createdAt: number;
  updatedAt: number;
}

export const FEATURES_COLLECTION = 'features';
