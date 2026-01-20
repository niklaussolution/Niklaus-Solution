export interface IContent {
  id?: string;
  section: string;
  title?: string;
  description?: string;
  content?: any;
  order?: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export const CONTENT_COLLECTION = 'content';

