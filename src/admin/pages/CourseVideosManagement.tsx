import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  Trash2,
  Edit,
  Plus,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  Video,
  ChevronDown,
  ChevronUp,
  Save,
  Upload,
  Loader,
} from 'lucide-react';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../config/firebase';

interface Workshop {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  isActive: boolean;
}

interface CourseVideo {
  id: string;
  workshopId: string;
  title: string;
  videoUrl: string;
  description: string;
  duration?: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  fileName?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const CourseVideosManagement: React.FC = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Workshop[]>([]);
  const [coursesWithVideos, setCoursesWithVideos] = useState<
    Map<string, CourseVideo[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Workshop | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    videoFile: null as File | null,
    description: '',
    duration: '',
    order: 0,
    isActive: true,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchCoursesAndVideos();
  }, []);

  const fetchCoursesAndVideos = async () => {
    try {
      setLoading(true);

      // Fetch all workshops/courses
      const workshopsRef = collection(db, 'workshops');
      const workshopsSnapshot = await getDocs(workshopsRef);
      const coursesList = workshopsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workshop[];
      setCourses(coursesList);

      // Fetch all videos organized by course
      const videosRef = collection(db, 'workshop_videos');
      const videosSnapshot = await getDocs(videosRef);

      const videosMap = new Map<string, CourseVideo[]>();

      for (const course of coursesList) {
        const courseVideos = videosSnapshot.docs
          .filter((doc) => doc.data().workshopId === course.id)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
          } as CourseVideo))
          .sort((a, b) => a.order - b.order);

        videosMap.set(course.id, courseVideos);
      }

      setCoursesWithVideos(videosMap);
    } catch (error) {
      console.error('Error fetching courses and videos:', error);
      addToast('Error loading courses and videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddVideoForm = (course: Workshop) => {
    setSelectedCourse(course);
    setEditingVideoId(null);
    setVideoFormData({
      title: '',
      videoFile: null,
      description: '',
      duration: '',
      order: (coursesWithVideos.get(course.id) || []).length,
      isActive: true,
    });
    setUploadProgress(0);
    setShowVideoForm(true);
  };

  const handleCloseVideoForm = () => {
    setShowVideoForm(false);
    setSelectedCourse(null);
    setEditingVideoId(null);
    setVideoFormData({
      title: '',
      videoFile: null,
      description: '',
      duration: '',
      order: 0,
      isActive: true,
    });
    setUploadProgress(0);
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) return;
    if (!videoFormData.title.trim()) {
      addToast('Video title is required', 'error');
      return;
    }
    if (!editingVideoId && !videoFormData.videoFile) {
      addToast('Video file is required', 'error');
      return;
    }

    try {
      setIsUploading(true);
      let videoUrl = '';
      let fileName = '';

      // Upload video file to Firebase Storage if new file selected
      if (videoFormData.videoFile) {
        const file = videoFormData.videoFile;
        fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(
          storage,
          `course_videos/${selectedCourse.id}/${fileName}`
        );

        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } else if (editingVideoId) {
        // Keep existing video URL when updating without changing file
        const existingVideo = Array.from(coursesWithVideos.values())
          .flat()
          .find((v) => v.id === editingVideoId);
        if (existingVideo) {
          videoUrl = existingVideo.videoUrl;
          fileName = existingVideo.fileName || '';
        }
      }

      const videosRef = collection(db, 'workshop_videos');

      if (editingVideoId) {
        // Update existing video
        const videoRef = doc(db, 'workshop_videos', editingVideoId);
        await updateDoc(videoRef, {
          title: videoFormData.title,
          description: videoFormData.description,
          duration: videoFormData.duration,
          order: videoFormData.order,
          isActive: videoFormData.isActive,
          videoUrl,
          fileName,
          workshopId: selectedCourse.id,
          updatedAt: new Date(),
        });
        addToast('Video updated successfully!', 'success');
      } else {
        // Add new video
        await addDoc(videosRef, {
          workshopId: selectedCourse.id,
          title: videoFormData.title,
          description: videoFormData.description,
          duration: videoFormData.duration,
          order: videoFormData.order,
          isActive: videoFormData.isActive,
          videoUrl,
          fileName,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        addToast('Video uploaded successfully!', 'success');
      }

      handleCloseVideoForm();
      await fetchCoursesAndVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      addToast('Error uploading video', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditVideo = (course: Workshop, video: CourseVideo) => {
    setSelectedCourse(course);
    setEditingVideoId(video.id);
    setVideoFormData({
      title: video.title,
      videoFile: null,
      description: video.description,
      duration: video.duration || '',
      order: video.order,
      isActive: video.isActive,
    });
    setUploadProgress(0);
    setShowVideoForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('video-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      // Find the video to get its Firebase Storage path
      const video = Array.from(coursesWithVideos.values())
        .flat()
        .find((v) => v.id === videoId);

      if (video && video.fileName) {
        try {
          const fileRef = ref(
            storage,
            `course_videos/${video.workshopId}/${video.fileName}`
          );
          await deleteObject(fileRef);
        } catch (storageError) {
          console.warn('Error deleting file from storage:', storageError);
        }
      }

      const videoRef = doc(db, 'workshop_videos', videoId);
      await deleteDoc(videoRef);
      addToast('Video deleted successfully!', 'success');
      await fetchCoursesAndVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      addToast('Error deleting video', 'error');
    }
  };

  const toggleCoursExpand = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {toast.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Course Videos
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Manage videos for all your courses
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">Total Courses</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{courses.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">Total Videos</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Array.from(coursesWithVideos.values()).reduce(
                (sum, videos) => sum + videos.length,
                0
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">Active Courses</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {courses.filter((c) => c.isActive).length}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List - Left Side (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const videos = coursesWithVideos.get(course.id) || [];
              const isExpanded = expandedCourses.has(course.id);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                >
                  {/* Course Header */}
                  <div
                    className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:bg-blue-100 transition"
                    onClick={() => toggleCoursExpand(course.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">📚</div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Instructor: {course.instructorName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            {videos.length}
                          </p>
                          <p className="text-xs text-gray-600">video{videos.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          className="p-2 hover:bg-white rounded-lg transition"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp size={24} className="text-gray-600" />
                          ) : (
                            <ChevronDown size={24} className="text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4 flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {course.isActive ? '✓ Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Course Details - Expanded */}
                  {isExpanded && (
                    <div className="p-6 border-t border-gray-200">
                      <p className="text-sm text-gray-700 mb-6">
                        {course.description}
                      </p>

                      {/* Add Video Button */}
                      <button
                        onClick={() => handleOpenAddVideoForm(course)}
                        className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        <Plus size={18} />
                        Add Video
                      </button>

                      {/* Videos List */}
                      {videos.length > 0 ? (
                        <div className="space-y-3">
                          {videos.map((video, index) => (
                            <div
                              key={video.id}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <h4 className="font-semibold text-gray-900">
                                      {video.title}
                                    </h4>
                                  </div>

                                  <p className="text-sm text-gray-600 mt-2">
                                    {video.description}
                                  </p>

                                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    {video.duration && (
                                      <span>⏱️ {video.duration} min</span>
                                    )}
                                    <span
                                      className={`px-2 py-1 rounded ${
                                        video.isActive
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {video.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {video.fileName ? (
                                      <span className="text-xs text-gray-500 truncate">
                                        📹 {video.fileName.substring(0, 30)}...
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-400">No file uploaded</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditVideo(course, video)
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteVideo(video.id)
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Video size={32} className="mx-auto mb-2 text-gray-300" />
                          <p>No videos added yet. Add your first video!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg">
                {searchTerm
                  ? 'No courses match your search'
                  : 'No courses available'}
              </p>
            </div>
          )}
          </div>

          {/* Video Form - Right Side (1/3 width) / Full Width Below */}
          {showVideoForm && selectedCourse && (
            <div
              id="video-form"
              className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit"
            >
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Form Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingVideoId ? 'Edit Video' : 'Add New Video'}
                      </h2>
                      <p className="text-blue-100 text-sm mt-2">
                        {selectedCourse.title}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseVideoForm}
                      className="text-blue-100 hover:text-white transition p-1"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleVideoSubmit} className="p-6 space-y-6">
                  {/* Video Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={videoFormData.title}
                      onChange={(e) =>
                        setVideoFormData({
                          ...videoFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Introduction"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="text"
                      value={videoFormData.duration}
                      onChange={(e) =>
                        setVideoFormData({
                          ...videoFormData,
                          duration: e.target.value,
                        })
                      }
                      placeholder="e.g., 15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video Order
                    </label>
                    <input
                      type="number"
                      value={videoFormData.order}
                      onChange={(e) =>
                        setVideoFormData({
                          ...videoFormData,
                          order: parseInt(e.target.value),
                        })
                      }
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Video File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video File {!editingVideoId && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setVideoFormData({
                            ...videoFormData,
                            videoFile: e.target.files?.[0] || null,
                          })
                        }
                        disabled={isUploading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Upload className="absolute right-3 top-3 text-gray-400" size={18} />
                    </div>
                    {videoFormData.videoFile && (
                      <p className="text-xs text-green-600 mt-2">
                        Selected: {videoFormData.videoFile.name}
                      </p>
                    )}
                    {editingVideoId && !videoFormData.videoFile && (
                      <p className="text-xs text-gray-500 mt-2">
                        Leave empty to keep existing video
                      </p>
                    )}
                    {isUploading && uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Uploading...</span>
                          <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={videoFormData.description}
                      onChange={(e) =>
                        setVideoFormData({
                          ...videoFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the video..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={videoFormData.isActive}
                        onChange={(e) =>
                          setVideoFormData({
                            ...videoFormData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Active (Visible)
                      </span>
                    </label>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {editingVideoId ? 'Update' : 'Add'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseVideoForm}
                      disabled={isUploading}
                      className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
