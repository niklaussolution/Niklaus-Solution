export interface IVideo {
  id?: string;
  title: string;
  youtubeUrl: string;
  thumbnail?: string;
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export const VIDEOS_COLLECTION = 'videos';

