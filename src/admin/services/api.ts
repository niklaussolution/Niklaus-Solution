import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const api = {
  // Auth
  register: async (credentials: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Store admin info in Firestore
      await addDoc(collection(db, 'admins'), {
        username: credentials.username,
        email: credentials.email,
        firebaseUid: userCredential.user.uid,
        role: credentials.role || 'editor',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const token = await userCredential.user.getIdToken();
      return {
        token,
        admin: {
          id: userCredential.user.uid,
          username: credentials.username,
          email: credentials.email,
          role: credentials.role || 'editor',
        },
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  login: async (credentials: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Get admin info from Firestore
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('firebaseUid', '==', userCredential.user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { error: 'Admin not found' };
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();
      const token = await userCredential.user.getIdToken();

      return {
        token,
        admin: {
          id: userCredential.user.uid,
          username: adminData.username,
          email: adminData.email,
          role: adminData.role,
        },
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      return { message: 'Logged out successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getAdmins: async () => {
    try {
      const adminsRef = collection(db, 'admins');
      const querySnapshot = await getDocs(adminsRef);
      const admins = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return admins;
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateAdmin: async (id: string, data: any) => {
    try {
      const adminRef = doc(db, 'admins', id);
      await updateDoc(adminRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(adminRef);
      return { data: { id: updatedDoc.id, ...(updatedDoc.data() as any) } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteAdmin: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'admins', id));
      return { message: 'Admin deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Content
  getContent: async (section?: string) => {
    try {
      const contentRef = collection(db, 'content');
      let q;
      if (section) {
        q = query(contentRef, where('section', '==', section), orderBy('order'));
      } else {
        q = query(contentRef, orderBy('order'));
      }
      const querySnapshot = await getDocs(q);
      const content = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return content;
    } catch (error: any) {
      return [];
    }
  },

  getContentById: async (id: string) => {
    try {
      const docRef = doc(db, 'content', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { error: 'Content not found' };
      }
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createContent: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, 'content'), {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { data: { id: docRef.id, ...data } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateContent: async (id: string, data: any) => {
    try {
      const contentRef = doc(db, 'content', id);
      await updateDoc(contentRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(contentRef);
      return { data: { id: updatedDoc.id, ...(updatedDoc.data() as any) } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteContent: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'content', id));
      return { message: 'Content deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Videos
  getVideos: async () => {
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('isActive', '==', true), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const videos = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return videos;
    } catch (error: any) {
      return [];
    }
  },

  getAllVideos: async () => {
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const videos = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        _id: doc.id,
        ...(doc.data() as any),
      }));
      return videos;
    } catch (error: any) {
      console.error('Error fetching all videos:', error);
      return [];
    }
  },

  getVideoById: async (id: string) => {
    try {
      const docRef = doc(db, 'videos', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { error: 'Video not found' };
      }
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createVideo: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, 'videos'), {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { data: { id: docRef.id, ...data } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateVideo: async (id: string, data: any) => {
    try {
      const videoRef = doc(db, 'videos', id);
      await updateDoc(videoRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(videoRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteVideo: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      return { message: 'Video deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Users
  getUsers: async (status?: string, search?: string) => {
    try {
      const usersRef = collection(db, 'users');
      let q;
      if (status) {
        q = query(usersRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      } else {
        q = query(usersRef, orderBy('createdAt', 'desc'));
      }
      let querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(
          (user) =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }

      return users;
    } catch (error: any) {
      return [];
    }
  },

  getUserById: async (id: string) => {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { error: 'User not found' };
      }
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createUser: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { data: { id: docRef.id, ...data } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateUser: async (id: string, data: any) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(userRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteUser: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      return { message: 'User deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const settingsRef = collection(db, 'settings');
      const querySnapshot = await getDocs(settingsRef);
      const settingsObj: any = {};
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        settingsObj[data.key] = data.value;
      });
      return settingsObj;
    } catch (error: any) {
      return {};
    }
  },

  updateSettings: async (data: any) => {
    try {
      for (const [key, value] of Object.entries(data)) {
        const settingRef = doc(db, 'settings', key);
        try {
          // Try to update existing document
          await updateDoc(settingRef, { 
            key, 
            value, 
            updatedAt: Date.now() 
          });
        } catch (updateError: any) {
          // If document doesn't exist, create it
          if (updateError.code === 'not-found') {
            await addDoc(collection(db, 'settings'), {
              key,
              value,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          } else {
            throw updateError;
          }
        }
      }
      console.log('Settings updated successfully:', data);
      return { message: 'Settings updated successfully' };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return { error: error.message };
    }
  },

  // Workshops
  getWorkshops: async (isActive?: boolean, isFeatured?: boolean) => {
    try {
      const workshopsRef = collection(db, 'workshops');
      let q;

      if (isActive !== undefined && isFeatured !== undefined) {
        q = query(
          workshopsRef,
          where('isActive', '==', isActive),
          where('isFeatured', '==', isFeatured),
          orderBy('startDate')
        );
      } else if (isActive !== undefined) {
        q = query(
          workshopsRef,
          where('isActive', '==', isActive),
          orderBy('startDate')
        );
      } else if (isFeatured !== undefined) {
        q = query(
          workshopsRef,
          where('isFeatured', '==', isFeatured),
          orderBy('startDate')
        );
      } else {
        q = query(workshopsRef, orderBy('startDate'));
      }

      const querySnapshot = await getDocs(q);
      const workshops = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return workshops;
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getWorkshopById: async (id: string) => {
    try {
      const workshopRef = doc(db, 'workshops', id);
      const workshopDoc = await getDoc(workshopRef);
      if (!workshopDoc.exists()) {
        return { error: 'Workshop not found' };
      }
      return { id: workshopDoc.id, ...workshopDoc.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createWorkshop: async (data: any) => {
    try {
      const workshopsRef = collection(db, 'workshops');
      const docRef = await addDoc(workshopsRef, {
        ...data,
        enrolled: 0,
        isFeatured: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateWorkshop: async (id: string, data: any) => {
    try {
      const workshopRef = doc(db, 'workshops', id);
      await updateDoc(workshopRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(workshopRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteWorkshop: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'workshops', id));
      return { message: 'Workshop deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateWorkshopEnrollment: async (id: string, increment: number = 1) => {
    try {
      const workshopRef = doc(db, 'workshops', id);
      const workshopDoc = await getDoc(workshopRef);
      if (!workshopDoc.exists()) {
        return { error: 'Workshop not found' };
      }
      const currentEnrolled = (workshopDoc.data() as any).enrolled || 0;
      const newEnrolled = Math.max(0, currentEnrolled + increment);
      await updateDoc(workshopRef, {
        enrolled: newEnrolled,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(workshopRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Pricing Plans
  getPricingPlans: async (isActive?: boolean) => {
    try {
      const pricingPlansRef = collection(db, 'pricingPlans');
      let q;

      if (isActive !== undefined) {
        q = query(
          pricingPlansRef,
          where('isActive', '==', isActive),
          orderBy('order')
        );
      } else {
        q = query(pricingPlansRef, orderBy('order'));
      }

      const querySnapshot = await getDocs(q);
      const plans = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return plans;
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getPricingPlanById: async (id: string) => {
    try {
      const planRef = doc(db, 'pricingPlans', id);
      const planDoc = await getDoc(planRef);
      if (!planDoc.exists()) {
        return { error: 'Pricing plan not found' };
      }
      return { id: planDoc.id, ...planDoc.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createPricingPlan: async (data: any) => {
    try {
      const pricingPlansRef = collection(db, 'pricingPlans');
      const docRef = await addDoc(pricingPlansRef, {
        ...data,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updatePricingPlan: async (id: string, data: any) => {
    try {
      const planRef = doc(db, 'pricingPlans', id);
      await updateDoc(planRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(planRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deletePricingPlan: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pricingPlans', id));
      return { message: 'Pricing plan deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Registrations
  getRegistrations: async (workshopId?: string, status?: string, paymentStatus?: string) => {
    try {
      const registrationsRef = collection(db, 'registrations');
      let q;

      const constraints = [];
      if (workshopId) constraints.push(where('workshopId', '==', workshopId));
      if (status) constraints.push(where('status', '==', status));
      if (paymentStatus) constraints.push(where('paymentStatus', '==', paymentStatus));

      if (constraints.length > 0) {
        q = query(registrationsRef, ...constraints, orderBy('registrationDate', 'desc'));
      } else {
        q = query(registrationsRef, orderBy('registrationDate', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const registrations = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return registrations;
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getRegistrationById: async (id: string) => {
    try {
      const regRef = doc(db, 'registrations', id);
      const regDoc = await getDoc(regRef);
      if (!regDoc.exists()) {
        return { error: 'Registration not found' };
      }
      return { id: regDoc.id, ...regDoc.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createRegistration: async (data: any) => {
    try {
      const registrationsRef = collection(db, 'registrations');
      const docRef = await addDoc(registrationsRef, {
        ...data,
        registrationDate: new Date().toISOString(),
        status: 'Pending',
        paymentStatus: 'Pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateRegistration: async (id: string, data: any) => {
    try {
      const regRef = doc(db, 'registrations', id);
      await updateDoc(regRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(regRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateRegistrationStatus: async (id: string, status?: string, paymentStatus?: string, cancellationReason?: string) => {
    try {
      const regRef = doc(db, 'registrations', id);
      const updateData: any = { updatedAt: Date.now() };

      if (status) {
        updateData.status = status;
        if (status === 'Confirmed') {
          updateData.confirmationDate = new Date().toISOString();
        }
        if (status === 'Cancelled') {
          updateData.cancellationReason = cancellationReason || '';
        }
      }
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      await updateDoc(regRef, updateData);
      const updatedDoc = await getDoc(regRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteRegistration: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'registrations', id));
      return { message: 'Registration deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getRegistrationStats: async (workshopId?: string) => {
    try {
      const registrationsRef = collection(db, 'registrations');
      let q;

      if (workshopId) {
        q = query(registrationsRef, where('workshopId', '==', workshopId));
      } else {
        q = query(registrationsRef);
      }

      const querySnapshot = await getDocs(q);
      const registrations = querySnapshot.docs.map((doc) => doc.data());

      const stats = {
        total: registrations.length,
        pending: registrations.filter((r: any) => r.status === 'Pending').length,
        confirmed: registrations.filter((r: any) => r.status === 'Confirmed').length,
        cancelled: registrations.filter((r: any) => r.status === 'Cancelled').length,
        paymentCompleted: registrations.filter((r: any) => r.paymentStatus === 'Completed').length,
        paymentPending: registrations.filter((r: any) => r.paymentStatus === 'Pending').length,
        totalRevenue: registrations.reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
      };

      return { data: stats };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Trainers
  getTrainers: async (isActive?: boolean) => {
    try {
      const trainersRef = collection(db, 'trainers');
      let q;

      if (isActive !== undefined) {
        q = query(trainersRef, where('isActive', '==', isActive), orderBy('order'));
      } else {
        q = query(trainersRef, orderBy('order'));
      }

      const querySnapshot = await getDocs(q);
      const trainers = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return trainers;
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getTrainerById: async (id: string) => {
    try {
      const trainerRef = doc(db, 'trainers', id);
      const trainerDoc = await getDoc(trainerRef);
      if (!trainerDoc.exists()) {
        return { error: 'Trainer not found' };
      }
      return { id: trainerDoc.id, ...trainerDoc.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createTrainer: async (data: any) => {
    try {
      const trainersRef = collection(db, 'trainers');
      const docRef = await addDoc(trainersRef, {
        ...data,
        workshopIds: [],
        rating: 0,
        reviewCount: 0,
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateTrainer: async (id: string, data: any) => {
    try {
      const trainerRef = doc(db, 'trainers', id);
      await updateDoc(trainerRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(trainerRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteTrainer: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'trainers', id));
      return { message: 'Trainer deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateTrainerRating: async (id: string, rating: number, reviewCount: number) => {
    try {
      const trainerRef = doc(db, 'trainers', id);
      await updateDoc(trainerRef, {
        rating,
        reviewCount,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(trainerRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Testimonials
  getTestimonials: async (isApproved?: boolean, isFeatured?: boolean) => {
    try {
      const testimonialsRef = collection(db, 'testimonials');
      let q;

      const constraints = [];
      if (isApproved !== undefined) constraints.push(where('isApproved', '==', isApproved));
      if (isFeatured !== undefined) constraints.push(where('isFeatured', '==', isFeatured));

      if (constraints.length > 0) {
        q = query(testimonialsRef, ...constraints, orderBy('order'));
      } else {
        q = query(testimonialsRef, orderBy('order'));
      }

      const querySnapshot = await getDocs(q);
      const testimonials = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return testimonials;
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getTestimonialById: async (id: string) => {
    try {
      const testRef = doc(db, 'testimonials', id);
      const testDoc = await getDoc(testRef);
      if (!testDoc.exists()) {
        return { error: 'Testimonial not found' };
      }
      return { id: testDoc.id, ...testDoc.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createTestimonial: async (data: any) => {
    try {
      const testimonialsRef = collection(db, 'testimonials');
      const docRef = await addDoc(testimonialsRef, {
        ...data,
        isFeatured: false,
        isApproved: false,
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateTestimonial: async (id: string, data: any) => {
    try {
      const testRef = doc(db, 'testimonials', id);
      await updateDoc(testRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(testRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  approveTestimonial: async (id: string, isApproved: boolean) => {
    try {
      const testRef = doc(db, 'testimonials', id);
      await updateDoc(testRef, {
        isApproved,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(testRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteTestimonial: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      return { message: 'Testimonial deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Features
  getFeatures: async () => {
    try {
      const q = query(collection(db, 'features'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getFeatureById: async (id: string) => {
    try {
      const docRef = doc(db, 'features', id);
      const docSnap = await getDoc(docRef);
      return { data: { id: docSnap.id, ...docSnap.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createFeature: async (data: any) => {
    try {
      const featuresRef = collection(db, 'features');
      const docRef = await addDoc(featuresRef, {
        ...data,
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateFeature: async (id: string, data: any) => {
    try {
      const fRef = doc(db, 'features', id);
      await updateDoc(fRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(fRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteFeature: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'features', id));
      return { message: 'Feature deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Scholarships
  getScholarships: async () => {
    try {
      const q = query(collection(db, 'scholarships'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getScholarshipById: async (id: string) => {
    try {
      const docRef = doc(db, 'scholarships', id);
      const docSnap = await getDoc(docRef);
      return { data: { id: docSnap.id, ...docSnap.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createScholarship: async (data: any) => {
    try {
      const scholarshipsRef = collection(db, 'scholarships');
      const docRef = await addDoc(scholarshipsRef, {
        ...data,
        awardedTo: [],
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateScholarship: async (id: string, data: any) => {
    try {
      const sRef = doc(db, 'scholarships', id);
      await updateDoc(sRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(sRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteScholarship: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'scholarships', id));
      return { message: 'Scholarship deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  awardScholarship: async (scholarshipId: string, userId: string) => {
    try {
      const sRef = doc(db, 'scholarships', scholarshipId);
      const docSnap = await getDoc(sRef);
      const scholarship = docSnap.data() as any;
      await updateDoc(sRef, {
        awardedTo: [...(scholarship.awardedTo || []), userId],
        availableSlots: (scholarship.availableSlots || 0) - 1,
        updatedAt: Date.now(),
      });
      return { message: 'Scholarship awarded successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Companies
  getCompanies: async () => {
    try {
      const q = query(collection(db, 'companies'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getCompanyById: async (id: string) => {
    try {
      const docRef = doc(db, 'companies', id);
      const docSnap = await getDoc(docRef);
      return { data: { id: docSnap.id, ...docSnap.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createCompany: async (data: any) => {
    try {
      const companiesRef = collection(db, 'companies');
      const docRef = await addDoc(companiesRef, {
        ...data,
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateCompany: async (id: string, data: any) => {
    try {
      const cRef = doc(db, 'companies', id);
      await updateDoc(cRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(cRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteCompany: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'companies', id));
      return { message: 'Company deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // FAQs
  getFAQs: async (category?: string) => {
    try {
      let q;
      if (category) {
        q = query(
          collection(db, 'faqs'),
          where('category', '==', category),
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );
      } else {
        q = query(
          collection(db, 'faqs'),
          where('isActive', '==', true),
          orderBy('order', 'asc')
        );
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getFAQById: async (id: string) => {
    try {
      const docRef = doc(db, 'faqs', id);
      const docSnap = await getDoc(docRef);
      // Increment views
      await updateDoc(docRef, {
        views: (docSnap.data()?.views || 0) + 1,
      });
      return { data: { id: docSnap.id, ...docSnap.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createFAQ: async (data: any) => {
    try {
      const faqsRef = collection(db, 'faqs');
      const docRef = await addDoc(faqsRef, {
        ...data,
        isActive: true,
        order: 0,
        views: 0,
        helpful: 0,
        unhelpful: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateFAQ: async (id: string, data: any) => {
    try {
      const faqRef = doc(db, 'faqs', id);
      await updateDoc(faqRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(faqRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteFAQ: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      return { message: 'FAQ deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  recordFAQHelpful: async (id: string, isHelpful: boolean) => {
    try {
      const faqRef = doc(db, 'faqs', id);
      const docSnap = await getDoc(faqRef);
      const field = isHelpful ? 'helpful' : 'unhelpful';
      await updateDoc(faqRef, {
        [field]: (docSnap.data()?.[field] || 0) + 1,
      });
      return { message: 'Thank you for your feedback!' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Journeys (Learner Success Stories)
  getJourneys: async (isActive?: boolean) => {
    try {
      const journeysRef = collection(db, 'journeys');
      let q;
      if (isActive !== undefined) {
        q = query(journeysRef, where('isActive', '==', isActive), orderBy('order'));
      } else {
        q = query(journeysRef, orderBy('order'));
      }
      const querySnapshot = await getDocs(q);
      const journeys = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      return journeys;
    } catch (error: any) {
      return [];
    }
  },

  getJourneyById: async (id: string) => {
    try {
      const docRef = doc(db, 'journeys', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { error: 'Journey not found' };
      }
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createJourney: async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, 'journeys'), {
        ...data,
        isActive: true,
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateJourney: async (id: string, data: any) => {
    try {
      const journeyRef = doc(db, 'journeys', id);
      await updateDoc(journeyRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(journeyRef);
      return { data: { id: updatedDoc.id, ...(updatedDoc.data() as any) } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteJourney: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'journeys', id));
      return { message: 'Journey deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Bulk upload journeys
  createMultipleJourneys: async (journeys: any[]) => {
    try {
      let successCount = 0;
      for (const journey of journeys) {
        const docRef = await addDoc(collection(db, 'journeys'), {
          ...journey,
          isActive: journey.isActive !== false,
          order: journey.order || 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        successCount++;
      }
      return { data: { created: successCount } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Student Projects
  getStudentProjects: async () => {
    try {
      const q = query(collection(db, 'studentProjects'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getStudentProjectById: async (id: string) => {
    try {
      const docRef = doc(db, 'studentProjects', id);
      const docSnap = await getDoc(docRef);
      return { data: { id: docSnap.id, ...docSnap.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  createStudentProject: async (data: any) => {
    try {
      const projectsRef = collection(db, 'studentProjects');
      const docRef = await addDoc(projectsRef, {
        ...data,
        isActive: true,
        order: data.order || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const newDoc = await getDoc(docRef);
      return { data: { id: newDoc.id, ...newDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateStudentProject: async (id: string, data: any) => {
    try {
      const projectRef = doc(db, 'studentProjects', id);
      await updateDoc(projectRef, {
        ...data,
        updatedAt: Date.now(),
      });
      const updatedDoc = await getDoc(projectRef);
      return { data: { id: updatedDoc.id, ...updatedDoc.data() } };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  deleteStudentProject: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'studentProjects', id));
      return { message: 'Student project deleted successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

