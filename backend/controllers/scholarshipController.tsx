import { getDatabase } from '../config/database';
import { IScholarship, SCHOLARSHIPS_COLLECTION } from '../models/Scholarship';

const db = getDatabase();

export const scholarshipController = {
  getAllScholarships: async (filter?: { category?: string; isActive?: boolean }) => {
    try {
      let query: any = db.collection(SCHOLARSHIPS_COLLECTION);

      if (filter?.category) {
        query = query.where('category', '==', filter.category);
      }

      if (filter?.isActive !== undefined) {
        query = query.where('isActive', '==', filter.isActive);
      }

      query = query.orderBy('order', 'asc');
      const snapshot = await query.get();
      const scholarships = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as IScholarship));

      return { success: true, data: scholarships };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getScholarshipById: async (id: string) => {
    try {
      const doc = await db.collection(SCHOLARSHIPS_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Scholarship not found' };
      }

      return {
        success: true,
        data: { id: doc.id, ...doc.data() } as IScholarship,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  createScholarship: async (
    data: Omit<IScholarship, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      // Validation
      if (!data.name?.trim()) {
        return { success: false, error: 'Scholarship name is required' };
      }

      if (!data.description?.trim()) {
        return { success: false, error: 'Description is required' };
      }

      if (data.amount < 0 || data.percentage < 0 || data.percentage > 100) {
        return { success: false, error: 'Invalid amount or percentage' };
      }

      if (!['merit', 'financial', 'diversity', 'need-based'].includes(data.category)) {
        return { success: false, error: 'Invalid scholarship category' };
      }

      if (!Array.isArray(data.criteria) || data.criteria.length === 0) {
        return { success: false, error: 'At least one criterion is required' };
      }

      if (data.totalSlots <= 0) {
        return { success: false, error: 'Total slots must be greater than 0' };
      }

      const now = Date.now();
      const docRef = await db.collection(SCHOLARSHIPS_COLLECTION).add({
        ...data,
        awardedTo: [],
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        data: {
          id: docRef.id,
          ...data,
          awardedTo: [],
          createdAt: now,
          updatedAt: now,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateScholarship: async (
    id: string,
    data: Partial<Omit<IScholarship, 'id' | 'createdAt'>>
  ) => {
    try {
      const doc = await db.collection(SCHOLARSHIPS_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Scholarship not found' };
      }

      // Validation
      if (data.percentage !== undefined && (data.percentage < 0 || data.percentage > 100)) {
        return { success: false, error: 'Percentage must be between 0 and 100' };
      }

      if (data.category && !['merit', 'financial', 'diversity', 'need-based'].includes(data.category)) {
        return { success: false, error: 'Invalid scholarship category' };
      }

      if (data.totalSlots !== undefined && data.totalSlots <= 0) {
        return { success: false, error: 'Total slots must be greater than 0' };
      }

      await db.collection(SCHOLARSHIPS_COLLECTION).doc(id).update({
        ...data,
        updatedAt: Date.now(),
      });

      const updatedDoc = await db.collection(SCHOLARSHIPS_COLLECTION).doc(id).get();

      return {
        success: true,
        data: { id: updatedDoc.id, ...updatedDoc.data() } as IScholarship,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteScholarship: async (id: string) => {
    try {
      const doc = await db.collection(SCHOLARSHIPS_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Scholarship not found' };
      }

      await db.collection(SCHOLARSHIPS_COLLECTION).doc(id).delete();

      return { success: true, message: 'Scholarship deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  awardScholarship: async (scholarshipId: string, userId: string) => {
    try {
      const doc = await db.collection(SCHOLARSHIPS_COLLECTION).doc(scholarshipId).get();

      if (!doc.exists) {
        return { success: false, error: 'Scholarship not found' };
      }

      const scholarship = doc.data() as IScholarship;

      if (scholarship.availableSlots <= 0) {
        return { success: false, error: 'No available slots for this scholarship' };
      }

      if (scholarship.awardedTo.includes(userId)) {
        return { success: false, error: 'User already has this scholarship' };
      }

      await db.collection(SCHOLARSHIPS_COLLECTION).doc(scholarshipId).update({
        awardedTo: [...scholarship.awardedTo, userId],
        availableSlots: scholarship.availableSlots - 1,
        updatedAt: Date.now(),
      });

      return { success: true, message: 'Scholarship awarded successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  reorderScholarships: async (scholarshipIds: string[]) => {
    try {
      const batch = db.batch();

      scholarshipIds.forEach((id, index) => {
        batch.update(db.collection(SCHOLARSHIPS_COLLECTION).doc(id), {
          order: index,
          updatedAt: Date.now(),
        });
      });

      await batch.commit();

      return { success: true, message: 'Scholarships reordered successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getScholarshipStats: async () => {
    try {
      const snapshot = await db.collection(SCHOLARSHIPS_COLLECTION).get();
      const scholarships = snapshot.docs.map((doc: any) => doc.data() as IScholarship);

      const stats = {
        total: scholarships.length,
        byCategory: {
          merit: scholarships.filter((s: any) => s.category === 'merit').length,
          financial: scholarships.filter((s: any) => s.category === 'financial').length,
          diversity: scholarships.filter((s: any) => s.category === 'diversity').length,
          'need-based': scholarships.filter((s: any) => s.category === 'need-based').length,
        },
        active: scholarships.filter((s: any) => s.isActive).length,
        totalAwarded: scholarships.reduce((sum: any, s: any) => sum + s.awardedTo.length, 0),
        totalValue: scholarships.reduce((sum: any, s: any) => sum + s.amount * s.awardedTo.length, 0),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
