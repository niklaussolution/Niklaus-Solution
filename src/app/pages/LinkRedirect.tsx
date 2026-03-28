import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';

export const LinkRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<'loading' | 'notfound' | 'error'>('loading');

  useEffect(() => {
    if (!code) { setStatus('notfound'); return; }

    const resolve = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'maskedLinks'), where('shortCode', '==', code))
        );

        if (snap.empty) { setStatus('notfound'); return; }

        const linkDoc = snap.docs[0];
        const data = linkDoc.data();

        // Increment click count (fire and forget)
        updateDoc(doc(db, 'maskedLinks', linkDoc.id), { clickCount: increment(1) }).catch(() => {});

        // Redirect to the original URL
        window.location.replace(data.originalUrl);
      } catch (err) {
        console.error('LinkRedirect error:', err);
        setStatus('error');
      }
    };

    resolve();
  }, [code]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-500 text-sm">Redirecting you...</p>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <p className="text-5xl mb-4">🔗</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Link not found</h1>
        <p className="text-gray-500 text-sm">This link may have been removed or never existed.</p>
        <a href="/" className="mt-6 text-blue-600 hover:underline text-sm">← Go home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
      <p className="text-gray-500 text-sm">Please try again later.</p>
      <a href="/" className="mt-6 text-blue-600 hover:underline text-sm">← Go home</a>
    </div>
  );
};
