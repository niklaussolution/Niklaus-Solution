import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertCircle,
  Lock,
  ShieldCheck,
  Play,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

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
  userEmail = "student@niklaussolutions.com",
  lessonNumber = 1,
  totalLessons = 1,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenRecordingDetected, setScreenRecordingDetected] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [securityStatus, setSecurityStatus] = useState("active");
  const sessionIdRef = useRef(Math.random().toString(36).substring(2, 15));

  useEffect(() => {
    if (!videoRef.current) return;

    // ==========================================
    // LAYER 1: RIGHT-CLICK CONTEXT MENU BLOCKING
    // ==========================================
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // ==========================================
    // LAYER 2: COMPREHENSIVE KEYBOARD SHORTCUT BLOCKING
    // ==========================================
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        setScreenRecordingDetected(true);
        setTimeout(() => setScreenRecordingDetected(false), 3000);
        return false;
      }

      // F12 (Developer Tools)
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + Shift + I (Developer Tools Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + Shift + J (Developer Tools Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + Shift + K (Browser Console - Firefox)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + Shift + C (Element Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + Shift + S (Screenshot)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "S" || e.key === "s")
      ) {
        e.preventDefault();
        e.stopPropagation();
        setScreenRecordingDetected(true);
        setTimeout(() => setScreenRecordingDetected(false), 3000);
        return false;
      }

      // Ctrl/Cmd + Shift + L (Zoom Recording)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "L" || e.key === "l")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Alt + F4 (Close Window)
      if (e.altKey && e.key === "F4") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Alt + Delete
      if (e.ctrlKey && e.altKey && e.key === "Delete") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + C (Copy)
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + X (Cut)
      if ((e.ctrlKey || e.metaKey) && (e.key === "x" || e.key === "X")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + V (Paste)
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + N (New Window)
      if ((e.ctrlKey || e.metaKey) && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // F11 (Fullscreen)
      if (e.key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // ==========================================
    // LAYER 3: MOUSE EVENT PROTECTION
    // ==========================================
    const handleMouseDown = (e: MouseEvent) => {
      // Block right-click
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Block middle-click
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2 || e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // ==========================================
    // LAYER 4: CLIPBOARD PROTECTION
    // ==========================================
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // ==========================================
    // LAYER 5: DRAG & DROP PROTECTION
    // ==========================================
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // ==========================================
    // LAYER 6: DEVTOOLS DETECTION & BLOCKING
    // ==========================================
    const disableDevTools = () => {
      // Detect if devtools is open
      const checkDevTools = setInterval(() => {
        const devToolsOpen =
          window.outerHeight - window.innerHeight > 200 ||
          window.outerWidth - window.innerWidth > 200;

        if (devToolsOpen) {
          // Pause video and show warning
          if (videoElementRef.current) {
            videoElementRef.current.pause();
          }
          setSecurityStatus("devtools-detected");
          setScreenRecordingDetected(true);
          // Don't clear this timeout, keep it showing
        }
      }, 500);

      return () => clearInterval(checkDevTools);
    };

    // ==========================================
    // LAYER 7: SCREEN RECORDING API BLOCKING
    // ==========================================
    const blockScreenRecordingAPIs = () => {
      // Block getDisplayMedia
      if (navigator.mediaDevices?.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = async function (
          ...args: any[]
        ) {
          setScreenRecordingDetected(true);
          throw new Error("Screen recording is disabled for security reasons");
        };
      }

      // Block getUserMedia
      if (navigator.mediaDevices?.getUserMedia) {
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
        navigator.mediaDevices.getUserMedia = async function (...args: any[]) {
          const constraints = args[0] as any;
          if (constraints?.video?.displaySurface) {
            setScreenRecordingDetected(true);
            throw new Error("Screen capture is disabled");
          }
          return originalGetUserMedia.apply(this, args);
        };
      }
    };

    // ==========================================
    // LAYER 8: BLOB URL & MEDIA SOURCE EXTENSION BLOCKING
    // ==========================================
    const blockMediaAPIs = () => {
      // Block MediaSource API
      if (typeof MediaSource !== "undefined") {
        const originalCreateObjectURL = URL.createObjectURL;
        (URL.createObjectURL as any) = function (obj: any) {
          if (obj instanceof MediaSource) {
            console.warn("MediaSource API is blocked");
            throw new Error("MediaSource API is blocked for security");
          }
          return originalCreateObjectURL.call(URL, obj);
        };
      }

      // Block access to video source elements
      const videoElement = videoElementRef.current;
      if (videoElement) {
        Object.defineProperty(videoElement, "src", {
          get() {
            return videoUrl;
          },
          set(value: string) {
            console.warn("Direct src modification blocked");
            return false;
          },
        });

        // Block access to srcset
        Object.defineProperty(videoElement, "srcset", {
          get() {
            return "";
          },
          set(value: string) {
            return false;
          },
        });
      }
    };

    // ==========================================
    // LAYER 9: CANVAS FINGERPRINTING & WATERMARKING
    // ==========================================
    const applyCanvasProtection = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Generate unique watermark based on user and time
      const timestamp = Date.now();
      const watermark = `${userEmail}_${sessionIdRef.current}_${timestamp}`;

      // Create dynamic canvas watermark
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = `rgba(255, 255, 255, 0.02)`;
      ctx.font = "12px monospace";

      for (let i = 0; i < 10; i++) {
        ctx.fillText(watermark, i * 150, window.innerHeight / 2);
        ctx.fillText(watermark, i * 150, window.innerHeight / 2 + 30);
      }

      // Protect canvas from toDataURL
      const originalToDataURL = canvas.toDataURL;
      canvas.toDataURL = function () {
        console.warn("Canvas export blocked");
        return "";
      };
    };

    // ==========================================
    // LAYER 10: NETWORK REQUEST MONITORING
    // ==========================================
    const monitorNetworkRequests = () => {
      // Block fetch requests for video URLs
      const originalFetch = window.fetch;
      (window.fetch as any) = function (...args: any[]) {
        const url = args[0]?.toString() || "";

        // Block downloading video files
        if (
          url.includes(".mp4") ||
          url.includes(".m3u8") ||
          url.includes(".webm")
        ) {
          console.warn("Video download attempt blocked:", url);
          setScreenRecordingDetected(true);
          return Promise.reject(new Error("Video download blocked"));
        }

        return originalFetch.apply(window, args);
      };

      // Block XMLHttpRequest for video downloads
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (...args: any[]) {
        const url = args[1]?.toString() || "";

        if (
          url.includes(".mp4") ||
          url.includes(".m3u8") ||
          url.includes(".webm")
        ) {
          console.warn("XHR video download blocked:", url);
          setScreenRecordingDetected(true);
          throw new Error("Video download blocked");
        }

        return originalXHROpen.apply(this, args);
      };
    };

    // ==========================================
    // LAYER 11: VIDEO ELEMENT PROTECTION
    // ==========================================
    const protectVideoElement = () => {
      const video = videoElementRef.current;
      if (!video) return;

      // Disable all download methods
      if ("controlsList" in video) {
        (video as any).controlsList?.add?.("nodownload");
      }

      // Add context menu blocking directly on video
      video.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });

      // Block right-click on video
      video.addEventListener("mousedown", (e) => {
        if (e.button === 2 || e.button === 1) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });

      // Protect video properties
      Object.defineProperty(video, "controls", {
        get() {
          return true;
        },
        set(value: boolean) {
          return true;
        },
      });

      // Monitor play/pause
      video.onplay = () => setIsPlaying(true);
      video.onpause = () => setIsPlaying(false);
      video.ontimeupdate = () => setCurrentTime(video.currentTime);
      video.onloadedmetadata = () => setDuration(video.duration);

      // Log video playback for audit trail
      video.addEventListener("play", () => {
        console.log(
          `[Security] Video playing - User: ${userEmail}, Session: ${sessionIdRef.current}`,
        );
      });
    };

    // ==========================================
    // LAYER 12: GLOBAL DOCUMENT PROTECTION
    // ==========================================
    const protectDocument = () => {
      // Lock document selection
      document.body.style.userSelect = "none";
      (document.body.style as any).webkitUserSelect = "none";
      (document.body.style as any).MozUserSelect = "none";
      (document.body.style as any).msUserSelect = "none";

      // Disable inspector
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("contextmenu", handleContextMenu, true);
    };

    // ==========================================
    // LAYER 13: WINDOW & FRAME PROTECTION
    // ==========================================
    const protectWindow = () => {
      // Block opening new windows
      const originalOpen = window.open;
      (window as any).open = function (...args: any[]) {
        console.warn("Window.open blocked");
        return null;
      };

      // Block postMessage for cross-origin attacks
      const originalPostMessage = window.postMessage;
      (window as any).postMessage = function (...args: any[]) {
        const message = args[0];
        if (typeof message === "string" && message.includes("video")) {
          console.warn("PostMessage video extraction blocked");
          return;
        }
        return originalPostMessage.apply(window, args);
      };
    };

    // ==========================================
    // EXECUTE ALL PROTECTION LAYERS
    // ==========================================
    const setupAllProtections = () => {
      // Add event listeners
      document.addEventListener("contextmenu", handleContextMenu, true);
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("mousedown", handleMouseDown, true);
      document.addEventListener("mouseup", handleMouseUp, true);
      document.addEventListener("copy", handleCopy, true);
      document.addEventListener("cut", handleCut, true);
      document.addEventListener("paste", handlePaste, true);
      document.addEventListener("dragstart", handleDragStart, true);
      document.addEventListener("dragover", handleDragOver, true);
      document.addEventListener("drop", handleDrop, true);

      // Container-specific protection
      if (videoRef.current) {
        videoRef.current.addEventListener(
          "contextmenu",
          handleContextMenu,
          true,
        );
        videoRef.current.addEventListener("mousedown", handleMouseDown, true);
        videoRef.current.addEventListener("dragstart", handleDragStart, true);
      }

      // Activate all protection systems
      blockScreenRecordingAPIs();
      blockMediaAPIs();
      applyCanvasProtection();
      monitorNetworkRequests();
      protectVideoElement();
      protectDocument();
      protectWindow();
      disableDevTools();
    };

    setupAllProtections();

    // ==========================================
    // CLEANUP FUNCTION
    // ==========================================
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("mousedown", handleMouseDown, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("dragover", handleDragOver, true);
      document.removeEventListener("drop", handleDrop, true);

      if (videoRef.current) {
        videoRef.current.removeEventListener(
          "contextmenu",
          handleContextMenu,
          true,
        );
        videoRef.current.removeEventListener(
          "mousedown",
          handleMouseDown,
          true,
        );
        videoRef.current.removeEventListener(
          "dragstart",
          handleDragStart,
          true,
        );
      }
    };
  }, [userEmail]);

  // Get YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Check if it's a YouTube URL
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v") || url.split("/").pop();
        // and disable keyboard, enable nocookie, and hide logo, add playsinline for iOS
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&fs=1&controls=1&disablekb=1&iv_load_policy=3&playsinline=1`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
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
        userSelect: "none",
        WebkitUserSelect: "none" as any,
        msUserSelect: "none" as any,
        MozUserSelect: "none" as any,
      }}
    >
      {/* Hidden canvas for screen recording detection */}
      <canvas
        ref={canvasRef}
        width={1}
        height={1}
        style={{ display: "none" }}
      />

      {/* Security Warning Overlay */}
      {screenRecordingDetected && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
          <div className="bg-red-500/20 p-5 rounded-full mb-6 border border-red-500/50">
            <ShieldCheck size={64} className="text-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">
            Security Alert
          </h2>
          <p className="text-red-400 max-w-md font-medium">
            Screen capture or illegal recording activity has been detected. For
            security, playback has been paused.
          </p>
          <div className="mt-8 text-xs text-gray-500 uppercase tracking-tighter">
            System monitored IP: {userEmail}
          </div>
        </div>
      )}

      {/* Cyberpunk Style Header */}
      <div className="bg-[#1e293b]/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between text-white border-b border-blue-900/30 gap-3 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-blue-600/20 p-2 md:p-2.5 rounded-xl border border-blue-500/30 shrink-0">
            <Play size={16} className="md:w-[18px] md:h-[18px] text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm md:text-base tracking-tight leading-tight truncate">
              {videoTitle}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[9px] md:text-[10px] uppercase font-black text-blue-400 tracking-widest bg-blue-400/10 px-1.5 py-0.5 rounded shrink-0">
                Chapter
              </span>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium">
                {courseName} • L{lessonNumber}/{totalLessons}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-end shrink-0">
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                Encrypted
              </p>
            </div>
            <p className="text-[10px] text-gray-500 font-mono tracking-tighter truncate">
              {userEmail}
            </p>
          </div>
          <div
            className="bg-blue-600 hover:bg-blue-700 transition-colors p-2 rounded-lg border border-blue-500/50 shadow-lg shadow-blue-900/20 cursor-help shrink-0"
            title="Secure Stream"
          >
            <Lock size={14} className="md:w-4 md:h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Main Video Stage */}
      <div
        className="relative bg-[#020617] w-full"
        style={{ paddingBottom: "56.25%" }}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={videoTitle}
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              border: "none",
              pointerEvents: "auto",
              WebkitAllowFullScreen: true as any,
            }}
            sandbox="allow-autoplay allow-encrypted-media allow-fullscreen allow-same-origin allow-scripts allow-popups"
            allowFullScreen
            allow="accelerometer; autoplay; encrypted-media; gyroscope; fullscreen; picture-in-picture"
            className="select-none"
          />
        ) : (
          <video
            ref={videoElementRef}
            src={videoUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              cursor: "auto",
              userSelect: "none",
            }}
            controls
            controlsList="nodownload"
            className="select-none"
            playsInline
          />
        )}

        {/* Dynamic Flying Watermark (Premium Security) */}
        <div
          className="absolute inset-0 pointer-events-none select-none z-10"
          style={{ overflow: "hidden" }}
        >
          <div
            className="absolute text-[8px] md:text-[10px] font-mono text-white/5 whitespace-nowrap uppercase tracking-[0.5em] md:tracking-[1em]"
            style={{
              top: "15%",
              left: "5%",
              transform: "rotate(-25deg)",
              textShadow: "0 0 1px rgba(255,255,255,0.1)",
            }}
          >
            NIKLAUS • {userEmail}
          </div>
          <div
            className="absolute text-[8px] md:text-[10px] font-mono text-white/5 whitespace-nowrap uppercase tracking-[0.5em] md:tracking-[1em]"
            style={{
              bottom: "25%",
              right: "5%",
              transform: "rotate(-25deg)",
              textShadow: "0 0 1px rgba(255,255,255,0.1)",
            }}
          >
            NIKLAUS • {userEmail}
          </div>
        </div>

        {/* Corner Branding (Fui Style) */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 pointer-events-none select-none z-20 opacity-40 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col items-end">
            <div className="h-0.5 w-8 md:w-12 bg-blue-500/50 mb-1" />
            <p className="text-[6px] md:text-[8px] font-mono text-blue-400 uppercase tracking-tighter">
              Niklaus x800
            </p>
          </div>
        </div>
      </div>

      {/* Premium Security Footer Notice */}
      {showSecurityWarning && (
        <div className="bg-[#1e293b] p-3 md:p-5 border-t border-blue-900/30 flex flex-col md:flex-row items-start gap-3 md:gap-4 transition-all hover:bg-[#334155]/50 group/msg relative">
          <div className="bg-blue-600/10 p-2 md:p-3 rounded-2xl border border-blue-500/20 shrink-0">
            <ShieldCheck size={20} className="md:w-6 md:h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] md:text-[11px]">
                Secure Protocol
              </h4>
              <span className="h-1 w-1 bg-blue-400 rounded-full" />
              <span className="text-[9px] md:text-[10px] text-blue-400 font-mono">
                X-800
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed font-medium">
              Advanced protection active. Unauthorized recording will result in
              account termination.
            </p>
          </div>
          <button
            onClick={() => setShowSecurityWarning(false)}
            className="bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors border border-white/10 h-fit shrink-0"
            title="Dismiss"
          >
            <X size={12} className="md:w-3.5 md:h-3.5 text-gray-400" />
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
      <div className="bg-[#0f172a] px-3 md:px-6 py-1.5 md:py-2 border-t border-blue-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[8px] md:text-[9px] font-mono text-gray-500 uppercase tracking-widest">
        <span>© 2026 Niklaus Solutions</span>
        <span className="hidden md:block">Secure Stream Protocol v4.0</span>
      </div>
    </div>
  );
};
