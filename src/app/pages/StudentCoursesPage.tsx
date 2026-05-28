import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { db, auth } from "../../admin/config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: string;
  color: string;
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
}

interface StudentCourse {
  id: string;
  courseId: string;
  course?: Course;
  enrollmentDate: number;
  progress: number;
  status: string;
  videos: CourseVideo[];
}

export const StudentCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate("/student/login");
      return;
    }
    
    fetchStudentAndCourses(studentId);
  }, [navigate]);

  const fetchStudentAndCourses = async (studentId: string) => {
    try {
      // Get student email from Firestore
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (!studentSnap.exists()) {
        navigate("/student/login");
        return;
      }
      
      const studentEmail = studentSnap.data().email;
      fetchCourses(studentEmail);
    } catch (err) {
      console.error("Error fetching student:", err);
      navigate("/student/login");
    }
  };

  const fetchCourses = async (studentEmail: string) => {

    try {
      setLoading(true);
      const enrollmentsRef = collection(db, "courseEnrollments");
      const q = query(enrollmentsRef, where("email", "==", studentEmail));
      const enrollmentsSnapshot = await getDocs(q);

      const studentCourses: StudentCourse[] = [];

      for (const enrollDoc of enrollmentsSnapshot.docs) {
        const enrollData = enrollDoc.data();
        const courseId = enrollData.courseId;

        // Get course details
        try {
          const courseRef = doc(db, "courses", courseId);
          const courseSnap = await getDoc(courseRef);

          if (courseSnap.exists()) {
            // Get videos for this course
            const videosRef = collection(db, "courseVideos");
            const vq = query(
              videosRef,
              where("courseId", "==", courseId),
              where("isActive", "==", true)
            );
            const videosSnapshot = await getDocs(vq);
            const videos: CourseVideo[] = videosSnapshot.docs
              .map((vdoc) => ({
                id: vdoc.id,
                ...vdoc.data(),
              } as CourseVideo))
              .sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              );

            studentCourses.push({
              id: enrollDoc.id,
              courseId: courseId,
              course: {
                id: courseId,
                ...courseSnap.data(),
              } as Course,
              enrollmentDate: enrollData.enrollmentDate || Date.now(),
              progress: enrollData.progress || 0,
              status: enrollData.status || "Active",
              videos: videos,
            });
          }
        } catch (courseErr) {
          console.warn(`Error fetching course ${courseId}:`, courseErr);
        }
      }

      setCourses(studentCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseExpanded = (courseId: string) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
    setSelectedVideoId(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/student/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/student/dashboard");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Mobile Navbar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md px-4 py-4 flex items-center justify-between md:hidden z-40">
        <h1 className="text-lg font-bold text-gray-800">My Courses</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white shadow-lg z-30 md:hidden p-4 space-y-2">
          <button
            onClick={handleBackToDashboard}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold flex items-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-8 md:py-6 md:px-6 mt-16 md:mt-0">
          <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBackToDashboard}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
          {courses.length}{" "}
          {courses.length === 1 ? "course" : "courses"} enrolled
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Courses Yet
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't enrolled in any courses yet.
          </p>
          <button
            onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((studentCourse) => (
            <div
              key={studentCourse.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Course Header */}
              <button
                onClick={() => toggleCourseExpanded(studentCourse.courseId)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div
                    className={`w-16 h-16 rounded-lg ${
                      studentCourse.course?.color || "bg-blue-500"
                    }`}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {studentCourse.course?.title || "Course"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {studentCourse.course?.instructor}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          studentCourse.status === "Active"
                            ? "bg-blue-100 text-blue-800"
                            : studentCourse.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {studentCourse.status}
                      </span>
                      <span className="text-xs text-gray-600">
                        {studentCourse.videos.length} lessons
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Progress</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${studentCourse.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {studentCourse.progress}%
                    </p>
                  </div>

                  <div className="text-gray-400">
                    {expandedCourseId === studentCourse.courseId ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </div>
                </div>
              </button>

              {/* Course Details */}
              {expandedCourseId === studentCourse.courseId && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {studentCourse.course?.description && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        About this Course
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {studentCourse.course.description}
                      </p>
                    </div>
                  )}

                  {/* Course Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Level</p>
                      <p className="font-semibold text-gray-900">
                        {studentCourse.course?.level || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {studentCourse.course?.duration || "Self-paced"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Enrolled Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          studentCourse.enrollmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Videos/Lessons */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Lessons ({studentCourse.videos.length})
                    </h4>

                    {studentCourse.videos.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                        <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-600">
                          No videos available yet for this course
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {studentCourse.videos.map((video) => (
                          <div
                            key={video.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer"
                            onClick={() => { setSelectedVideoId(video.id); setSelectedVideo(video); }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                  <Play size={20} className="text-blue-600 ml-1" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-semibold text-gray-900">
                                      {video.order}. {video.title}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {video.description}
                                    </p>
                                  </div>
                                  {selectedVideoId === video.id && (
                                    <div className="ml-4">
                                      <CheckCircle
                                        size={20}
                                        className="text-blue-600"
                                      />
                                    </div>
                                  )}
                                </div>
                                {video.duration && (
                                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                                    <Clock size={14} />
                                    {video.duration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideoId && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
            <div className="relative bg-black aspect-video">
              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedVideo.title}
              </h3>
              <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
              {selectedVideo.duration && (
                <p className="text-sm text-gray-600">
                  Duration: {selectedVideo.duration}
                </p>
              )}
              <button
                onClick={() => {
                  setSelectedVideoId(null);
                  setSelectedVideo(null);
                }}
                className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </main>
    </div>
  );
};
