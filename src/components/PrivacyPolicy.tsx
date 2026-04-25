// src/components/PrivacyPolicy.tsx

import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 mt-12 p-4 md:p-8 lg:p-12 text-gray-900 dark:text-gray-100">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight flex items-center gap-4">
          <FaShieldAlt className="text-5xl" />
          Privacy Policy
        </h1>
      </header>
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            1. Introduction
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Welcome to Grad Manager. We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines the types of information we collect, how we use it, and the steps we take to safeguard your data. This policy applies to all information collected through our website and any related services, sales, marketing, or events.
          </p>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            By using Grad Manager, you agree to the collection and use of information in accordance with this policy. If there are any terms in this privacy policy that you do not agree with, please discontinue use of our services immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            2. Information We Collect
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise contact us. The personal information we collect depends on the context of your interactions with us and the website, the choices you make, and the features you use.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Account Data:</strong> When you create an account, we collect your name and email address. You may also choose to provide a profile picture and other personal details to enhance your profile.</li>
            <li><strong>Application Data:</strong> We collect and store all information you manually input into your dashboard to track your graduate school applications. This includes, but is not limited to: university names, department, deadlines, required documents, funding information, and application status.</li>
            <li><strong>Community and Communication Data:</strong> When you use our community features, such as forums or direct messaging, we collect the content of your posts and messages. We do not monitor private conversations but may store this data to facilitate communication.</li>
            <li><strong>Usage and Technical Data:</strong> Our servers automatically collect certain information when you access or use the website. This includes your IP address, browser and device characteristics, operating system, language preferences, referring URLs, and information about how you interact with our service (e.g., pages viewed, time spent on pages, and click data). This data is primarily for analytics and security purposes.</li>
            <li><strong>Cookies and Tracking Technologies:</strong> We may use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies is set out in our separate Cookie Policy (if applicable).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            3. How We Use Your Information
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            We use personal information collected via our website for a variety of business purposes, described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. The purposes for which we use your information include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-4">
            <li><strong>To Facilitate Account Creation and Log-In:</strong> We use the information you provide to set up and manage your account.</li>
            <li><strong>To Manage User Accounts:</strong> We may use your information for the purposes of managing your account and keeping it in working order.</li>
            <li><strong>To Deliver and Improve Our Services:</strong> We use your application data to provide you with the core functionality of our service, such as tracking deadlines and organizing your applications. We also use anonymized and aggregated data to understand how our users interact with our features and to develop new tools.</li>
            <li><strong>To Send Administrative Information:</strong> We may use your personal information to send you product, service, and new feature information and/or information about changes to our terms, conditions, and policies.</li>
            <li><strong>To Protect Our Services:</strong> We may use your information as part of our efforts to keep our website safe and secure (e.g., for fraud monitoring and prevention).</li>
            <li><strong>To Respond to User Inquiries:</strong> We use the information you provide to respond to your inquiries and solve any potential issues you might have with the use of our services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            4. Data Sharing and Disclosure
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We will not sell, rent, or trade your personal information to third parties. We may disclose your information in the following situations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-4">
            <li><strong>Third-Party Service Providers:</strong> We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. Examples include data hosting, data analysis, email delivery, and customer service.</li>
            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            5. Your Data Protection Rights
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Depending on your location, you may have the following data protection rights:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-4">
            <li><strong>Right to Access:</strong> You have the right to request a copy of the personal information we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal information, under certain conditions.</li>
            <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal information, under certain conditions.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            To exercise any of these rights, please contact us at the address provided below.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            6. Security of Your Information
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
            7. Changes to This Policy
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Revised" date and will be effective as soon as it is accessible. If we make material changes to this policy, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            <em>Revised: August 15, 2025</em>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;