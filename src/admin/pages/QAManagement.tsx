import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, X, Check, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  studentId: string;
  workshopId: string;
  status: 'open' | 'answered' | 'closed';
  replies: Reply[];
  createdAt: number;
}

interface Reply {
  instructorId: string;
  reply: string;
  createdAt: number;
}

export const QAManagement: React.FC = () => {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'answered' | 'closed'>('open');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [filterStatus]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // In a real scenario, you would fetch based on status
      // For now, we'll fetch all and filter client-side
      setQuestions([]);
    } catch (error) {
      setError('Error fetching questions');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !selectedQuestion) return;

    try {
      setSubmittingReply(true);
      await api.addReplyToQuestion(selectedQuestion.id, 'admin-id', replyText);
      setSuccess('Reply added successfully!');
      setReplyText('');
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      setError('Failed to add reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Questions & Answers</h1>
            <p className="text-gray-600 mt-2">Manage student questions and provide responses</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg my-6">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg my-6">{success}</div>}

          {/* Filter & Search */}
          <div className="my-6 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'open', 'answered', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="grid gap-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{question.question}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Student: {question.studentId} | Workshop: {question.workshopId}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      question.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      question.status === 'answered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Asked: {new Date(question.createdAt).toLocaleDateString()}
                  </p>

                  {question.replies.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {question.replies.map((reply, idx) => (
                        <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-green-800 mb-1">Instructor Reply:</p>
                          <p className="text-sm text-gray-700">{reply.reply}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedQuestion(question)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    {question.replies.length > 0 ? 'Add Another Reply' : 'Reply'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No questions found</p>
            </div>
          )}

          {/* Reply Modal */}
          {selectedQuestion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Reply to Question</h2>
                  <button onClick={() => setSelectedQuestion(null)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-semibold text-gray-800 mb-2">Question:</p>
                  <p className="text-gray-700">{selectedQuestion.question}</p>
                </div>

                {selectedQuestion.replies.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold text-gray-800 mb-3">Previous Replies:</p>
                    <div className="space-y-3">
                      {selectedQuestion.replies.map((reply, idx) => (
                        <div key={idx} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-green-800 mb-1">Instructor Reply:</p>
                          <p className="text-sm text-gray-700">{reply.reply}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="Type your response..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReplySubmit}
                    disabled={submittingReply || !replyText.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> {submittingReply ? 'Submitting...' : 'Submit Reply'}
                  </button>
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default QAManagement;
