// client/src/components/CallButton.tsx
import { FaPhoneAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CallButton = () => {
  const navigate = useNavigate();

  const handleCall = () => {
    // Navigate to the video call page with a specific channel ID
    navigate('/group-call/home-channel-id'); 
  };

  return (
    <button 
      onClick={handleCall}
      className="fixed bottom-20 right-4 p-4 bg-green-500 text-white rounded-full shadow-lg"
    >
      <FaPhoneAlt size={24} />
    </button>
  );
};
export default CallButton;