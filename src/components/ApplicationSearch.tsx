import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ApplicationSearch: React.FC = () => {
    return (
        <section className="relative w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-40 -right-20 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-primary-dark/10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 sm:space-y-12 px-4">
                {/* Main Search Bar */}
                <div className="w-full max-w-3xl">
                    <Link
                        to="/programs"
                        className="flex items-center justify-between py-5 sm:py-7 px-6 sm:px-10 rounded-2xl sm:rounded-3xl 
                                   bg-white/80 backdrop-blur-xl border border-neutral-200 shadow-xl
                                   transition-all duration-300 ease-in-out
                                   hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40
                                   focus:outline-none focus:ring-4 focus:ring-primary/40 focus:ring-offset-2"
                        aria-label="Search for graduate programs"
                    >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <FaSearch className="text-2xl sm:text-3xl text-neutral-600 group-hover:text-primary transition-colors duration-300" />
                            <span className="text-base sm:text-xl font-medium text-neutral-700 group-hover:text-primary transition-colors duration-300">
                                Search for graduate programs
                            </span>
                        </div>
                        <span className="hidden sm:block text-sm text-neutral-500 italic">
                            Start your journey →
                        </span>
                    </Link>
                </div>

                {/* Enticing Text Section */}
                <div className="max-w-2xl px-2">
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 mb-3 sm:mb-4 leading-snug">
                        Explore Your <span className="text-primary">Future</span> 🎓
                    </h3>
                    <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                        Unlock doors to world-class graduate programs designed to match your{" "}
                        <span className="font-semibold text-primary">ambitions</span> and{" "}
                        <span className="font-semibold text-primary">career path</span>.  
                        Take the first step toward your next big opportunity.
                    </p>
                    <div className="mt-6 sm:mt-8">
                        <Link
                            to="/programs"
                            className="inline-block py-3 px-8 sm:px-10 rounded-full bg-gradient-to-r from-primary to-primary-dark 
                                       text-black font-semibold text-base sm:text-lg shadow-md hover:shadow-xl 
                                       transition-all duration-300 hover:scale-105"
                        >
                            Start Exploring
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ApplicationSearch;
