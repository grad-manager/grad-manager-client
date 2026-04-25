/* eslint-disable no-irregular-whitespace */
import { Link } from 'react-router-dom';
import React, { useState } from 'react'; // Import React and useState
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaShieldAlt, FaBolt, FaCheckCircle, FaUserFriends, FaRegClock } from 'react-icons/fa';

import Ayomide from '../assets/images/Ayomide.webp';
import Olamide from '../assets/images/Olamide.webp';
import Blessing from '../assets/images/Blessing.webp';
import Agina from '../assets/images/Agina.webp';

// Animation variants for consistent, staggered reveals
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

// Utility function to truncate text
const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Updated data with detailed, engaging text
const teamMembers = [
    {
    name: 'Adedeji Ayomide Olamide',
    title: 'Founder',
    bio: "Ayomide is a serial founder and graduate school mentor with over 5 years of experience guiding students to top global universities. He secured multiple fully funded scholarships across Nigeria, Thailand, and the US, including the Rice University Graduate Scholarship. As founder of FutureGRIN Group and co-creator of KSC, he has built platforms reaching thousands of students, helping them access research opportunities, publications, and fully funded programs. Ayomide leads Grad Manager with a student-first vision, ensuring every feature empowers students to achieve their academic goals with less stress.",
    image: Ayomide,
    },
    {
    name: 'Olamide Oluwatade',
    title: 'Strategic Partner & Applicants Mentor',
    bio: 'Olamide Oluwatade is a versatile Data Scientist and Mathematician with deep expertise in statistical analysis, machine learning, and web development. She leverages analytical rigor and technical creativity to build data-driven solutions, develop digital products, and solve complex, real-world challenges using tools such as Python, R, SQL, SAS, C++, and HTML. As the Founder & CEO of Midecy, an educational platform, Olamide empowers students to navigate graduate school admissions, secure scholarships, and explore study-abroad opportunities. Through Midecy, she shares her academic and professional experience to mentor aspiring scholars and cultivate the next generation of global leaders. Her work sits at the intersection of data science, mathematics, and education, with a mission to harness technology and research for meaningful impact while creating pathways for academic and professional success.',
    image: Olamide,
    },
    {
     name: 'Blessing Alana',
     title: 'Project Manager',
     bio: 'Blessing is a dedicated product leader with a sharp eye for user experience and design. With a background in market research and a deep understanding of student needs, she shapes the features and roadmap of Grad Manager. She’s the voice of our users, ensuring that the platform is not only powerful but also intuitive and delightful to use.',
     image: Blessing,
    },
    {
     name: 'Agina Emmanuel',
     title: 'Web Developer',
     bio: 'Agina Emmanuel is a skilled and innovative web developer specializing in building modern, responsive, and user-friendly web applications. He is the creator of Grad Manager, a comprehensive platform that streamlines academic management for students and administrators, as well as several other web apps that solve real-world problems. Passionate about turning ideas into seamless digital experiences, Emmanuel focuses on writing clean, maintainable code while designing intuitive and visually appealing interfaces. With expertise in React, Next.js, TypeScript, Tailwind CSS, Node.js, and MongoDB, e.t.c., he delivers scalable solutions that combine functionality with excellent user experience. Agina thrives on challenges, enjoys learning new technologies, and is committed to bringing innovative and reliable digital products to life.',
     image: Agina,
},

];

const coreValues = [
    {
        title: 'User-Obsessed Design',
        description: 'Our design philosophy is simple: put the student first. We meticulously craft every feature, from the intuitive dashboard to the powerful search filters, to simplify your journey, reduce stress, and save you valuable time. Your success is our north star, and we believe the right tools should feel invisible, letting your ambition shine.',
        icon: <FaGraduationCap className="text-4xl text-primary" />,
    },
    {
        title: 'Built for Reliability',
        description: 'Applying for graduate school is stressful enough without technology glitches. We are committed to building a platform that is not just powerful, but also secure, reliable, and bug-free. Your data is protected, your deadlines are tracked accurately, and our system is always running smoothly, so you can focus on building your future with confidence.',
        icon: <FaShieldAlt className="text-4xl text-primary" />,
    },
    {
        title: 'Evolving with You',
        description: 'The academic landscape is constantly changing. We embrace this by continuously innovating and updating our features. Whether it’s integrating new AI-powered tools for essay writing or expanding our database of scholarships, we are dedicated to providing the most relevant and cutting-edge resources to help you stay ahead of the curve.',
        icon: <FaBolt className="text-4xl text-primary" />,
    },
];

const impactStats = [
    {
        stat: 10000,
        suffix: '+',
        label: 'Applications Managed',
        icon: <FaCheckCircle className="text-4xl text-white" />,
    },
    {
        stat: 25000,
        suffix: '+',
        label: 'Students Empowered',
        icon: <FaUserFriends className="text-4xl text-white" />,
    },
    {
        stat: 100000,
        suffix: '+',
        label: 'Hours Saved',
        icon: <FaRegClock className="text-4xl text-white" />, // Using FaTimes as a placeholder for a new "time" icon
    },
];

// --- NEW COMPONENT: TeamMemberCard with Read More logic ---
interface TeamMemberCardProps {
    member: typeof teamMembers[0];
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 180; // Max characters to show initially
    const displayBio = isExpanded ? member.bio : truncateText(member.bio, maxLength);
    const requiresExpansion = member.bio.length > maxLength;

    return (
        <motion.div
            variants={item}
            className="bg-white p-8 rounded-2xl shadow-lg card-hover"
        >
            <img 
                src={member.image} 
                alt={member.name} 
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary shadow-md"
                loading="lazy" 
            />
            <h3 className="text-xl font-semibold text-secondary mt-6">{member.name}</h3>
            <p className="text-primary mt-1 mb-4">{member.title}</p>
            
            {/* Bio with Truncation Logic */}
            <p className="text-neutral-dark text-sm leading-relaxed whitespace-pre-line">
                {displayBio}
            </p>

            {/* Read More / Show Less Button */}
            {requiresExpansion && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 text-sm font-semibold text-primary hover:text-indigo-700 transition duration-150"
                >
                    {isExpanded ? 'Show Less' : 'Read More'}
                </button>
            )}
        </motion.div>
    );
}
// --- END NEW COMPONENT ---

export default function AboutPage() {
    const { currentUser } = useAuth();

    return (
        <div className="bg-neutral-100 mt-8 min-h-screen font-sans text-neutral-dark">
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-[60vh] flex items-center justify-center text-center py-20">
                <div className="absolute inset-0 section-gradient z-0"></div>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative max-w-4xl px-4 z-10"
                >
                    <h1 className="text-gradient font-extrabold mb-4">
                        Our Story. Our Mission. Our Passion.
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 text-neutral-dark mt-6">
                        We are dedicated to building the ultimate tool for students navigating the graduate school application process.
                    </p>
                </motion.div>
            </section>

            {/* From Chaos to Clarity */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                    <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <h2 className="text-3xl font-bold text-gradient mb-4">From Chaos to Order</h2>
                        <p className="text-neutral-dark leading-relaxed mb-4">
                            The graduate school application process is overwhelming. We experienced it ourselves — juggling portals, Writing SOPs, Tracking deadlines, and emails — and realized there had to be a better way.
                        </p>
                        <p className="text-neutral-dark leading-relaxed mb-4">
                            Grad Manager was born to bring order to the chaos, letting students focus on building powerful applications that reflect their potential.
                        </p>
                    </motion.div>
                    <motion.div variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}>
                        <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3" alt="Students collaborating" className="rounded-2xl shadow-lg card-hover" loading="lazy" />
                    </motion.div>
                </div>
            </section>

            {/* Our Guiding Principles */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-50 via-white to-blue-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-12">Our Guiding Principles</h2>
                    <p className="max-w-3xl mx-auto text-lg mb-10 text-neutral-dark">
                        These core values are not just words, they are the foundation of everything we build. They guide our decisions and ensure that we remain dedicated to your success, today and in the future.
                    </p>
                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
                        {coreValues.map((value, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                className="bg-white p-8 rounded-xl shadow-md card-hover"
                            >
                                <div className="flex justify-center mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold text-secondary mb-2">{value.title}</h3>
                                <p className="text-neutral-dark leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* By the Numbers: Our Impact - UPDATED SECTION */}
            <section className="relative py-20 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 animate-gradient-flow opacity-90"></div>
                <div className="relative z-10 max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
                    {impactStats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={item} initial="hidden" whileInView="show" viewport={{ once: true }}
                        >
                            <div className="text-5xl font-bold drop-shadow-lg flex items-center justify-center h-16"> 
                                {stat.icon}
                                {/* Replaced CountUp with "Coming Soon" text */}
                                <div className='ml-2 text-3xl'>Coming Soon</div>
                            </div>
                            <div className="opacity-90 mt-2">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            

            {/* The People Behind the Passion (Revised to use TeamMemberCard) */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-indigo-50 animate-gradient-flow z-0"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gradient mb-12">The People Behind the Passion</h2>
                    <p className="max-w-3xl mx-auto text-lg mb-10 text-neutral-dark">
                        Our team is a blend of academic experts, passionate mentors, and brilliant engineers who are all united by a single goal: to empower the next generation of global leaders.
                    </p>
                    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-10">
                        {teamMembers.map((member, i) => (
                            // Use the new component here
                            <TeamMemberCard key={i} member={member} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            {!currentUser && (
                <section className="relative overflow-hidden py-16">
                    <div className="absolute inset-0 section-gradient z-0"></div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-lg p-10 rounded-3xl shadow-lg border border-white/50">
                            <h3 className="text-3xl font-bold text-gradient">Your Journey Starts Here.</h3>
                            <p className="max-w-2xl mx-auto mt-3 text-neutral-dark">
                                Join thousands of students who are turning their academic aspirations into reality. Your future is waiting.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <Link to="/signup">
                                    <motion.button {...floatBtn} className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow hover:opacity-95 transition">
                                        Create free account
                                    </motion.button>
                                </Link>
                                <Link to="/contact" className="underline text-primary">Contact us</Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}