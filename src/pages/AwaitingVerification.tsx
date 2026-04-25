// AwaitingVerification.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const AwaitingVerification: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'awaiting' | 'verified' | 'error'>('awaiting');
    const [isLoading, setIsLoading] = useState(false);

    // 1. Redirect if already verified or if no user is present
    useEffect(() => {
        if (!currentUser) {
            // User signed out or refreshed without active session
            navigate('/login'); 
            return;
        }

        if (currentUser.emailVerified) {
            setStatus('verified');
            // Allow a brief moment to show 'Verified' state before redirecting
            setTimeout(() => navigate('/'), 2000); 
        }
    }, [currentUser, navigate]);

    // 2. Function to manually refresh user token and check verification status
    const handleVerifyCheck = async () => {
        if (!currentUser) return;

        setIsLoading(true);
        setStatus('awaiting'); 

        try {
            // Force Firebase to refresh the ID token, which updates emailVerified status
            await currentUser.reload(); 

            if (currentUser.emailVerified) {
                setStatus('verified');
                // Success: Redirect to login/dashboard
                setTimeout(() => navigate('/login'), 1500); 
            } else {
                alert("Verification email not confirmed yet. Please check your spam folder!");
                setStatus('awaiting'); // Keep waiting screen visible
            }
        } catch (error) {
            console.error("Error reloading user status:", error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Dynamic Content based on Status ---
    let icon, title, message, actionButton;

    if (status === 'verified') {
        icon = <CheckCircle size={48} className="text-white" />;
        title = "Email Verified! 🎉";
        message = "Your account is active. Redirecting you to the login page...";
        actionButton = (
            <Link to="/login" className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md">
                Go to Login
            </Link>
        );
    } else {
        icon = <Mail size={48} className="text-white" />;
        title = "Check Your Inbox";
        message = "We've sent a verification link to your email. Click the link to complete your registration. Don't forget to check your spam folder!";
        actionButton = (
            <button
                onClick={handleVerifyCheck}
                disabled={isLoading}
                className={`mt-6 w-full py-3 text-white font-bold rounded-lg transition shadow-md ${
                    isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {isLoading ? (
                    <Clock size={20} className="inline mr-2 animate-spin" />
                ) : (
                    <CheckCircle size={20} className="inline mr-2" />
                )}
                I've Verified My Email (Check Status)
            </button>
        );
    }
    
    // Fallback if the user object is null but they somehow landed here
    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-lg text-gray-700">No active user found. Please <Link to="/login" className="text-blue-600 underline">login</Link>.</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
        >
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-200 text-center">
                <motion.div
                    initial={{ scale: 0.8, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className={`mx-auto w-20 h-20 flex items-center justify-center rounded-full ${status === 'verified' ? 'bg-green-500' : 'bg-blue-500'} mb-4`}
                >
                    {icon}
                </motion.div>

                <h1 className="text-3xl font-extrabold text-gray-800">{title}</h1>
                
                <p className="text-lg text-gray-600">
                    {message}
                </p>

                {status === 'awaiting' && (
                    <p className="text-sm text-gray-500">
                        Current User Email: <span className="font-semibold text-gray-700">{currentUser.email}</span>
                        <br/>
                        *(Verification status is currently **False**.)*
                    </p>
                )}

                {actionButton}

                <div className="pt-4 border-t border-gray-100">
                    <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 transition">
                        Wait, I need to log in manually →
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default AwaitingVerification;