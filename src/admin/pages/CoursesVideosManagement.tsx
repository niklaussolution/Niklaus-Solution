import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../config/firebase';
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
  ChevronDown,
  ChevronUp,
  Save,
  Upload,
  Loader,
  Play,
} from 'lucide-react';
import {
  ref,
  deleteObject,
} from 'firebase/storage';

// Course videos are now hosted on our own VPS instead of Firebase Storage.
const VPS_UPLOAD_URL = 'https://videos.theniklaus.com/admin/upload-video';
const VPS_DELETE_URL = 'https://videos.theniklaus.com/admin/video';
const VPS_ADMIN_KEY = import.meta.env.VITE_VPS_ADMIN_KEY || '';

function uploadToVPS(file: File, courseId: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', VPS_UPLOAD_URL);
    xhr.setRequestHeader('X-Admin-Key', VPS_ADMIN_KEY);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && data.vpsPath) resolve(data.vpsPath);
        else reject(new Error(data.error || 'Upload failed'));
      } catch {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed - network error'));
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('file', file);
    xhr.send(formData);
  });
}

async function deleteFromVPS(vpsPath: string): Promise<void> {
  await fetch(VPS_DELETE_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': VPS_ADMIN_KEY },
    body: JSON.stringify({ vpsPath }),
  });
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  isActive: boolean;
}

interface CourseVideo {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  description: string;
  duration?: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  fileName?: string;
  vpsPath?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const CoursesVideosManagement: React.FC = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesWithVideos, setCoursesWithVideos] = useState<Map<string, CourseVideo[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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
  const [playingVideo, setPlayingVideo] = useState<CourseVideo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openPreview = async (video: CourseVideo) => {
    setPlayingVideo(video);
    setPreviewUrl(null);
    if (video.vpsPath) {
      try {
        const res = await fetch(
          `https://videos.theniklaus.com/admin/preview-link?path=${encodeURIComponent(video.vpsPath)}`,
          { headers: { 'X-Admin-Key': VPS_ADMIN_KEY } }
        );
        const data = await res.json();
        if (res.ok) setPreviewUrl(data.url);
        else addToast(data.error || 'Unable to load preview', 'error');
      } catch {
        addToast('Unable to load preview', 'error');
      }
    } else {
      setPreviewUrl(video.videoUrl);
    }
  };

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
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData: Course[] = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        instructor: doc.data().instructor || '',
        isActive: doc.data().isActive !== false,
      }));
      setCourses(coursesData);

      const videosRef = collection(db, 'courseVideos');
      const videosSnapshot = await getDocs(videosRef);
      const videosMap = new Map<string, CourseVideo[]>();

      videosSnapshot.docs.forEach((doc) => {
        const video = {
          id: doc.id,
          ...doc.data(),
        } as CourseVideo;
        if (!videosMap.has(video.courseId)) {
          videosMap.set(video.courseId, []);
        }
        videosMap.get(video.courseId)!.push(video);
      });

      // Sort videos by order
      videosMap.forEach((videos) => {
        videos.sort((a, b) => a.order - b.order);
      });

      setCoursesWithVideos(videosMap);
    } catch (error) {
      console.error('Error fetching courses and videos:', error);
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseExpanded = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const openVideoForm = (course: Course) => {
    setSelectedCourse(course);
    setVideoFormData({
      title: '',
      videoFile: null,
      description: '',
      duration: '',
      order: (coursesWithVideos.get(course.id)?.length || 0) + 1,
      isActive: true,
    });
    setEditingVideoId(null);
    setShowVideoForm(true);
  };

  const editVideo = (course: Course, video: CourseVideo) => {
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
    setShowVideoForm(true);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFormData((prev) => ({
        ...prev,
        videoFile: e.target.files![0],
      }));
    }
  };

  const handleVideoFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    setVideoFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      [name]: name === 'order' ? parseInt(value) : value,
    }));
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    if (!videoFormData.title.trim()) {
      addToast('Video title is required', 'error');
      return;
    }

    setIsUploading(true);
    try {
      if (editingVideoId && !videoFormData.videoFile) {
        // Editing without uploading new file
        const videoRef = doc(db, 'courseVideos', editingVideoId);
        await updateDoc(videoRef, {
          title: videoFormData.title,
          description: videoFormData.description,
          duration: videoFormData.duration,
          order: videoFormData.order,
          isActive: videoFormData.isActive,
          updatedAt: new Date(),
        });
        addToast('Video updated successfully', 'success');
      } else if (videoFormData.videoFile) {
        // Upload file directly to the VPS (course videos no longer go to Firebase Storage)
        const vpsPath = await uploadToVPS(videoFormData.videoFile, selectedCourse.id, setUploadProgress);

        if (editingVideoId) {
          // Update existing video
          const oldVideoRef = doc(db, 'courseVideos', editingVideoId);
          const oldVideo = Array.from(coursesWithVideos.values())
            .flat()
            .find((v) => v.id === editingVideoId);

          if (oldVideo?.vpsPath) {
            deleteFromVPS(oldVideo.vpsPath).catch((err) => console.warn('Error deleting old VPS file:', err));
          } else if (oldVideo?.fileName) {
            try {
              await deleteObject(ref(storage, `courseVideos/${oldVideo.fileName}`));
            } catch (deleteErr) {
              console.warn('Error deleting old file:', deleteErr);
            }
          }

          await updateDoc(oldVideoRef, {
            title: videoFormData.title,
            videoUrl: '',
            vpsPath,
            description: videoFormData.description,
            duration: videoFormData.duration,
            order: videoFormData.order,
            isActive: videoFormData.isActive,
            updatedAt: new Date(),
          });
          addToast('Video updated successfully', 'success');
        } else {
          // Create new video
          await addDoc(collection(db, 'courseVideos'), {
            courseId: selectedCourse.id,
            title: videoFormData.title,
            videoUrl: '',
            vpsPath,
            description: videoFormData.description,
            duration: videoFormData.duration,
            order: videoFormData.order,
            isActive: videoFormData.isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          addToast('Video uploaded successfully', 'success');
        }
      }

      setShowVideoForm(false);
      setUploadProgress(0);
      fetchCoursesAndVideos();
    } catch (error: any) {
      console.error('Error saving video:', error);
      addToast(error.message || 'Error saving video', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const video = Array.from(coursesWithVideos.values())
        .flat()
        .find((v) => v.id === videoId);

      if (video?.vpsPath) {
        try {
          await deleteFromVPS(video.vpsPath);
        } catch (deleteErr) {
          console.warn('Error deleting VPS file:', deleteErr);
        }
      } else if (video?.fileName) {
        try {
          await deleteObject(ref(storage, `courseVideos/${video.fileName}`));
        } catch (deleteErr) {
          console.warn('Error deleting file:', deleteErr);
        }
      }

      await deleteDoc(doc(db, 'courseVideos', videoId));
      addToast('Video deleted successfully', 'success');
      fetchCoursesAndVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      addToast('Error deleting video', 'error');
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toasts */}
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg flex items-center gap-2 ${
                toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {toast.message}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Course Videos</h2>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2"
            />
          </div>
        </div>

        {/* Video Form Modal */}
        {showVideoForm && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingVideoId ? 'Edit Video' : 'Add Video'} - {selectedCourse.title}
                </h3>
                <button
                  onClick={() => setShowVideoForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                  <input
                    type="text"
                    name="title"
                    value={videoFormData.title}
                    onChange={handleVideoFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={videoFormData.description}
                    onChange={handleVideoFormChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Video description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      value={videoFormData.duration}
                      onChange={handleVideoFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g. 10 minutes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      name="order"
                      value={videoFormData.order}
                      onChange={handleVideoFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video File {!editingVideoId || videoFormData.videoFile ? '(Required)' : '(Optional - leave empty to keep existing)'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                      id="videoInput"
                    />
                    <label htmlFor="videoInput" className="cursor-pointer">
                      <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">
                        {videoFormData.videoFile ? videoFormData.videoFile.name : 'Click to upload or drag and drop'}
                      </p>
                    </label>
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={videoFormData.isActive}
                    onChange={handleVideoFormChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                  {isUploading ? 'Uploading...' : editingVideoId ? 'Update Video' : 'Upload Video'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No courses found</div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => toggleCourseExpanded(course.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {expandedCourses.has(course.id) ? (
                      <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-600" />
                    )}
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {coursesWithVideos.get(course.id)?.length || 0} videos
                    </span>
                    {course.isActive && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    )}
                  </div>
                </button>

                {expandedCourses.has(course.id) && (
                  <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-4">
                    <button
                      onClick={() => openVideoForm(course)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
                    >
                      <Plus size={18} />
                      Add Video
                    </button>

                    <div className="space-y-3">
                      {(coursesWithVideos.get(course.id) || []).map((video) => (
                        <div
                          key={video.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-block w-6 h-6 bg-gray-200 rounded text-center text-xs font-bold text-gray-700">
                                {video.order}
                              </span>
                              <h4 className="font-semibold text-gray-900">{video.title}</h4>
                              {!video.isActive && (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{video.description}</p>
                            {video.duration && (
                              <p className="text-xs text-gray-500">Duration: {video.duration}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => openPreview(video)}
                              disabled={!video.videoUrl && !video.vpsPath}
                              className="text-green-600 hover:text-green-800 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={video.videoUrl || video.vpsPath ? 'Play' : 'No video file'}
                            >
                              <Play size={18} />
                            </button>
                            <button
                              onClick={() => editVideo(course, video)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Video Preview Modal */}
        {playingVideo && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <div
              className="bg-black rounded-lg overflow-hidden w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                <h3 className="text-white font-semibold truncate pr-4">
                  {playingVideo.title}
                </h3>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="text-gray-300 hover:text-white transition flex-shrink-0"
                >
                  <X size={22} />
                </button>
              </div>
              {previewUrl ? (
                <video
                  key={playingVideo.id}
                  src={previewUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[75vh]"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-white text-sm">
                  Loading video...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
