/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaArrowDown, FaUserCircle, FaArrowLeft, FaExternalLinkAlt, FaTimes, FaCamera, FaMicrophone, FaFileAlt, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { IoIosChatbubbles } from 'react-icons/io';

// ⭐️ NEW: Import the custom hook ⭐️
import { usePushNotifications } from '../hooks/usePushNotifications';

// Firestore imports
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL;

interface FileData {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'voice' | 'document';
  // Add more if needed, e.g., duration for voice notes
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  file?: FileData; // <-- NEW: Optional file data
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  bio?: string;
  email?: string;
}

// Helper to determine the type for rendering
const getFileType = (mimeType: string): 'image' | 'voice' | 'document' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'voice';
  return 'document';
};

const ChatPage: React.FC = () => {
  const { recipientId } = useParams<{ recipientId: string }>();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [chatDocReady, setChatDocReady] = useState(false);

  // File/Media States
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for primary profile modal visibility
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // State for full image modal visibility
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ⭐️ IMPLEMENT PUSH SUBSCRIPTION HOOK ⭐️
  // This efficiently handles the push notification registration lifecycle.
  usePushNotifications(token);
  // ⭐️ END PUSH SUBSCRIPTION HOOK ⭐️

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

  // Handlers for Profile Modal
  const handleViewProfile = () => {
    if (recipient) {
      setIsProfileModalOpen(true);
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsImageModalOpen(false); // Close image modal too, just in case
  };

  // Handlers for Image Modal
  const handleOpenImageModal = () => {
    if (recipient?.photoURL) {
      setIsImageModalOpen(true);
    }
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
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

  // Create chat document if not exists
  useEffect(() => {
    if (!currentUser?.uid || !recipientId) return;

    const chatId = [currentUser.uid, recipientId].sort().join('_');
    const chatDocRef = doc(db, 'chats', chatId);

    const createChatDocument = async () => {
      try {
        await setDoc(
          chatDocRef,
          {
            members: [currentUser.uid, recipientId].sort(),
            lastMessage: '',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setChatDocReady(true);
      } catch (err) {
        console.error('Failed to create chat document:', err);
        setError('Failed to initialize chat.');
      }
    };

    createChatDocument();
  }, [currentUser, recipientId]);

  // Fetch chat data + listen for messages
  useEffect(() => {
    if (!currentUser?.uid || !recipientId || !token || !chatDocReady) {
      if (!chatDocReady) {
        setLoading(true);
        return;
      }
      setLoading(false);
      setError('Authentication, token, or recipient ID missing.');
      return;
    }

    const chatId = [currentUser.uid, recipientId].sort().join('_');

    const fetchChatData = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/users/${recipientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipient(userResponse.data);
      } catch (err) {
        console.error('Failed to fetch chat data:', err);
        setError('Failed to load chat data.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    const messagesRef = collection(db, 'chats', chatId, 'messages');
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
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            file: data.file, // <-- NEW: Get file data
          });
        });
        setMessages(fetchedMessages);
      },
      (err) => {
        console.error('Failed to listen to messages:', err);
        setError('Failed to load messages in real-time. Check permissions.');
      }
    );

    return () => unsubscribe();
  }, [currentUser, recipientId, token, chatDocReady]);

  // Update lastRead
  useEffect(() => {
    if (!currentUser?.uid || !recipientId) return;

    const chatId = [currentUser.uid, recipientId].sort().join('_');
    const chatDocRef = doc(db, 'chats', chatId);

    const updateLastRead = async () => {
      try {
        await updateDoc(chatDocRef, {
          [`lastRead.${currentUser.uid}`]: serverTimestamp(),
        });
      } catch (error) {
        console.error('Failed to update last read timestamp:', error);
      }
    };

    updateLastRead();
  }, [currentUser, recipientId]);

  // Scroll to bottom when at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);


  // --- UPDATED SEND MESSAGE HANDLER (with Push Notify) ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = newMessageText.trim();

    // Check if we have valid content (text OR a file)
    if ((messageText === '' && !fileToUpload) || !currentUser?.uid || !recipientId) return;

    let fileData: FileData | undefined = undefined;
    let lastMessageText = messageText || ''; // Use text if available

    try {
      if (fileToUpload && token) {
        // 1. Upload File
        const formData = new FormData();
        formData.append('document', fileToUpload);
        formData.append('fileType', getFileType(fileToUpload.type));
        
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
          return;
      }
      
      // 2. Send Message to Firestore
      const chatId = [currentUser.uid, recipientId].sort().join('_');
      const chatDocRef = doc(db, 'chats', chatId);

      await addDoc(collection(chatDocRef, 'messages'), {
        senderId: currentUser.uid,
        text: messageText,
        createdAt: serverTimestamp(),
        // Only include file if it was uploaded
        ...(fileData && { file: fileData }), 
      });

      // 3. Update Last Message on Chat Document
      await updateDoc(chatDocRef, {
        lastMessage: lastMessageText,
        updatedAt: serverTimestamp(),
      });

      setNewMessageText('');

      // ⭐️ PUSH NOTIFICATION TRIGGER ⭐️
      if (token && recipientId) {
        try {
          let notificationBody = messageText;
          if (fileToUpload) {
            const fileTypeName = fileData?.fileType === 'image' ? 'Image' : 
                                       fileData?.fileType === 'voice' ? 'Voice Note' : 
                                       'File';
            notificationBody = `[${fileTypeName}] ${messageText || ''}`.trim();
          }

          await axios.post(`${API_URL}/push/notify`, 
            {
              targetUserId: recipientId, 
              title: `${currentUser.displayName || currentUser.email} (New Message)`,
              body: notificationBody || lastMessageText, 
              data: {
                type: 'new_chat_message',
                senderId: currentUser.uid,
                chatId: chatId,
              }
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (notifyError) {
          console.warn('⚠️ Failed to send push notification to recipient:', notifyError);
        }
      }
      // ⭐️ END PUSH NOTIFICATION TRIGGER ⭐️

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

  const chatTitle = recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Chat';

  // Component to render different message types
  const MessageContent: React.FC<{ msg: Message; isSender: boolean }> = ({ msg, isSender }) => {
    const textColor = isSender ? 'text-white' : 'text-slate-800';
    const linkColor = isSender ? 'text-white/80' : 'text-slate-600';
    const linkHoverColor = isSender ? 'text-white' : 'text-slate-800';

    if (msg.file) {
      if (msg.file.fileType === 'image') {
        // Image message
        return (
          <>
            <img 
              src={msg.file.fileUrl} 
              alt={msg.file.fileName} 
              className="w-full max-h-64 object-cover rounded-xl mb-2 cursor-pointer transition-opacity hover:opacity-90"
              onClick={() => window.open(msg.file!.fileUrl, '_blank')}
              loading="lazy"
            />
            {msg.text && <p className={textColor}>{msg.text}</p>}
          </>
        );
      } else if (msg.file.fileType === 'voice') {
        // Voice note message
        return (
          <div className="flex items-center space-x-3">
            <FaMicrophone size={20} className={textColor} />
            <audio controls src={msg.file.fileUrl} className="w-full"></audio>
            {msg.text && <p className={`mt-2 ${textColor}`}>{msg.text}</p>}
          </div>
        );
      } else {
        // Document message (fileType is 'document')
        return (
          <div className="space-y-2">
            <a
              href={msg.file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-2 font-medium transition-colors ${linkColor} hover:${linkHoverColor}`}
            >
              <FaFileAlt size={18} />
              <span className="truncate max-w-[calc(100%-40px)]">{msg.file.fileName}</span>
              <FaDownload size={12} />
            </a>
            {msg.text && <p className={`mt-1 ${textColor}`}>{msg.text}</p>}
          </div>
        );
      }
    }
    
    // Default text message
    return <p className={textColor}>{msg.text}</p>;
  };


  return (
    <div className="min-h-screen w-full flex justify-center items-center py-16 px-4 mt-16 relative overflow-hidden bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366]">
      {/* Subtle texture overlay like CommunityPage */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white to-transparent" />

      <div className="relative z-10 w-full max-w-2xl mx-auto backdrop-blur-3xl bg-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 bg-white/5 border-b border-white/10 flex items-center space-x-4">
          <button
            onClick={() => navigate('/community')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors duration-200"
          >
            <FaArrowLeft className="text-white text-xl" />
          </button>
          
          {/* Avatar/Image with Profile Modal Toggle */}
          <button onClick={handleViewProfile} className="focus:outline-none" aria-label={`View ${chatTitle}'s profile`}>
            {recipient?.photoURL ? (
              <img
                src={recipient.photoURL}
                alt={`${recipient.firstName}`}
                loading="lazy"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#25D366] hover:opacity-80 transition-opacity cursor-pointer"
              />
            ) : (
              <FaUserCircle size={48} className="text-gray-300 hover:text-gray-200 transition-colors cursor-pointer" />
            )}
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">{chatTitle}</h1>
          
          {/* Dedicated View Profile Button */}
          <button
            onClick={handleViewProfile}
            className="ml-auto flex items-center px-3 py-1 text-sm font-medium text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-200 focus:ring-2 focus:ring-[#25D366]"
          >
            Profile <FaExternalLinkAlt className="ml-2 w-3 h-3" />
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
                    <MessageContent msg={msg} isSender={isSender} /> {/* RENDER COMPONENT */}
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
              <IoIosChatbubbles size={64} className="mx-auto mb-4 opacity-70" />
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
            // Disable input if a file is selected and no text is provided, but allow if text is present
            disabled={!fileToUpload && loading}
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
      
      {/* 1. Profile Modal (unchanged) */}
      {isProfileModalOpen && recipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in-slow" onClick={handleCloseProfileModal}>
          <div 
            className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-sm m-4 transform transition-transform duration-300 animate-slide-up-faded" 
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-[#075E54]">Profile View</h2>
              <button onClick={handleCloseProfileModal} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Close profile view">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="text-center mb-6">
              {recipient.photoURL ? (
                <button onClick={handleOpenImageModal} className="focus:outline-none relative group" aria-label="View full size profile picture">
                  <img
                    src={recipient.photoURL}
                    alt={`${recipient.firstName} profile`}
                    loading="lazy"
                    className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-[#25D366] shadow-md cursor-pointer transition-opacity group-hover:opacity-80"
                  />
                  <span className="absolute inset-0 w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold">
                    View Full
                  </span>
                </button>
              ) : (
                <FaUserCircle size={96} className="mx-auto text-gray-400" />
              )}
              <h3 className="mt-4 text-xl font-semibold text-slate-800">{chatTitle}</h3>
            </div>

            <div className="space-y-3 text-slate-600">
              {recipient.email && (
                <p>
                  <strong className="font-medium text-slate-800">Email:</strong> {recipient.email}
                </p>
              )}
              {recipient.bio && (
                <div>
                  <strong className="font-medium text-slate-800 block mb-1">Bio:</strong>
                  <p className="text-sm italic p-2 bg-gray-50 rounded-lg">{recipient.bio}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 pt-2">User ID: {recipientId}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Image Modal (Nested - unchanged) */}
      {isImageModalOpen && recipient?.photoURL && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 animate-fade-in-slow" onClick={handleCloseImageModal}>
          <div 
            className="relative max-w-lg max-h-[90vh] mx-4 p-4 transform transition-transform duration-300 animate-zoom-in" 
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image wrapper
          >
            <img
              src={recipient.photoURL}
              alt={`${recipient.firstName} full size profile`}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-xl"
              loading="lazy"
            />
            <button 
              onClick={handleCloseImageModal} 
              className="absolute top-2 right-2 p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors backdrop-blur-sm"
              aria-label="Close full image view"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;