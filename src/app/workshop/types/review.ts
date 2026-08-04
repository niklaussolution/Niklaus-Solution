export interface Review {
  id?: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: unknown;
}
