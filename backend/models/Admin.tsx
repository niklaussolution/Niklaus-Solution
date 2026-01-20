export interface IAdmin {
  id?: string;
  name: string;
  email: string;
  firebaseUid: string;
  role: 'super_admin' | 'editor' | 'viewer';
  createdAt: number;
  updatedAt: number;
}

export const ADMINS_COLLECTION = 'admins';

