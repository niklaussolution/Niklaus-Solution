import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, orderBy, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Search, Send, User, BookOpen, Clock, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'student' | 'admin';
  timestamp: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

export const QAManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all students who have enrolled workshops (potential chatters)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        const studentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        setStudents(studentList);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Subscribe to messages when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    const messagesRef = collection(db, 'students', selectedStudent.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedStudent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;

    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const messagesRef = collection(db, 'students', selectedStudent.id, 'messages');
      await addDoc(messagesRef, {
        text: messageToSend,
        sender: 'admin',
        timestamp: Date.now()
      });
      
      // Also update a "lastMessage" field in the student doc for the list view
      const studentDocRef = doc(db, 'students', selectedStudent.id);
      await updateDoc(studentDocRef, {
        lastMessage: messageToSend,
        lastMessageTime: Date.now(),
        hasUnread: false // Admin replied, so no unread for admin
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden">
        {/* Sidebar: Student List */}
        <div className={`w-full md:w-80 bg-white border-r flex flex-col transition-all ${selectedStudent ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="text-blue-600" />
              Student Chats
            </h2>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading chats...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No students found</div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-bold text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedStudent ? 'hidden md:flex' : 'flex'}`}>
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedStudent.name}</h3>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Active Student
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <MessageCircle size={48} className="mb-4 opacity-20" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                          msg.sender === 'admin'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.sender === 'admin' ? 'text-blue-100 font-medium' : 'text-gray-400 font-medium'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition shadow-lg shadow-blue-200"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="bg-blue-50 p-6 rounded-full mb-4">
                <MessageCircle size={64} className="text-blue-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Your Support Inbox</h3>
              <p className="max-w-xs text-center mt-2">
                Select a student from the sidebar to start a real-time chat and answer their questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
