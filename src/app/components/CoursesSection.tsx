import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Star, Users, Clock, Award, ChevronRight } from "lucide-react";
import { db } from "../../admin/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  price: number;
  capacity: number;
  enrolled: number;
  color: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface CoursesSectionProps {
  onOpenContactForm?: () => void;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-blue-100 text-blue-800",
  Advanced: "bg-purple-100 text-purple-800",
};

export function CoursesSection({ onOpenContactForm }: CoursesSectionProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("isActive", "==", true));
      const snapshot = await getDocs(q);
      const coursesData: Course[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      // Sort by featured first, then by title
      coursesData.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) {
          return b.isFeatured ? 1 : -1;
        }
        return a.title.localeCompare(b.title);
      });
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelFilter = (level: string) => {
    setSelectedLevel(level);
    if (level === "all") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter((c) => c.level === level));
    }
  };

  const handleEnroll = (courseId: string) => {
    navigate("/student/login", { state: { courseId, isEnrollment: true } });
  };

  if (loading) {
    return (
      <section id="courses" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section id="courses" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Courses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn from industry experts with our structured courses covering all skill levels
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => handleLevelFilter("all")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedLevel === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
            }`}
          >
            All Levels
          </button>
          <button
            onClick={() => handleLevelFilter("Beginner")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedLevel === "Beginner"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-green-600"
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => handleLevelFilter("Intermediate")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedLevel === "Intermediate"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => handleLevelFilter("Advanced")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedLevel === "Advanced"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-purple-600"
            }`}
          >
            Advanced
          </button>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
            >
              {/* Header with Color */}
              <div className={`h-32 ${course.color} relative p-6 text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-sm opacity-90">by {course.instructor}</p>
                  </div>
                  {course.isFeatured && (
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>

                {/* Tags */}
                <div className="flex gap-2">
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      levelColors[course.level] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.level}
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                    {course.duration}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <Clock size={18} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-xs text-gray-600">Self-Paced</p>
                  </div>
                  <div className="text-center">
                    <Users size={18} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-xs text-gray-600">
                      {course.enrolled}/{course.capacity} Enrolled
                    </p>
                  </div>
                  <div className="text-center">
                    <Award size={18} className="mx-auto text-blue-600 mb-1" />
                    <p className="text-xs text-gray-600">Certificate</p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">Course Fee</p>
                  <p className="text-2xl font-bold text-blue-600">₹{course.price}</p>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={course.enrolled >= course.capacity}
                  className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                    course.enrolled >= course.capacity
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {course.enrolled >= course.capacity ? "Course Full" : "Enroll Now"}
                  {course.enrolled < course.capacity && <ChevronRight size={18} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses available for this level.</p>
          </div>
        )}
      </div>
    </section>
  );
}
