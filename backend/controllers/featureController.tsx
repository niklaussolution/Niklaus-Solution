import { getDatabase } from '../config/database';
import { IFeature, FEATURES_COLLECTION } from '../models/Feature';

const db = getDatabase();

export const featureController = {
  getAllFeatures: async (filter?: { category?: string; isActive?: boolean }) => {
    try {
      let query: any = db.collection(FEATURES_COLLECTION);

      if (filter?.category) {
        query = query.where('category', '==', filter.category);
      }

      if (filter?.isActive !== undefined) {
        query = query.where('isActive', '==', filter.isActive);
      }

      query = query.orderBy('order', 'asc');
      const snapshot = await query.get();
      const features = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as IFeature));

      return { success: true, data: features };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getFeatureById: async (id: string) => {
    try {
      const doc = await db.collection(FEATURES_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Feature not found' };
      }

      return {
        success: true,
        data: { id: doc.id, ...doc.data() } as IFeature,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  createFeature: async (data: Omit<IFeature, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validation
      if (!data.title?.trim()) {
        return { success: false, error: 'Title is required' };
      }

      if (!data.description?.trim()) {
        return { success: false, error: 'Description is required' };
      }

      if (!['core', 'advanced', 'premium'].includes(data.category)) {
        return { success: false, error: 'Invalid category' };
      }

      if (!Array.isArray(data.benefits) || data.benefits.length === 0) {
        return { success: false, error: 'At least one benefit is required' };
      }

      if (!Array.isArray(data.features) || data.features.length === 0) {
        return { success: false, error: 'At least one feature is required' };
      }

      const now = Date.now();
      const docRef = await db.collection(FEATURES_COLLECTION).add({
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

  updateFeature: async (
    id: string,
    data: Partial<Omit<IFeature, 'id' | 'createdAt'>>
  ) => {
    try {
      const doc = await db.collection(FEATURES_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Feature not found' };
      }

      // Validation
      if (data.title !== undefined && !data.title.trim()) {
        return { success: false, error: 'Title cannot be empty' };
      }

      if (data.category && !['core', 'advanced', 'premium'].includes(data.category)) {
        return { success: false, error: 'Invalid category' };
      }

      if (data.benefits && (!Array.isArray(data.benefits) || data.benefits.length === 0)) {
        return { success: false, error: 'At least one benefit is required' };
      }

      if (data.features && (!Array.isArray(data.features) || data.features.length === 0)) {
        return { success: false, error: 'At least one feature is required' };
      }

      await db.collection(FEATURES_COLLECTION).doc(id).update({
        ...data,
        updatedAt: Date.now(),
      });

      const updatedDoc = await db.collection(FEATURES_COLLECTION).doc(id).get();

      return {
        success: true,
        data: { id: updatedDoc.id, ...updatedDoc.data() } as IFeature,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteFeature: async (id: string) => {
    try {
      const doc = await db.collection(FEATURES_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'Feature not found' };
      }

      await db.collection(FEATURES_COLLECTION).doc(id).delete();

      return { success: true, message: 'Feature deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  reorderFeatures: async (featureIds: string[]) => {
    try {
      const batch = db.batch();

      featureIds.forEach((id, index) => {
        batch.update(db.collection(FEATURES_COLLECTION).doc(id), {
          order: index,
          updatedAt: Date.now(),
        });
      });

      await batch.commit();

      return { success: true, message: 'Features reordered successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getFeatureStats: async () => {
    try {
      const snapshot = await db.collection(FEATURES_COLLECTION).get();
      const features = snapshot.docs.map((doc: any) => doc.data() as IFeature);

      const stats = {
        total: features.length,
        byCategory: {
          core: features.filter((f: any) => f.category === 'core').length,
          advanced: features.filter((f: any) => f.category === 'advanced').length,
          premium: features.filter((f: any) => f.category === 'premium').length,
        },
        active: features.filter((f: any) => f.isActive).length,
        inactive: features.filter((f: any) => !f.isActive).length,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
