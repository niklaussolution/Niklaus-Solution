import { getDatabase } from '../config/database';
import { IFAQ, FAQ_COLLECTION } from '../models/FAQ';

const db = getDatabase();

export const faqController = {
  getAllFAQs: async (filter?: { category?: string; workshopId?: string }) => {
    try {
      let query: any = db.collection(FAQ_COLLECTION);

      if (filter?.category) {
        query = query.where('category', '==', filter.category);
      }

      if (filter?.workshopId) {
        query = query.where('workshopId', '==', filter.workshopId);
      }

      query = query.where('isActive', '==', true).orderBy('order', 'asc');
      const snapshot = await query.get();
      const faqs = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      } as IFAQ));

      return { success: true, data: faqs };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getFAQById: async (id: string) => {
    try {
      const doc = await db.collection(FAQ_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'FAQ not found' };
      }

      // Increment views
      await db.collection(FAQ_COLLECTION).doc(id).update({
        views: (doc.data()?.views || 0) + 1,
      });

      return {
        success: true,
        data: { id: doc.id, ...doc.data() } as IFAQ,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  createFAQ: async (data: Omit<IFAQ, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpful' | 'unhelpful'>) => {
    try {
      // Validation
      if (!data.question?.trim()) {
        return { success: false, error: 'Question is required' };
      }

      if (!data.answer?.trim()) {
        return { success: false, error: 'Answer is required' };
      }

      if (!['general', 'technical', 'pricing', 'registration', 'certification'].includes(data.category)) {
        return { success: false, error: 'Invalid FAQ category' };
      }

      const now = Date.now();
      const docRef = await db.collection(FAQ_COLLECTION).add({
        ...data,
        views: 0,
        helpful: 0,
        unhelpful: 0,
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        data: {
          id: docRef.id,
          ...data,
          views: 0,
          helpful: 0,
          unhelpful: 0,
          createdAt: now,
          updatedAt: now,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateFAQ: async (id: string, data: Partial<Omit<IFAQ, 'id' | 'createdAt'>>) => {
    try {
      const doc = await db.collection(FAQ_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'FAQ not found' };
      }

      // Validation
      if (data.category && !['general', 'technical', 'pricing', 'registration', 'certification'].includes(data.category)) {
        return { success: false, error: 'Invalid FAQ category' };
      }

      await db.collection(FAQ_COLLECTION).doc(id).update({
        ...data,
        updatedAt: Date.now(),
      });

      const updatedDoc = await db.collection(FAQ_COLLECTION).doc(id).get();

      return {
        success: true,
        data: { id: updatedDoc.id, ...updatedDoc.data() } as IFAQ,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteFAQ: async (id: string) => {
    try {
      const doc = await db.collection(FAQ_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'FAQ not found' };
      }

      await db.collection(FAQ_COLLECTION).doc(id).delete();

      return { success: true, message: 'FAQ deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  recordHelpful: async (id: string, isHelpful: boolean) => {
    try {
      const doc = await db.collection(FAQ_COLLECTION).doc(id).get();

      if (!doc.exists) {
        return { success: false, error: 'FAQ not found' };
      }

      const current = doc.data() as IFAQ;
      const update = isHelpful
        ? { helpful: current.helpful + 1 }
        : { unhelpful: current.unhelpful + 1 };

      await db.collection(FAQ_COLLECTION).doc(id).update(update);

      return { success: true, message: 'Thank you for your feedback!' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  reorderFAQs: async (faqIds: string[]) => {
    try {
      const batch = db.batch();

      faqIds.forEach((id, index) => {
        batch.update(db.collection(FAQ_COLLECTION).doc(id), {
          order: index,
          updatedAt: Date.now(),
        });
      });

      await batch.commit();

      return { success: true, message: 'FAQs reordered successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getFAQStats: async () => {
    try {
      const snapshot = await db.collection(FAQ_COLLECTION).get();
      const faqs = snapshot.docs.map((doc: any) => doc.data() as IFAQ);

      const stats = {
        total: faqs.length,
        byCategory: {
          general: faqs.filter((f: any) => f.category === 'general').length,
          technical: faqs.filter((f: any) => f.category === 'technical').length,
          pricing: faqs.filter((f: any) => f.category === 'pricing').length,
          registration: faqs.filter((f: any) => f.category === 'registration').length,
          certification: faqs.filter((f: any) => f.category === 'certification').length,
        },
        active: faqs.filter((f) => f.isActive).length,
        totalViews: faqs.reduce((sum, f) => sum + f.views, 0),
        mostViewed: faqs.sort((a, b) => b.views - a.views).slice(0, 5),
        mostHelpful: faqs.sort((a, b) => b.helpful - a.helpful).slice(0, 5),
      };

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
