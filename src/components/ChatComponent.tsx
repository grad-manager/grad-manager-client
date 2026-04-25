// src/components/ChatComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane } from 'react-icons/fa';
// Removed unused import: import axios from 'axios';

// Import Firestore functions and types
import { db } from '../firebase'; // Adjust the path as needed
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    type DocumentData
} from 'firebase/firestore';

// Removed unused variable: const API_URL = import.meta.env.VITE_API_URL;

interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: Date;
}

const ChatComponent: React.FC<{ recipientId: string }> = ({ recipientId }) => {
    // Removed unused variable: const { currentUser, token } = useAuth();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    const chatId = [currentUser?.uid, recipientId].sort().join('_');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Use a single useEffect for real-time messages
    useEffect(() => {
        if (!currentUser?.uid || !recipientId) {
            setLoading(false);
            return;
        }

        // Create a Firestore query to get messages ordered by creation time
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        // Set up the real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages: Message[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as DocumentData;
                fetchedMessages.push({
                    id: doc.id,
                    senderId: data.senderId,
                    text: data.text,
                    // Convert Firestore Timestamp to JavaScript Date
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            });
            setMessages(fetchedMessages);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching real-time messages:", error);
            setLoading(false);
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [currentUser, recipientId, chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser?.uid) return;

        // Use addDoc to add a new message to Firestore
        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                senderId: currentUser.uid,
                text: newMessage,
                createdAt: serverTimestamp(),
            });

            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading messages...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20">Start a new chat</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg ${
                                    msg.senderId === currentUser?.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="ml-2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    disabled={!newMessage.trim()}
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default ChatComponent;