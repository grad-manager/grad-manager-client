/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await sendPasswordResetEmail(email);
      setMessage('Check your inbox for a password reset email!');
      // Optionally, navigate to the login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 5000);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setError('Failed to reset password. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-100 py-20">
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-primary p-12 animate-fade-in">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
        ></div>
        <div className="relative z-10 text-white text-left max-w-lg space-y-4">
          <h1 className="text-5xl font-extrabold leading-tight animate-slide-up">
            Take control of your future.
          </h1>
          <p className="text-xl animate-slide-up animation-delay-300">
            Reset your password to regain access and continue your application journey.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white animate-fade-in">
        <div className="w-full max-w-md p-10 space-y-6">
          <div className="text-center animate-slide-up">
            <h2 className="text-4xl font-extrabold text-secondary">Forgot Password</h2>
            <p className="mt-2 text-neutral-500">Enter your email to receive a reset link</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            {message && <p className="text-green-500 text-sm text-center mb-4">{message}</p>}

            <div>
              <label className="block text-secondary font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-neutral-500">
            <p>
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Back to Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;