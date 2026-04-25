// src/components/ChatIcon.tsx
import { useState } from 'react';
import { FaComment } from 'react-icons/fa';
import ChatWindow from './ChatWindow';

const ChatIcon = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button 
                onClick={toggleChat} 
                className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg"
            >
                <FaComment size={24} />
            </button>
            {isOpen && <ChatWindow />}
        </>
    );
};

export default ChatIcon;