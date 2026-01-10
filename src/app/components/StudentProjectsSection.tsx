'use client';

import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ExternalLink, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

interface StudentProject {
  id: string;
  name: string;
  photo: string;
  title: string;
  description: string;
  demoLink: string;
  demoType: 'link' | 'video' | 'image';
  isActive?: boolean;
  order?: number;
}

type DemoViewType = 'link' | 'video' | 'image' | 'photo';

// Helper function to convert video URLs to embeddable format
const getEmbeddableVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube URL patterns
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // If already an embedded URL, return as is
  if (url.includes('embed') || url.includes('player')) {
    return url;
  }
  
  // If it's a direct video file URL, return as is
  if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
    return url;
  }
  
  // Default: try to use as is
  return url;
};

// Helper function to check if image URL is valid
const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('firebaseapp');
  } catch {
    return false;
  }
};

export function StudentProjectsSection() {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, 'studentProjects');
      const q = query(projectsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const projectsData: StudentProject[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }))
        .filter((p) => p.isActive !== false);
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to load student projects');
    } finally {
      setLoading(false);
    }
  };

  const openProjectDemo = (project: StudentProject) => {
    setExpandedProjectId(expandedProjectId === project.id ? null : project.id);
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const goToPrevious = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe(touchStart, e.changedTouches[0].clientX);
  };

  const handleSwipe = (start: number, end: number) => {
    const distance = start - end;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (loading) {
    return (
      <section id="student-projects" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
              Loading student projects...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="student-projects" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section id="student-projects" className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-4 py-2 bg-orange-100 text-orange-600 rounded-full">
            Success Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Student Projects & <span className="text-orange-500">Success Stories</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing projects built by our students. Click on any project to see the live demo!
          </p>
        </motion.div>

        {/* Projects Grid - Desktop and Carousel - Mobile */}
        <div>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const isExpanded = expandedProjectId === project.id;
              const displayDescription = truncateDescription(project.description);
              const isDescriptionTruncated = project.description.length > 120;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <ProjectCard
                    project={project}
                    isExpanded={isExpanded}
                    displayDescription={displayDescription}
                    isDescriptionTruncated={isDescriptionTruncated}
                    onToggleExpand={() => setExpandedProjectId(isExpanded ? null : project.id)}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            {projects.length > 0 && (
              <div>
                {/* Carousel Container */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={projects[currentSlideIndex]?.id}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="mb-6"
                >
                  <div>
                    {(() => {
                      const project = projects[currentSlideIndex];
                      const isExpanded = expandedProjectId === project.id;
                      const displayDescription = truncateDescription(project.description);
                      const isDescriptionTruncated = project.description.length > 120;

                      return (
                        <ProjectCard
                          project={project}
                          isExpanded={isExpanded}
                          displayDescription={displayDescription}
                          isDescriptionTruncated={isDescriptionTruncated}
                          onToggleExpand={() => setExpandedProjectId(isExpanded ? null : project.id)}
                        />
                      );
                    })()}
                  </div>
                </motion.div>

                {/* Navigation Controls */}
                <div className="flex flex-col items-center gap-4">
                  {/* Navigation Dots */}
                  <div className="flex justify-center gap-2">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          index === currentSlideIndex
                            ? 'bg-orange-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Previous and Next Buttons */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={goToPrevious}
                      className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
                      aria-label="Previous project"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={goToNext}
                      className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
                      aria-label="Next project"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper Component for Project Card
interface ProjectCardProps {
  project: StudentProject;
  isExpanded: boolean;
  displayDescription: string;
  isDescriptionTruncated: boolean;
  onToggleExpand: () => void;
}

function ProjectCard({ project, isExpanded, displayDescription, isDescriptionTruncated, onToggleExpand }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
      {/* Student Avatar Section */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 flex items-center gap-4 border-b">
        <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-orange-500 flex-shrink-0 shadow-md">
          <img
            src={project.photo}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm truncate">{project.name}</h4>
          <p className="text-xs text-orange-600 font-semibold">Student Project</p>
        </div>
      </div>

      {/* Project Title */}
      <div className="p-6 pb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {project.title}
        </h3>

        {/* Truncated Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {isExpanded ? project.description : displayDescription}
        </p>

        {/* Read More Button */}
        {isDescriptionTruncated && (
          <button
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-700 transition-colors text-sm mb-4"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Read More
              </>
            )}
          </button>
        )}
      </div>

      {/* Demo Container - Always visible */}
      <div className="px-6 pb-6 mt-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Demo</p>

        {/* Link Demo - Browser Container */}
        {project.demoType === 'link' && project.demoLink && (
          <div className="space-y-2">
            <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg w-full" style={{ height: '260px' }}>
              {/* iframe Container */}
              <iframe
                src={project.demoLink.startsWith('http') ? project.demoLink : `https://${project.demoLink}`}
                title={project.title}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">Live Browser</p>
          </div>
        )}

        {/* Video Demo */}
        {project.demoType === 'video' && (
          <div className="space-y-2">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative group">
              {project.demoLink.includes('.mp4') || project.demoLink.includes('.webm') || project.demoLink.includes('.mov') ? (
                <video
                  width="100%"
                  height="100%"
                  controls
                  className="w-full h-full object-cover"
                  controlsList="nodownload"
                >
                  <source src={project.demoLink} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbeddableVideoUrl(project.demoLink)}
                  title={project.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">Video Demo</p>
          </div>
        )}

        {/* Image Demo */}
        {project.demoType === 'image' && (
          <div className="space-y-2">
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg w-full" style={{ height: '260px' }}>
              <img
                src={project.demoLink}
                alt="Project demo"
                className="w-full h-full object-contain bg-white"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">Screenshot</p>
          </div>
        )}
      </div>
    </div>
  );
}
