import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Plus, Edit, Trash2, Search, X, AlertCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  workshopId: string;
  description: string;
  questions: any[];
  passingScore: number;
  order: number;
  isActive: boolean;
  createdAt: number;
}

export const QuizManagement: React.FC = () => {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    workshopId: '',
    description: '',
    questions: [] as any[],
    passingScore: 70,
    order: 0,
    isActive: true,
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: 0,
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const result = await api.getQuizzes();
      if (result.data) {
        setQuizzes(result.data);
      }
    } catch (error) {
      setError('Error fetching quizzes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.workshopId.trim()) {
      setError('Workshop is required');
      return;
    }
    if (formData.questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    try {
      if (editingId) {
        const result = await api.updateQuiz(editingId, formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Quiz updated successfully!');
      } else {
        const result = await api.createQuiz(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccess('Quiz created successfully!');
      }
      resetForm();
      fetchQuizzes();
    } catch (error: any) {
      setError('Error saving quiz');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const result = await api.deleteQuiz(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      setError('Error deleting quiz');
      console.error(error);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
      setError('Please fill all question fields');
      return;
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
    setNewQuestion({ question: '', options: ['', '', '', ''], correctOption: 0 });
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      workshopId: '',
      description: '',
      questions: [],
      passingScore: 70,
      order: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
              <p className="text-gray-600 mt-2">Create and manage course quizzes</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} /> Create Quiz
            </button>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">{success}</div>}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Quiz List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span>📝 {quiz.questions.length} questions</span>
                        <span>⭐ Pass: {quiz.passingScore}%</span>
                        <span>{quiz.isActive ? '✓ Active' : '✗ Inactive'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData(quiz as any);
                          setEditingId(quiz.id);
                          setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                  <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit Quiz' : 'Create Quiz'}</h2>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Workshop ID *</label>
                    <input
                      type="text"
                      value={formData.workshopId}
                      onChange={(e) => setFormData({ ...formData, workshopId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.passingScore}
                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>

                  {/* Questions */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Questions ({formData.questions.length})</h3>

                    {formData.questions.map((q, idx) => (
                      <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-gray-800">Q{idx + 1}: {q.question}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {q.options.map((opt, i) => (
                            <p key={i} className={`text-sm ${i === q.correctOption ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                              {String.fromCharCode(65 + i)}) {opt} {i === q.correctOption && '✓'}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-bold text-gray-800 mb-3">Add New Question</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Question text"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        {newQuestion.options.map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <span className="font-bold text-gray-700 w-6">{String.fromCharCode(65 + i)})</span>
                            <input
                              type="text"
                              placeholder={`Option ${i + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const opts = [...newQuestion.options];
                                opts[i] = e.target.value;
                                setNewQuestion({ ...newQuestion, options: opts });
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <select
                              value={newQuestion.correctOption === i ? 'correct' : 'incorrect'}
                              onChange={(e) => {
                                if (e.target.value === 'correct') {
                                  setNewQuestion({ ...newQuestion, correctOption: i });
                                }
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="incorrect">Option</option>
                              <option value="correct">Correct</option>
                            </select>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                    >
                      {editingId ? 'Update Quiz' : 'Create Quiz'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg"
                    >
                      Cancel
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

export default QuizManagement;
