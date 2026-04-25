import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'user_cookie_consent';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the consent cookie exists.
        const consent = Cookies.get(COOKIE_NAME);
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        // Set a cookie that expires in 365 days.
        Cookies.set(COOKIE_NAME, 'accepted', { expires: 365 });
        setIsVisible(false);
        // You can add logic here to enable analytics or other tracking scripts.
    };

    const handleDecline = () => {
        // Set a cookie to remember the user's choice.
        Cookies.set(COOKIE_NAME, 'declined', { expires: 365 });
        setIsVisible(false);
        // You can add logic here to disable any tracking scripts.
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6 bg-secondary text-white shadow-xl transform transition-transform duration-300 animate-slide-up">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                <p className="text-sm text-center sm:text-left mb-4 sm:mb-0">
                    We use cookies to improve your experience. By using our site, you agree to our <a href="/privacy-policy" className="underline font-bold">Privacy Policy</a>.
                </p>
                <div className="flex space-x-4">
                    <button
                        onClick={handleDecline}
                        className="py-2 px-4 rounded-full text-sm font-semibold text-gray-200 bg-tertiary hover:bg-tertiary-dark transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="py-2 px-4 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;