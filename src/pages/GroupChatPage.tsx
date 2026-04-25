import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaArrowDown, FaUsers, FaArrowLeft, FaVideo, FaCamera, FaMicrophone, FaFileAlt, FaDownload, FaTimes } from 'react-icons/fa';
import axios from 'axios';

// Firestore
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL;

// --- NEW INTERFACES ---
interface FileData {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'voice' | 'document';
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  createdAt: Date;
  file?: FileData; // <-- NEW: Optional file data
}

interface Group {
  id: string;
  name: string;
  members?: string[];
}
// --- END NEW INTERFACES ---

// Helper to determine the type for rendering
const getFileType = (mimeType: string): 'image' | 'voice' | 'document' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'voice';
  return 'document';
};

const GroupChatPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser, userProfile, token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);

  // File/Media States
  const [fileToUpload, setFileToUpload] = useState<File | null>(null); // <-- NEW: File state
  const fileInputRef = useRef<HTMLInputElement>(null); // <-- NEW: Ref for file input

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrollAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
      setIsAtBottom(isScrollAtBottom);
    }
  };

  // --- NEW FILE HANDLERS ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Basic size limit check (e.g., 20MB)
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit.');
        event.target.value = ''; // Clear the input
        setFileToUpload(null);
        return;
      }
      setFileToUpload(file);
    }
  };

  const handleCancelFile = () => {
    setFileToUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the input value
    }
  };
  // --- END NEW FILE HANDLERS ---

  useEffect(() => {
    if (!groupId || !currentUser?.uid) {
      setLoading(false);
      setError('Authentication or group ID missing.');
      return;
    }

    const groupDocRef = doc(db, 'groups', groupId);

    const fetchDataAndListen = async () => {
      try {
        const groupResponse = await axios.get(`${API_URL}/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(groupResponse.data);
      } catch (err) {
        console.error('Failed to fetch group data:', err);
        setError('Failed to load group details.');
        setLoading(false);
        return;
      }

      const messagesRef = collection(groupDocRef, 'messages');
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const fetchedMessages: Message[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            fetchedMessages.push({
              id: doc.id,
              senderId: data.senderId,
              senderName: data.senderName,
              text: data.text,
              createdAt: data.createdAt?.toDate() || new Date(),
              file: data.file, // <-- NEW: Get file data
            });
          });
          setMessages(fetchedMessages);
          setLoading(false);
        },
        (err) => {
          console.error('Failed to listen to messages:', err);
          setError('Failed to load messages in real-time. Check permissions.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    };

    fetchDataAndListen();
  }, [groupId, currentUser, token]);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // --- UPDATED SEND MESSAGE HANDLER ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = newMessageText.trim();

    // Check if we have valid content (text OR a file)
    if ((messageText === '' && !fileToUpload) || !currentUser?.uid || !userProfile || !groupId) return;

    let fileData: FileData | undefined = undefined;
    let lastMessageText = messageText || ''; // Use text if available

    try {
      if (fileToUpload && token) {
        // 1. Upload File using the shared API route
        const formData = new FormData();
        formData.append('document', fileToUpload);
        formData.append('fileType', getFileType(fileToUpload.type));
        
        // Use the placeholder 'chat' for the application ID as handled in index.js
        const uploadResponse = await axios.post(`${API_URL}/applications/chat/documents`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const uploadedDoc = uploadResponse.data;
        fileData = {
          fileName: uploadedDoc.fileName,
          fileUrl: uploadedDoc.fileUrl,
          fileType: uploadedDoc.fileType,
        };

        // Update lastMessageText to reflect the file
        if (fileData.fileType === 'image') lastMessageText = messageText || 'Image';
        else if (fileData.fileType === 'voice') lastMessageText = messageText || 'Voice Note';
        else lastMessageText = messageText || `File: ${uploadedDoc.fileName}`;

        handleCancelFile(); // Clear file input after successful upload
      } else if (messageText === '') {
          // If no file and no text, prevent sending
          return;
      }

      // 2. Send Message to Firestore
      const groupDocRef = doc(db, 'groups', groupId);
      const messagesRef = collection(groupDocRef, 'messages');

      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        senderName: userProfile.firstName,
        text: messageText,
        createdAt: serverTimestamp(),
        // Only include file if it was uploaded
        ...(fileData && { file: fileData }), 
      });

      // 3. Update Last Message on Group Document
      await updateDoc(groupDocRef, {
        lastMessage: lastMessageText,
        updatedAt: serverTimestamp(),
      });

      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message/upload file:', err);
      setError('Failed to send message or upload file.');
    }
  };
  // --- END UPDATED SEND MESSAGE HANDLER ---

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#052b26]/80 z-50">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-white/80" />
      </div>
    );

  if (error) return <div className="text-center mt-24 text-red-500">{error}</div>;

  const groupName = group?.name || 'Group Chat';

  // --- NEW: Message Content Component ---
  const MessageContent: React.FC<{ msg: Message; isSender: boolean }> = ({ msg, isSender }) => {
    const textColor = isSender ? 'text-white' : 'text-slate-800';
    const linkColor = isSender ? 'text-white/80' : 'text-slate-600';
    const linkHoverColor = isSender ? 'text-white' : 'text-slate-800';

    const senderNameColor = isSender ? 'text-white/80' : 'text-[#075E54]';

    return (
        <div className='flex flex-col'>
            {msg.senderId !== currentUser?.uid && (
                <span className={`block text-xs font-bold ${senderNameColor} mb-1`}>
                    {msg.senderName || 'Unknown User'}
                </span>
            )}

            {msg.file && (
                <div className={`${msg.text ? 'mb-2' : ''}`}>
                    {msg.file.fileType === 'image' && (
                        // Image message
                        <img 
                            src={msg.file.fileUrl} 
                            alt={msg.file.fileName}
                            loading="lazy"
                            className="w-full max-h-64 object-cover rounded-xl mb-2 cursor-pointer transition-opacity hover:opacity-90"
                            onClick={() => window.open(msg.file!.fileUrl, '_blank')}
                        />
                    )}
                    {msg.file.fileType === 'voice' && (
                        // Voice note message
                        <div className="flex items-center space-x-3 bg-white/30 p-2 rounded-full">
                            <FaMicrophone size={20} className={textColor} />
                            <audio controls src={msg.file.fileUrl} className="w-full"></audio>
                        </div>
                    )}
                    {msg.file.fileType === 'document' && (
                        // Document message
                        <a
                            href={msg.file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center space-x-2 p-2 rounded-lg bg-white/30 font-medium transition-colors ${linkColor} hover:${linkHoverColor}`}
                        >
                            <FaFileAlt size={18} />
                            <span className="truncate max-w-[calc(100%-40px)]">{msg.file.fileName}</span>
                            <FaDownload size={12} className='ml-auto' />
                        </a>
                    )}
                </div>
            )}
            
            {/* Text content, shown below media or alone */}
            {msg.text && <p className={textColor}>{msg.text}</p>}
        </div>
    );
  };
  // --- END: Message Content Component ---


  return (
    <div className="min-h-screen w-full flex justify-center items-center py-16 px-4 mt-16 relative overflow-hidden bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366]">
      {/* Subtle texture overlay like ChatPage & CommunityPage */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white to-transparent" />

      <div className="relative z-10 w-full max-w-2xl mx-auto backdrop-blur-3xl bg-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 bg-white/5 border-b border-white/10 flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/community')}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <FaArrowLeft className="text-white text-xl" />
            </button>
            <FaUsers size={40} className="text-gray-300" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">{groupName}</h1>
          </div>
          <button
            onClick={() => navigate(`/group-call/${groupId}`)}
            className="bg-[#25D366] hover:bg-[#1dbf56] text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <FaVideo />
            <span className="hidden sm:inline">Join Call</span>
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.length > 0 ? (
            messages.map((msg) => {
                const isSender = msg.senderId === currentUser?.uid;
                return (
                    <div
                        key={msg.id}
                        className={`flex animate-message-enter ${
                            isSender ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`p-4 rounded-3xl max-w-[80%] md:max-w-[70%] text-sm md:text-base backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] ${
                                isSender
                                    ? 'bg-[#25D366]/90 text-white shadow-lg'
                                    : 'bg-white/70 text-slate-800 shadow-md'
                            }`}
                        >
                            <MessageContent msg={msg} isSender={isSender} />
                            <span
                                className={`block mt-1 text-[10px] opacity-70 ${
                                    isSender ? 'text-right text-white' : 'text-left text-slate-600'
                                }`}
                            >
                                {msg.createdAt.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                );
            })
          ) : (
            <div className="p-8 text-center text-white/80 animate-fade-in">
              <FaUsers size={64} className="mx-auto mb-4 opacity-70" />
              <p className="text-lg">Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom */}
        {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 p-3 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#1dbf56] transition-all duration-300 transform hover:scale-110 animate-bounce-faded"
            aria-label="Scroll to bottom"
          >
            <FaArrowDown />
          </button>
        )}
        
        {/* --- NEW: File Preview Area --- */}
        {fileToUpload && (
          <div className="p-3 md:p-4 bg-white/10 border-t border-white/10 flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-white/20 rounded-full">
                {fileToUpload.type.startsWith('image/') ? <FaCamera /> : fileToUpload.type.startsWith('audio/') ? <FaMicrophone /> : <FaFileAlt />}
              </span>
              <span className="truncate max-w-[200px]">{fileToUpload.name}</span>
            </div>
            <button onClick={handleCancelFile} className="p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Cancel file upload">
              <FaTimes />
            </button>
          </div>
        )}
        {/* --- END: File Preview Area --- */}


        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 md:p-6 bg-white/5 border-t border-white/10 flex space-x-3 items-center"
        >
          {/* File Input Button */}
          <label htmlFor="file-upload" className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 cursor-pointer">
            <FaFileAlt />
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" // Accept common file types
            />
          </label>

          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder={fileToUpload ? "Add a caption or send..." : "Type your message..."}
            className="flex-1 p-3 bg-white/70 rounded-full focus:outline-none focus:ring-2 focus:ring-[#25D366] placeholder-slate-500 text-slate-900 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!newMessageText.trim() && !fileToUpload}
            className="p-3 bg-[#25D366] hover:bg-[#1dbf56] text-white rounded-full transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChatPage;