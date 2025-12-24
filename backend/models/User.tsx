export interface IUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  workshop?: string;
  registeredAt: number;
  status: 'registered' | 'attended' | 'cancelled';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export const USERS_COLLECTION = 'users';

