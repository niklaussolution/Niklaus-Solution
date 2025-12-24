import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Video {
  id: number;
  title: string;
  url: string;
}

const videos: Video[] = [
  {
    id: 1,
    title: "Introduction to Nativeva",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "How Nativeva Transforms Careers",
    url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
  },
  {
    id: 3,
    title: "Success Stories from Nativeva",
    url: "https://www.youtube.com/embed/tgbNymZ7vqY",
  },
];

export function VideoCarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
  };

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
            Explore Our Videos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn more about Nativeva through our curated video content
          </p>
        </motion.div>

        {/* Video Carousel */}
        <div className="relative">
          {/* Video Display */}
          <motion.div
            key={videos[currentIndex].id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden shadow-lg"
          >
            <iframe
              src={videos[currentIndex].url}
              title={videos[currentIndex].title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
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

            <div className="text-center">
              <p className="text-gray-600 font-semibold">
                {videos[currentIndex].title}
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
      </div>
    </section>
  );
}