import { motion, useAnimationControls } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    fetchVideos();
  }, []);

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
          order: video.order,
          isActive: video.isActive === true || String(video.isActive).toLowerCase() === 'true',
        } as Video);
      });
      
      const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setVideos(sortedData);
      
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
        <div 
          className="relative overflow-hidden py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Video Display */}
          <div className="flex">
            <div
              className="flex gap-6 md:gap-8"
              style={{ 
                width: "max-content",
                animation: "marquee-videos 25s linear infinite",
                animationPlayState: isPaused ? "paused" : "running"
              }}
            >
              <style>{`
                @keyframes marquee-videos {
                  0% { transform: translateX(-50%); }
                  100% { transform: translateX(0%); }
                }
              `}</style>
              {/* Render videos twice for seamless looping */}
              {[...videos, ...videos].map((video, idx) => {
                const videoId = extractYoutubeVideoId(video.youtubeUrl);
                return (
                  <div
                    key={`${video.id}-${idx}`}
                    className="w-[280px] md:w-[320px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow flex-shrink-0"
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <p className="text-gray-600 text-sm p-4 text-center">Video Unavailable</p>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white font-semibold text-sm truncate">{video.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
