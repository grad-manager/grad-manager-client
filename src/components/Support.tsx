// src/components/Support.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset, FaQuestionCircle, FaEnvelope, FaUsers } from 'react-icons/fa';

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 mt-12 p-4 md:p-8 lg:p-12 text-gray-900 dark:text-gray-100">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-4">
          <FaHeadset className="text-5xl" />
          Support Center
        </h1>
      </header>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* FAQs Section */}
        <section className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <FaQuestionCircle className="text-3xl text-blue-500 dark:text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions (FAQs)
            </h2>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Before reaching out, please check our comprehensive list of frequently asked questions. You might find an immediate answer to your query about features, technical issues, or account management.
          </p>
          <Link to="/faqs" className="inline-block">
            <button className="w-full md:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
              Visit the FAQs Page
            </button>
          </Link>
        </section>

        {/* Contact Support Section */}
        <section className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <FaEnvelope className="text-3xl text-blue-500 dark:text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Contact Our Support Team
            </h2>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            If you can't find the answer in our FAQs, our support team is ready to help. Please send us a detailed message, and we'll get back to you as soon as possible.
          </p>
          <a href="mailto:gradmanager@futuregrin.com" className="inline-block">
            <button className="w-full md:w-auto bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-full shadow-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1">
              Send an Email
            </button>
          </a>
        </section>

        {/* Community Section */}
        <section className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <FaUsers className="text-3xl text-blue-500 dark:text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Community Forums
            </h2>
          </div>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Connect with other students and mentors in our community forums. You can ask questions, share tips, and find solutions from a network of your peers.
          </p>
          <Link to="/community" className="inline-block">
            <button className="w-full md:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
              Join the Community
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;