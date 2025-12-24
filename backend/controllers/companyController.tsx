import { getDatabase } from '../config/database';
import { ICompany, COMPANIES_COLLECTION } from '../models/Company';

const db = getDatabase();

export const companyController = {
  getAllCompanies: async () => {
    try {
      const query = db.collection(COMPANIES_COLLECTION).orderBy('order', 'asc');
      const snapshot = await query.get();
      const companies = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as ICompany));

      return { success: true, data: companies };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getCompanyById: async (id: string) => {
    try {
      const doc = await db.collection(COMPANIES_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Company not found' };
      }

      return {
        success: true,
        data: { id: doc.id, ...doc.data() } as ICompany,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  createCompany: async (data: Omit<ICompany, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validation
      if (!data.name?.trim()) {
        return { success: false, error: 'Company name is required' };
      }

      if (!data.contact?.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return { success: false, error: 'Valid email is required' };
      }

      if (!data.contact?.phone || !/^\d{10}/.test(data.contact.phone)) {
        return { success: false, error: 'Valid phone number is required' };
      }

      if (data.employees < 0) {
        return { success: false, error: 'Invalid employee count' };
      }

      const now = Date.now();
      const docRef = await db.collection(COMPANIES_COLLECTION).add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        data: {
          id: docRef.id,
          ...data,
          createdAt: now,
          updatedAt: now,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateCompany: async (id: string, data: Partial<Omit<ICompany, 'id' | 'createdAt'>>) => {
    try {
      const doc = await db.collection(COMPANIES_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Company not found' };
      }

      // Validation
      if (data.contact?.email && !data.contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return { success: false, error: 'Valid email is required' };
      }

      if (data.employees !== undefined && data.employees < 0) {
        return { success: false, error: 'Invalid employee count' };
      }

      await db.collection(COMPANIES_COLLECTION).doc(id).update({
        ...data,
        updatedAt: Date.now(),
      });

      const updatedDoc = await db.collection(COMPANIES_COLLECTION).doc(id).get();

      return {
        success: true,
        data: { id: updatedDoc.id, ...updatedDoc.data() } as ICompany,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteCompany: async (id: string) => {
    try {
      const doc = await db.collection(COMPANIES_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Company not found' };
      }

      await db.collection(COMPANIES_COLLECTION).doc(id).delete();

      return { success: true, message: 'Company deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  reorderCompanies: async (companyIds: string[]) => {
    try {
      const batch = db.batch();

      companyIds.forEach((id, index) => {
        batch.update(db.collection(COMPANIES_COLLECTION).doc(id), {
          order: index,
          updatedAt: Date.now(),
        });
      });

      await batch.commit();

      return { success: true, message: 'Companies reordered successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getCompanyStats: async () => {
    try {
      const snapshot = await db.collection(COMPANIES_COLLECTION).get();
      const companies = snapshot.docs.map((doc: any) => doc.data() as ICompany);

      const stats = {
        total: companies.length,
        active: companies.filter((c: any) => c.isActive).length,
        totalEmployees: companies.reduce((sum: any, c: any) => sum + c.employees, 0),
        totalTestimonials: companies.reduce((sum: any, c: any) => sum + c.testimonials, 0),
        totalTrainers: companies.reduce((sum: any, c: any) => sum + c.trainersCount, 0),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
