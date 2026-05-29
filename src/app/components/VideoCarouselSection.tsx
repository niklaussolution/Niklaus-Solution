import { motion } from "motion/react";
import { MessageCircle, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

interface VideoCarouselSectionProps {
  onOpenContactForm?: () => void;
}

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  heading?: string;
  description?: string;
  frameTitle?: string;
  order: number;
  isActive: boolean;
}

function extractYoutubeVideoId(url: string): string {
  if (!url) return '';
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  if (match && match[1]) return match[1];
  const trimmed = url.trim();
  return (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) ? trimmed : '';
}

export function VideoCarouselSection({ onOpenContactForm }: VideoCarouselSectionProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionHeading, setSectionHeading] = useState("Explore Our Videos");
  const [sectionDescription, setSectionDescription] = useState("Learn more about Niklaus Solutions through our curated video content");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videos.length]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Fetch all videos from the collection to ensure all content is visible
      const querySnapshot = await getDocs(collection(db, "videos"));
      const data: Video[] = [];
      querySnapshot.forEach((docSnap) => {
        const video = docSnap.data();
        data.push({
          id: docSnap.id,
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          heading: video.heading,
          description: video.description,
          frameTitle: video.frameTitle,
          order: video.order,
          isActive: video.isActive === true || String(video.isActive).toLowerCase() === 'true',
        } as Video);
      });
      
      const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setVideos(sortedData);
      
      // Start with the 2nd video (index 1) in the center position
      if (sortedData.length > 1) {
        setCurrentIndex(1);
      }
      
      // Get section heading and description from first video or defaults
      if (sortedData.length > 0 && sortedData[0].heading) {
        setSectionHeading(sortedData[0].heading);
        if (sortedData[0].description) {
          setSectionDescription(sortedData[0].description);
        }
      }
    } catch (err) {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (loading) {
    return (
      <section id="video-carousel" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section id="video-carousel" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 text-gray-500">
            <p>No videos available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="video-carousel" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {sectionDescription}
          </p>
        </motion.div>

        {/* Video Carousel */}
        <div className="relative mt-8 px-4 md:px-12 group">
          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-800 hover:bg-orange-500 hover:text-white transition-all border border-gray-100"
            aria-label="Previous video"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-800 hover:bg-orange-500 hover:text-white transition-all border border-gray-100"
            aria-label="Next video"
          >
            <ChevronRight size={24} />
          </button>

          <div className="overflow-hidden" ref={containerRef}>
            <motion.div 
              className="flex gap-6 md:gap-8 items-center"
              animate={{ 
                // Calculate offset to place the current index exactly in the center of the viewport
                x: (containerWidth / 2) - (currentIndex * (windowWidth < 768 ? 304 : 352)) - ((windowWidth < 768 ? 280 : 320) / 2)
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: "max-content" }}
            >
              {videos.map((video, idx) => {
                const videoId = extractYoutubeVideoId(video.youtubeUrl);
                const isSelected = currentIndex === idx;
                return (
                  <div
                    key={video.id}
                    onClick={() => !isSelected && setCurrentIndex(idx)}
                    className={`w-[280px] md:w-[320px] bg-white border-[6px] rounded-3xl shadow-2xl transition-all duration-500 flex-shrink-0 relative group flex flex-col ${
                      isSelected ? "scale-105 opacity-100 border-orange-500 z-10" : "scale-90 opacity-60 cursor-pointer border-transparent overflow-hidden"
                    }`}
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    {/* Premium Header Frame */}
                    <div className="bg-orange-500 py-4 px-3 flex flex-col items-center justify-center text-white shrink-0 border-b border-orange-600 rounded-t-[1.2rem] overflow-hidden">
                      <span className="text-[11px] font-black tracking-[0.2em] uppercase opacity-90 leading-none mb-1.5">
                        NIKLAUS SOLUTIONS
                      </span>
                      <h4 className="text-sm md:text-base font-extrabold tracking-tight text-center truncate w-full px-2 drop-shadow-sm">
                        {video.frameTitle || "STUDENT TESTIMONIAL"}
                      </h4>
                    </div>

                    <div className="relative flex-1 bg-black overflow-hidden rounded-b-[1.2rem]">
                      {videoId ? (
                        isSelected ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&autoplay=0`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        ) : (
                          <div className="w-full h-full relative bg-gray-900">
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                              alt={video.title}
                              className="w-full h-full object-cover opacity-60"
                            />
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <p className="text-gray-400 text-sm p-4 text-center">Video Unavailable</p>
                        </div>
                      )}

                      {/* Play Icon Overlay */}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 pointer-events-none z-10 ${
                        isSelected ? "opacity-0" : "opacity-100"
                      }`}>
                        <div className="w-16 h-16 bg-orange-500/90 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                          <Play size={32} className="text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Simple Title Overlay */}
                    {video.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                        <p className="text-white font-semibold text-xs md:text-sm truncate">{video.title}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Pagination Indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {videos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "bg-orange-500 w-8" : "bg-gray-300"
                }`}
                aria-label={`Go to video ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Get in Touch Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <motion.button
            onClick={onOpenContactForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <MessageCircle size={20} />
            Get in Touch
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
