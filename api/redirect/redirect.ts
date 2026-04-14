import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin - will use FIREBASE_ADMIN_SDK env var
const serviceAccount = process.env.FIREBASE_ADMIN_SDK ? JSON.parse(process.env.FIREBASE_ADMIN_SDK) : undefined;

if (serviceAccount) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

/**
 * Redirect endpoint: GET /r/:code or /api/redirect?code=:shortCode
 * Redirects masked links to their original URL
 * Increments click count
 * Used when custom masked domains need server-side redirects
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  // Support both query param (?code=xxx) and path param (/r/xxx via Vercel rewrites)
  let code = req.query.code as string;
  
  // Also check URL pathname if it looks like /r/[code]
  if (!code && req.url?.includes('/r/')) {
    const pathMatch = req.url.match(/\/r\/([^?&]+)/);
    if (pathMatch) {
      code = pathMatch[1];
    }
  }

  if (!code || typeof code !== 'string') {
    console.warn('Missing or invalid code parameter. Query:', req.query, 'URL:', req.url);
    return res.status(400).json({ error: 'Missing or invalid code parameter' });
  }

  try {
    console.log('🔄 Processing redirect for code:', code);
    
    // Query Firestore for the masked link
    const snapshot = await db
      .collection('maskedLinks')
      .where('shortCode', '==', code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn('Link not found for code:', code);
      return res.status(404).json({ error: 'Link not found' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const originalUrl = data.originalUrl;
    
    console.log('✅ Redirecting from code:', code, 'to:', originalUrl);

    // Increment click count asynchronously (fire and forget)
    doc.ref.update({ clickCount: (data.clickCount || 0) + 1 }).catch((err: any) => {
      console.error('Failed to increment click count:', err);
    });

    // Return redirect response (301 Permanent Redirect)
    res.redirect(301, originalUrl);
  } catch (error) {
    console.error('Redirect API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
