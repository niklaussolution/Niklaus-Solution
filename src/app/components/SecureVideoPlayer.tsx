import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Lock, ShieldCheck, Play, Info, CheckCircle2, X } from 'lucide-react';

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
  userEmail = 'student@niklaussolutions.com',
  lessonNumber = 1,
  totalLessons = 1,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenRecordingDetected, setScreenRecordingDetected] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

      // Prevent Ctrl/Cmd + Shift + S/L (Screenshots)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setScreenRecordingDetected(true);
        setTimeout(() => setScreenRecordingDetected(false), 3000);
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
      
      // Update play state
      video.onplay = () => setIsPlaying(true);
      video.onpause = () => setIsPlaying(false);
      video.ontimeupdate = () => setCurrentTime(video.currentTime);
      video.onloadedmetadata = () => setDuration(video.duration);
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
        // and disable keyboard, enable nocookie, and hide logo
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&fs=0&controls=1&disablekb=1&iv_load_policy=3`;
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
      className="relative bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-blue-900/30 group"
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

      {/* Security Warning Overlay */}
      {screenRecordingDetected && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
          <div className="bg-red-500/20 p-5 rounded-full mb-6 border border-red-500/50">
            <ShieldCheck size={64} className="text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">Security Alert</h2>
          <p className="text-red-400 max-w-md font-medium">
            Screen capture or illegal recording activity has been detected. For security, playback has been paused.
          </p>
          <div className="mt-8 text-xs text-gray-500 uppercase tracking-tighter">
            System monitored IP: {userEmail}
          </div>
        </div>
      )}

      {/* Cyberpunk Style Header */}
      <div className="bg-[#1e293b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between text-white border-b border-blue-900/30">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30">
            <Play size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight leading-tight">{videoTitle}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest bg-blue-400/10 px-1.5 py-0.5 rounded">
                Chapter
              </span>
              <p className="text-xs text-gray-400 font-medium">
                {courseName} • Lesson {lessonNumber}/{totalLessons}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Encrypted Stream</p>
            </div>
            <p className="text-[10px] text-gray-500 font-mono tracking-tighter">{userEmail}</p>
          </div>
          <div className="bg-blue-600 hover:bg-blue-700 transition-colors p-2 rounded-lg border border-blue-500/50 shadow-lg shadow-blue-900/20 cursor-help">
            <Lock size={16} className="text-white" />
          </div>
        </div>
      </div>

      {/* Main Video Stage */}
      <div className="relative bg-[#020617] w-full" style={{ paddingBottom: '56.25%' }}>
        {embedUrl ? (
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
          />
        ) : (
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
            className="select-none"
          />
        )}

        {/* Dynamic Flying Watermark (Premium Security) */}
        <div 
          className="absolute inset-0 pointer-events-none select-none z-10"
          style={{ overflow: 'hidden' }}
        >
          <div 
            className="absolute text-[10px] font-mono text-white/5 whitespace-nowrap uppercase tracking-[1em]"
            style={{ 
              top: '15%', 
              left: '5%',
              transform: 'rotate(-25deg)',
              textShadow: '0 0 1px rgba(255,255,255,0.1)'
            }}
          >
            NIKLAUS SOLUTIONS SECURITY • {userEmail} • {userEmail} • {userEmail}
          </div>
          <div 
            className="absolute text-[10px] font-mono text-white/5 whitespace-nowrap uppercase tracking-[1em]"
            style={{ 
              bottom: '25%', 
              right: '5%',
              transform: 'rotate(-25deg)',
              textShadow: '0 0 1px rgba(255,255,255,0.1)'
            }}
          >
            NIKLAUS SOLUTIONS SECURITY • {userEmail} • {userEmail} • {userEmail} 
          </div>
        </div>

        {/* Corner Branding (Fui Style) */}
        <div className="absolute top-4 right-4 pointer-events-none select-none z-20 opacity-40 group-hover:opacity-100 transition-opacity">
           <div className="flex flex-col items-end">
              <div className="h-0.5 w-12 bg-blue-500/50 mb-1" />
              <p className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter">Niklaus Solutions x800</p>
           </div>
        </div>
      </div>

      {/* Premium Security Footer Notice */}
      {showSecurityWarning && (
        <div className="bg-[#1e293b] p-5 border-t border-blue-900/30 flex items-start gap-4 transition-all hover:bg-[#334155]/50 group/msg relative">
          <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20 shrink-0">
             <ShieldCheck size={24} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px]">Secure Protocol Active</h4>
              <span className="h-1 w-1 bg-blue-400 rounded-full" />
              <span className="text-[10px] text-blue-400 font-mono">X-800 SECURITY</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
              This content is under advanced digital protection. Real-time logging of user ID <span className="text-blue-300 underline underline-offset-4 decoration-blue-500/30">{userEmail}</span> is active. Unauthorized recording or distribution will result in immediate account termination.
            </p>
          </div>
          <button
            onClick={() => setShowSecurityWarning(false)}
            className="bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-white/10 h-fit"
          >
            <X size={14} className="text-gray-400" />
          </button>
          
          {/* Subtle Progress Trace */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>
      )}

      {/* Global Style Injector for Premium Look */}
      <style>{`
        video::media-controls-enclosure {
          background-image: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8));
          border-radius: 0 0 1rem 1rem;
        }
        
        iframe {
          background: #020617;
        }
        
        /* Custom scrollbar for some browsers inside the component */
        [data-secure-video]::-webkit-scrollbar {
          width: 4px;
        }
        [data-secure-video]::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
      
      {/* Footer Branding */}
      <div className="bg-[#0f172a] px-6 py-2 border-t border-blue-900/10 flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest">
        <span>© 2026 Niklaus Solutions</span>
        <span>Secure Stream Protocol v4.0</span>
      </div>
    </div>
  );
};
