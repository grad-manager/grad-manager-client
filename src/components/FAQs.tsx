// src/components/FAQs.tsx

import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is Grad Manager?",
    answer: "Grad Manager is an all-in-one platform designed to help students track and manage their graduate school applications. Our tools allow you to organize deadlines, search for programs, connect with mentors, and collaborate with peers.",
  },
  {
    question: "How do I add a new program to my dashboard?",
    answer: "You can add new programs from the 'Browse Programs' page. Simply use the search and filter options to find a program you like, and then click the 'Add to Dashboard' button on the program's card. It will be added to your dashboard with an 'Interested' status.",
  },
  {
    question: "Is my personal data secure on Grad Manager?",
    answer: "Yes, we take data security very seriously. We use secure, industry-standard practices to protect your information, including data encryption and secure authentication methods. For more details, please refer to our Privacy Policy.",
  },
  {
    question: "Can I connect with other students and mentors?",
    answer: "Yes, our platform includes community features that allow you to connect with other users. You can join group chats, participate in community forums, and request to connect with mentors who can offer guidance and support.",
  },
  {
    question: "How do I reset my password?",
    answer: "If you have forgotten your password, you can use the 'Forgot Password' link on the login page. You will be prompted to enter your email address, and we will send you a link to reset your password.",
  },
  {
    question: "What is the difference between 'Interested' and 'Applied' status?",
    answer: "The status helps you organize your application pipeline. 'Interested' means you are considering the program. 'Applied' is for programs where you have submitted your application. You can easily update the status of any program from your dashboard.",
  },
  {
    question: "Is Grad Manager free to use?",
    answer: "Grad Manager offers a free tier with core features to help you get started. We may introduce premium features in the future, but our main tools for managing your applications will always be accessible.",
  },
];

const FAQsPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 mt-12 p-4 md:p-8 lg:p-12 text-gray-900 dark:text-gray-100">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-4">
          <FaQuestionCircle className="text-5xl" />
          Frequently Asked Questions
        </h1>
      </header>
      
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => handleToggle(index)}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {faq.question}
              </h2>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
            {openIndex === index && (
              <p className="mt-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed animate-fade-in">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FAQsPage;