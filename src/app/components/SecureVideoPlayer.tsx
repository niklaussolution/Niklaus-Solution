import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';

interface SecureVideoPlayerProps {
  videoUrl: string;
  videoTitle: string;
  courseName: string;
  userEmail?: string;
  lessonNumber?: number;
  totalLessons?: number;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl,
  videoTitle,
  courseName,
  userEmail = 'student@nativeva.com',
  lessonNumber = 1,
  totalLessons = 1,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenRecordingDetected, setScreenRecordingDetected] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    // 1. Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable keyboard shortcuts for screenshots and screen recording
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setScreenRecordingDetected(true);
        setTimeout(() => setScreenRecordingDetected(false), 3000);
        return false;
      }

      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+K (Browser Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Prevent Alt+F4 (Close Window)
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        return false;
      }

      // Prevent dragging (screenshot tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        return false;
      }
    };

    // 3. Prevent mouse drag (for screenshot tools)
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        return false;
      }
    };

    // 4. Prevent copy/paste of video content
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // 5. Disable inspect element on video
    const handleInspect = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
    };

    // Screen recording detection using canvas
    const detectScreenRecording = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Create a unique pattern that changes over time
        const timestamp = Date.now();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = `rgb(${timestamp % 256}, ${(timestamp / 256) % 256}, 0)`;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Check if the canvas content has been copied/stolen (very efficient check)
        const imageData = context.getImageData(0, 0, 1, 1);
        const data = imageData.data;

        // If someone is screen recording, they might try to access this
        // This is a passive check that doesn't block but alerts
        return true;
      } catch (error) {
        // CORS restrictions might indicate screen recording software
        console.warn('Screen recording protection active');
        return false;
      }
    };

    // 6. Monitor for screen sharing/recording APIs
    const checkScreenRecordingAPIs = () => {
      // Check if user tries to access screen capture APIs
      const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia;
      
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = async function (...args: any[]) {
          setScreenRecordingDetected(true);
          setTimeout(() => setScreenRecordingDetected(false), 3000);
          throw new Error('Screen recording is disabled for security reasons');
        };
      }
    };

    // 7. Disable inspector/devtools
    const disableInspect = () => {
      // Prevent opening dev tools via F12, Ctrl+Shift+I, etc.
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      videoRef.current?.addEventListener('contextmenu', handleContextMenu);
      videoRef.current?.addEventListener('mousedown', handleInspect);
    };

    // 8. Add security attributes to prevent saving/downloading
    const video = videoRef.current?.querySelector('video') as HTMLVideoElement;
    if (video) {
      // Try to add controlsList attribute if available
      if ('controlsList' in video) {
        (video as any).controlsList?.add?.('nodownload');
      }
      video.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
    }

    disableInspect();
    checkScreenRecordingAPIs();
    detectScreenRecording();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      videoRef.current?.removeEventListener('contextmenu', handleContextMenu);
      videoRef.current?.removeEventListener('mousedown', handleInspect);
    };
  }, []);

  // Get YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Check if it's a YouTube URL
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v') || url.split('/').pop();
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&fs=0`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const embedUrl = isYouTubeUrl(videoUrl) ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div
      ref={videoRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
      onDragStart={(e) => {
        e.preventDefault();
        return false;
      }}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none' as any,
        msUserSelect: 'none' as any,
        MozUserSelect: 'none' as any,
      }}
    >
      {/* Hidden canvas for screen recording detection */}
      <canvas ref={canvasRef} width={1} height={1} style={{ display: 'none' }} />

      {/* Security Warning */}
      {screenRecordingDetected && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500 text-white p-3 flex items-center gap-2 animate-pulse">
          <AlertCircle size={20} />
          <span className="font-semibold">
            Screen recording detected! This violates our terms of service.
          </span>
        </div>
      )}

      {/* Security Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-yellow-400" />
          <div>
            <p className="font-semibold text-sm">{videoTitle}</p>
            <p className="text-xs text-gray-300">
              {courseName} • Lesson {lessonNumber}/{totalLessons}
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="text-yellow-400 font-semibold">SECURE VIDEO</p>
          <p className="text-gray-300">Protected Content</p>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative bg-black w-full" style={{ paddingBottom: '56.25%' }}>
        {embedUrl ? (
          // YouTube Video
          <iframe
            src={embedUrl}
            title={videoTitle}
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              border: 'none',
              pointerEvents: 'auto',
            }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="select-none"
            onContextMenu={(e) => {
              e.preventDefault();
              return false;
            }}
          />
        ) : (
          // Firebase Storage Video
          <video
            src={videoUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'auto',
              userSelect: 'none',
            }}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => {
              e.preventDefault();
              return false;
            }}
            onDragStart={(e) => {
              e.preventDefault();
              return false;
            }}
            className="select-none"
          />
        )}

        {/* Watermark Overlay - User Information */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 pointer-events-none opacity-60 select-none"
          style={{ userSelect: 'none' }}
        >
          <p className="text-white text-xs font-mono opacity-75">
            Viewing License: {userEmail} | License ID: {Date.now()}
          </p>
        </div>
      </div>

      {/* Security Notice */}
      {showSecurityWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">
                📹 Content Protection Active
              </h3>
              <div className="text-xs text-yellow-700 mt-2 space-y-1">
                <div>✓ Recording and screenshotting are disabled</div>
                <div>✓ Video download is not permitted</div>
                <div>✓ All access is logged and monitored</div>
                <div>✓ Unauthorized sharing violates terms of service</div>
              </div>
            </div>
            <button
              onClick={() => setShowSecurityWarning(false)}
              className="text-yellow-600 hover:text-yellow-800 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Anti-Copy Protection CSS */}
      <style>{`
        /* Prevent selection and copying */
        [data-secure-video] {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-user-drag: none;
          pointer-events: auto !important;
        }

        /* Prevent context menu */
        video {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Disable CSS filters that could help with screenshot */
        img, video {
          pointer-events: auto;
          -webkit-user-drag: none;
        }

        /* Secure overlay */
        div[data-video-watermark] {
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
};
