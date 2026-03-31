import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';

export const LinkRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<'loading' | 'notfound' | 'error' | 'ready'>('loading');
  const [originalUrl, setOriginalUrl] = useState('');
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

        setOriginalUrl(data.originalUrl);
        setStatus('ready');
      } catch (err) {
        console.error('LinkRedirect error:', err);
        setStatus('error');
      }
    };

    resolve();
  }, [code]);

  // Detect X-Frame-Options / CSP iframe blocks after load
  // onError fires for network errors; postMessage listener catches CSP/X-Frame-Options blocks
  useEffect(() => {
    if (status !== 'ready' || !originalUrl) return;

    // Fallback: if iframe hasn't signalled success within 8 seconds, assume blocked
    // (X-Frame-Options silently cancels load — no event fires in the parent)
    const timer = setTimeout(() => {
      try {
        // Accessing contentDocument throws if cross-origin blocked
        const cd = iframeRef.current?.contentDocument;
        if (!cd || cd.body?.innerHTML === '') {
          setIframeBlocked(true);
        }
      } catch {
        setIframeBlocked(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [status, originalUrl]);

  // Full-screen iframe — address bar stays as /r/:code, original URL stays hidden
  if (status === 'ready' && originalUrl) {
    return (
      <div style={{ position: 'fixed', inset: 0, margin: 0, padding: 0 }}>
        {iframeBlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center px-4 z-10">
            <p className="text-5xl mb-4">🚫</p>
            <h1 className="text-xl font-bold text-gray-800 mb-2">This site cannot be displayed here</h1>
            <p className="text-gray-500 text-sm mb-6">
              The destination URL blocks embedding. It will open in a new tab:
            </p>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition text-sm"
            >
              Open destination →
            </a>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={originalUrl}
          title="Masked Link Content"
          style={{ width: '100%', height: '100%', border: 'none', display: iframeBlocked ? 'none' : 'block' }}
          onError={() => setIframeBlocked(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-500 text-sm">Loading...</p>
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

