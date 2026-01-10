export interface IRegistration {
  id?: string;
  userName: string;
  email: string;
  phone: string;
  workshopId: string;
  workshopTitle?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  paymentId?: string;
  amount: number;
  registrationDate: string; // ISO date
  confirmationDate?: string; // ISO date
  cancellationReason?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export const REGISTRATIONS_COLLECTION = 'registrations';
