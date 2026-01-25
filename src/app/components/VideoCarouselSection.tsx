import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
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
  try {
    // Handle youtu.be short URLs
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    // Handle youtube.com watch URLs
    if (url.includes('youtube.com')) {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      return urlParams.get('v') || '';
    }
    // If it's already just the video ID
    if (!url.includes('/') && !url.includes('?')) {
      return url;
    }
    return '';
  } catch {
    return '';
  }
}

export function VideoCarouselSection({ onOpenContactForm }: VideoCarouselSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionHeading, setSectionHeading] = useState("Explore Our Videos");
  const [sectionDescription, setSectionDescription] = useState("Learn more about Nativeva through our curated video content");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "videos"),
        where("isActive", "==", true),
        orderBy("order", "asc")
      );
      const querySnapshot = await getDocs(q);
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
          isActive: video.isActive,
        } as Video);
      });
      setVideos(data);
      
      // Get section heading and description from first video or defaults
      if (data.length > 0 && data[0].heading) {
        setSectionHeading(data[0].heading);
        if (data[0].description) {
          setSectionDescription(data[0].description);
        }
      }
    } catch (err) {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  const nextVideo = () => {
    if (videos.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }
  };

  const prevVideo = () => {
    if (videos.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
    }
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

  const currentVideo = videos[currentIndex];
  const videoId = extractYoutubeVideoId(currentVideo.youtubeUrl);

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
        <div className="relative">
          {/* Video Display */}
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-gray-200 rounded-lg overflow-hidden shadow-lg"
            style={{ aspectRatio: "16 / 9" }}
          >
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={currentVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <p className="text-gray-600">Invalid video URL</p>
              </div>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevVideo}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
              aria-label="Previous video"
            >
              <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
            </button>

            <div className="text-center flex-1 px-4">
              <p className="text-gray-600 font-semibold">
                {currentVideo.title}
              </p>
            </div>

            <button
              onClick={nextVideo}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-orange-500 text-gray-700 hover:text-white transition-all shadow-md hover:shadow-lg group"
              aria-label="Next video"
            >
              <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
            </button>
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
