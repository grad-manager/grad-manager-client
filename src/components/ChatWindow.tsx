// src/components/ChatWindow.tsx
import ChatComponent from './ChatComponent';

const ChatWindow = () => {
    // This could be a static user ID for testing or dynamically fetched from a user list
    const recipientId = "some-static-recipient-id"; 

    return (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col">
            <div className="bg-blue-500 text-white p-3 rounded-t-lg">
                <h2 className="text-lg font-bold">Chat with a Mentor</h2>
            </div>
            <div className="flex-grow overflow-auto">
                <ChatComponent recipientId={recipientId} />
            </div>
        </div>
    );
};

export default ChatWindow;