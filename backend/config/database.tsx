import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

// Initialize Firebase Admin SDK
export const initializeFirebase = () => {
  try {
    // Check if serviceAccountKey.json exists
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn('⚠️  serviceAccountKey.json not found!');
      console.warn('Firebase Admin SDK initialization skipped.');
      console.warn('Please download your Firebase service account key from Firebase Console:');
      console.warn('1. Go to Firebase Console -> Project Settings');
      console.warn('2. Click "Service Accounts" tab');
      console.warn('3. Click "Generate New Private Key"');
      console.warn('4. Save as serviceAccountKey.json in backend directory');
      return;
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    });

    db = admin.firestore();
    auth = admin.auth();

    console.log('✅ Firebase initialized successfully');
    return admin;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    process.exit(1);
  }
};

// Getter functions to safely access db and auth
export const getDatabase = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

export const getAuth = (): admin.auth.Auth => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
  }
  return auth;
};

