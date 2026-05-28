import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

export interface MaskedDomainSettings {
  id?: string;
  url: string;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp | number;
  updatedAt: Timestamp | number;
  updatedBy?: string;
}

const COLLECTION_NAME = 'urlMaskingSettings';
const SETTINGS_DOC_ID = 'current';

/**
 * Normalize URL: remove trailing slashes and ensure proper format
 */
const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Get the full URL and remove trailing slash if present
    let normalized = urlObj.toString();
    // Remove trailing slash only from the pathname, not from root
    if (normalized.endsWith('/') && !normalized.endsWith('://')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, just remove trailing slash manually
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
};

/**
 * Save masked domain URL settings to separate Firestore collection
 */
export const saveMaskedDomainSettings = async (
  url: string,
  updatedBy?: string
): Promise<MaskedDomainSettings> => {
  try {
    const now = Timestamp.now();
    const normalizedUrl = normalizeUrl(url);
    const settingsData: MaskedDomainSettings = {
      url: normalizedUrl,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      updatedBy: updatedBy || 'admin',
      description: `Masked domain: ${normalizedUrl}`,
    };

    // Save to the new dedicated collection
    await setDoc(doc(db, COLLECTION_NAME, SETTINGS_DOC_ID), settingsData);

    // Also keep in settings collection for backward compatibility (temporarily)
    await setDoc(doc(db, 'settings', 'masked_domain_url'), {
      key: 'masked_domain_url',
      value: normalizedUrl,
      updatedAt: now,
    });

    console.log('✓ Masked domain settings saved to collection:', normalizedUrl);
    return settingsData;
  } catch (error) {
    console.error('Error saving masked domain settings:', error);
    throw error;
  }
};

/**
 * Get current masked domain URL settings from separate collection
 */
export const getMaskedDomainSettings = async (): Promise<MaskedDomainSettings | null> => {
  try {
    const settingsRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      console.log('✓ Masked domain settings loaded:', settingsSnap.data());
      return settingsSnap.data() as MaskedDomainSettings;
    }

    console.warn('⚠ No masked domain settings found in collection');
    return null;
  } catch (error) {
    console.error('Error fetching masked domain settings:', error);
    return null;
  }
};

/**
 * Get masked domain URL only (convenience function)
 */
export const getMaskedDomainUrl = async (): Promise<string> => {
  const settings = await getMaskedDomainSettings();
  return settings?.url || window.location.origin;
};

/**
 * Get all settings history (for audit trail)
 */
export const getMaskedDomainSettingsHistory = async (limit_count: number = 10) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('updatedAt', 'desc'),
      limit(limit_count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching masked domain settings history:', error);
    return [];
  }
};

/**
 * Validate and save masked domain URL
 */
export const validateAndSaveMaskedDomain = async (
  url: string,
  updatedBy?: string
): Promise<{ isValid: boolean; error?: string; data?: MaskedDomainSettings }> => {
  // Validate URL
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    // Ensure it has a complete domain with TLD
    const hostname = urlObj.hostname;
    if (!hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Please enter a complete domain with TLD (e.g., example.com, go.niklaus.com)',
      };
    }

    const normalizedUrl = normalizeUrl(url);
    const data = await saveMaskedDomainSettings(normalizedUrl, updatedBy);
    return { isValid: true, data };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL (e.g., https://go.niklaus.com)' };
  }
};
