/* eslint-disable no-irregular-whitespace */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaKaaba,
  FaRegClock,
  FaRocket,
  FaSearch,
    FaUsers, // Added FaUsers for the Coming Soon section
} from 'react-icons/fa';

// --- IMPORT DATA FROM homePageData.ts ---
import { platformFeatures } from '../data/homePageData';
// Note: The original 'howItWorksSteps' from FeaturesPage was simple, 
// but since the prompt also included a 'howItWorksSteps' array (even if unused in the data file provided), 
// I'll keep the existing structure and simply import 'platformFeatures' here.
// Since you provided a custom 'howItWorksSteps' array directly in FeaturesPage.jsx, 
// I will keep using that one for the "How It Works" section to maintain the original structure.

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
    hidden: { y: 24, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

// --- NOTE: The `howItWorksSteps` array below is kept from the original file 
// as it was structured differently from the main features. ---
const localHowItWorksSteps = [
    {
        step: 1,
        title: 'Create Your Account',
        description:
            'Sign up in minutes to create your personalized Grad Manager dashboard.',
        icon: <FaRocket />, // Assuming FaRocket is imported from the original file (which it is)
    },
    {
        step: 2,
        title: 'Add Applications',
        description:
            'Easily add graduate programs and scholarships you are interested in. Fill in key details like deadlines and requirements.',
        icon: <FaRegClock />,
    },
    {
        step: 3,
        title: 'Track Your Progress',
        description:
            'Use our visual kanban board to move applications through different stages. Add notes, documents, and reminders along the way.',
        icon: <FaKaaba />,
    },
    {
        step: 4,
        title: 'Succeed & Celebrate!',
        description:
            "Stay on top of every deadline and requirement. When the acceptances roll in, you'll be ready to make an informed decision.",
        icon: <FaSearch />,
    },
];
// You'll need to ensure FaRocket, FaRegClock, FaKaaba, FaSearch are imported from 'react-icons/fa' 
// in the final consolidated file. (They are included in the user's initial imports).


export default function FeaturesPage() {
    const { currentUser } = useAuth();

    return (
        <div className="bg-neutral-50 min-h-screen mt-8">
            {/* Hero Section */}
            <section className="relative py-24 sm:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 z-0 animate-gradient-flow"></div>
                <div className="relative container mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-secondary text-transparent bg-clip-text animate-text"
                    >
                        Unlock Your Graduate School Dreams with Grad Manager
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-6 text-lg max-w-3xl mx-auto text-neutral-600"
                    >
                        Discover the features that will revolutionize your application
                        process, keeping you organized, informed, and confident every step
                        of the way.
                    </motion.p>
                </div>
            </section>

            {/* Features */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-50 via-white to-pink-50 z-0 animate-gradient-flow"></div>
                <div className="relative container mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-12">
                        Explore Our Powerful Features
                    </h2>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={container}
                        className="grid grid-cols-1 md:grid-cols-3 gap-10"
                    >
                        {/* --- MAPPING NEW DATA --- */}
                        {platformFeatures.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="glass-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                            >
                                <div className="relative">
                                    <img
                                        // Using the fullImage for a richer card image, but could use `src`
                                        src={feature.fullImage}
                                        alt={feature.title}
                                        className="w-full h-56 object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-4 left-4 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-md">
                                        {/* Using the imported icon from the data file */}
                                        {feature.icon}
                                    </div>
                                </div>
                                <div className="p-6 text-left">
                                    <h3 className="text-xl font-semibold text-blue-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    {/* Using the short `desc` property for the overview card */}
                                    <p className="text-neutral-600">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works (Using local data) */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-100 z-0 animate-gradient-flow"></div>
                <div className="relative container mx-auto px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-12">
                        How It Works
                    </h2>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        variants={container}
                        className="grid grid-cols-1 md:grid-cols-4 gap-10"
                    >
                        {localHowItWorksSteps.map((step, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                whileHover={{ scale: 1.05 }}
                                className="glass-card p-6 rounded-xl shadow hover:shadow-lg transition"
                            >
                                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-neutral-600">{step.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- Community Stats (Coming Soon) --- */}
            <section className="relative py-20 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-white overflow-hidden">
                <div className="absolute inset-0 bg-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
                <div className="relative container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl mx-auto p-8 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/30 shadow-2xl"
                    >
                        <FaUsers className="mx-auto text-6xl text-white drop-shadow-md mb-4" />
                        <h3 className="text-4xl font-extrabold mb-2 drop-shadow-lg">
                            Community & Mentorship Stats
                        </h3>
                        <p className="text-lg opacity-90 font-semibold">
                            This feature is <strong>Coming Soon</strong>! Prepare to connect with hundreds of mentors and fellow applicants, driving your success rate to the highest level.
                        </p>
                        <p className="mt-4 text-sm opacity-80 italic">
                            Sign up today to be the first to know when the full community features launch.
                        </p>
                    </motion.div>
                </div>
            </section>
            {/* ------------------------------------------------ */}

            {/* CTA */}
            {!currentUser && (
                <motion.section
                    className="relative overflow-hidden py-20"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={container}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-blue-100 z-0 animate-gradient-flow"></div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="glass-card max-w-3xl mx-auto p-10 rounded-3xl shadow-lg">
                            <h3 className="text-3xl font-bold text-blue-800 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                                Your journey to a graduate degree starts here.
                            </h3>
                            <p className="max-w-2xl mx-auto mt-3 text-gray-700">
                                Sign up for free and get personalized matches—plus one free
                                document review when you create your profile.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <Link to="/signup">
                                    <motion.button
                                        {...floatBtn}
                                        className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow hover:bg-blue-600 transition"
                                    >
                                        Create free account
                                    </motion.button>
                                </Link>
                                <Link to="/contact" className="underline text-blue-700">
                                    Contact us
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}
        </div>
    );
}