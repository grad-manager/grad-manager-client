import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast"; // Example import
import { FaTimes, FaGraduationCap, FaUsers, FaBrain } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  platformFeatures,
  type Feature,
  testimonials,
  dynamicScholarships,
  featuredProjects,
  predictorHighlights,
} from "../data/homePageData";
import UltimateHero from "../components/UltimateHero";
import YouthfulOffersSection from "../components/YouthfulOffersSection";
import DemoSection from "../components/DemoSection";
import TestimonialsSection from "../components/TestimonialsSection";
import { DynamicFeatureCard } from "../components/DynamicFeatureCard";
import FeedbackModal from "../components/FeedbackModal";
import VideoGuidePopup from "../components/VideoGuidePopup";
import TrialBanner from "../components/TrialBanner";
import {
  getBasePlanLower,
  isSubscriptionRestricted,
  isTrialActive,
} from "../utils/trial";

// --- Modal Component ---
interface FeatureModalProps {
  feature: Feature | null;
  onClose: () => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ feature, onClose }) => {
  if (!feature) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FaTimes size={24} />
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-secondary mb-4">
              {feature.title}
            </h3>
            <p className="text-neutral-dark whitespace-pre-wrap">
              {feature.fullDesc}
            </p>
          </div>
          {feature.fullImage && (
            <div className="flex-1 flex items-center justify-center">
              <img
                src={feature.fullImage}
                alt={feature.title}
                loading="lazy"
                className="rounded-lg shadow-md w-full md:w-auto md:max-w-xs object-cover"
              />
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:opacity-95 transition"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Outstanding Loader Component ---
const OutstandingLoader: React.FC = () => {
  // 1. Access the currentUser state from your AuthContext
  const { currentUser } = useAuth();

  // 2. Define the message based on the user's sign-in status
  const message = currentUser
    ? "Welcome back to your dashboard"
    : "Welcome to ";

  const additionalMessage = currentUser
    ? "Loading your applications and tasks."
    : "The platform for your graduate application journey.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated circular loader */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[6px] border-gray-200" />

          {/* Orbiting dot */}
          <motion.div
            className="absolute w-3 h-3 bg-blue-600 rounded-full shadow-md"
            animate={{
              rotate: 360,
              x: [0, 40, 0, -40, 0],
              y: [0, -40, 0, 40, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
            }}
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Subtle loading message */}
        <motion.p
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.4,
          }}
          className="text-center text-gray-700 text-base sm:text-lg font-semibold tracking-wide"
        >
          <span className="inline-block animate-fade-in">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {message}
            </span>
            <span className="underline underline-offset-4 decoration-blue-500 decoration-2">
              {currentUser ? "!" : " Grad Manager"}
            </span>
          </span>

          {/* Additional message */}
          <span className="block mt-2 text-gray-500 text-sm italic">
            {additionalMessage}
          </span>

          {/* Custom animation for fade-in */}
          <style>
            {`
                            @keyframes fade-in {
                                from {
                                    opacity: 0;
                                    transform: translateY(5px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                            .animate-fade-in {
                                animation: fade-in 1s ease-out forwards;
                            }
                        `}
          </style>
        </motion.p>
      </div>
    </div>
  );
};

// --- Animation variants ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const floatBtn = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.97 } };

// --- HomePage Component ---
export default function HomePage() {
  const { token, currentUser, userProfile } = useAuth(); // Destructure currentUser here too
  const [loading, setLoading] = useState(true);
  const [modalFeature, setModalFeature] = useState<Feature | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) =>
      setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // --- DEDICATED Feedback Timer/Persistence Constants (UPDATED) ---
  // ✅ NEW COOLDOWN: Use 2 weeks for all subsequent prompts.
  const COOLDOWN_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks delay (14 days)

  // ✅ KEY CHANGE: Use a single localStorage key for the next show time
  const FEEDBACK_NEXT_SHOW_KEY = "feedbackNextShowTime"; // localStorage key for the cooldown timestamp

  // Removed old sessionStorage constants: FEEDBACK_COUNT_KEY, FEEDBACK_SUBMITTED_TIMESTAMP_KEY, MINUTE_DELAY_MS, MAX_FEEDBACK_SHOW

  // --- DEDICATED Feedback Cooldown useEffect (SIMPLIFIED) ---
  useEffect(() => {
    // Only run this logic if the user is logged in AND the page finished its initial load
    if (!currentUser || loading) return;

    const checkAndShowFeedbackModal = () => {
      const now = Date.now();

      // 1. CHECK: Get the next allowed show time from localStorage
      const nextShowTime = parseInt(
        localStorage.getItem(FEEDBACK_NEXT_SHOW_KEY) || "0",
      );

      // 2. CONDITION: Do not show if the current time is before the cooldown expires
      if (nextShowTime > now) {
        // Console log this for debugging to confirm the timer is active
        console.log(
          `Feedback prompt is on cooldown. Next available at: ${new Date(nextShowTime).toLocaleString()}`,
        );
        return;
      }

      // 3. SHOW: If the cooldown has expired (or nextShowTime is 0), show the modal
      if (!isFeedbackOpen) {
        setIsFeedbackOpen(true);
      }
    };

    // We run the check once on load/login
    // We will NOT use a polling interval anymore, as the simple cooldown check is sufficient.
    checkAndShowFeedbackModal();

    // Removed the polling interval logic.

    // The dependency array is clean and correct
  }, [currentUser, loading, isFeedbackOpen]); // isFeedbackOpen needed to prevent infinite loop/re-runs if it fails to open

  // --- Feedback handlers ---
  const handleFeedbackSubmit = async (feedback: string, email: string) => {
    // 1. Close the modal immediately
    setIsFeedbackOpen(false);
    console.log("Feedback submitted:", feedback, email);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback, email }),
      });

      if (response.ok) {
        // 2. SUCCESS: Show confirmation toast
        toast.success(
          "Thank you! Your feedback has been sent successfully. 🙏",
          {
            duration: 5000,
            position: "top-center",
          },
        );

        // 3. Set the 2-week cooldown timestamp in localStorage (NEW LOGIC)
        localStorage.setItem(
          FEEDBACK_NEXT_SHOW_KEY,
          (Date.now() + COOLDOWN_DELAY_MS).toString(),
        );

        // 4. Removed all sessionStorage cleanup as those keys are no longer used.
      } else {
        // 5. SERVER ERROR: Handle non-200 responses
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to submit feedback." }));

        toast.error(
          `Submission failed: ${errorData.message || "Server error occurred."}`,
          {
            duration: 5000,
          },
        );
      }
    } catch (error) {
      // 6. NETWORK ERROR: Handle fetch errors
      console.error("Fetch error during feedback submission:", error);

      toast.error(
        "Network error. Please check your connection and try again.",
        {
          duration: 5000,
        },
      );
    }
  };

  // This function handles the "Maybe Later" and "X" (Dismissal) clicks
  const handleFeedbackClose = () => {
    setIsFeedbackOpen(false);

    // ✅ NEW LOGIC: Set the 2-week cooldown timestamp for dismissal
    localStorage.setItem(
      FEEDBACK_NEXT_SHOW_KEY,
      (Date.now() + COOLDOWN_DELAY_MS).toString(),
    );
  };
  useEffect(() => {
    if (!currentUser) {
      const hasSeenVideo = sessionStorage.getItem("VIDEO_GUIDE_SEEN");

      if (!hasSeenVideo) {
        setIsVideoOpen(true);
      }
    }
  }, [currentUser]);

  const handleVideoClose = () => {
    setIsVideoOpen(false);
    sessionStorage.setItem("VIDEO_GUIDE_SEEN", "true");
  };

  // Dynamic text based on user login status
  const heroTitle = currentUser
    ? "" // Text removed for logged-in users
    : "Grad School Applications,";

  const heroSubTitle = currentUser
    ? "" // Text removed for logged-in users
    : "Simplified for You";

  const heroText = currentUser
    ? "" // Text removed for logged-in users
    : "Grad Manager makes the journey seamless in one powerful dashboard.";

  const basePlan = getBasePlanLower(userProfile);
  const freeTrialActive =
    basePlan === "free" && isTrialActive(userProfile?.trial);
  const freeAccessRestricted =
    basePlan === "free" && isSubscriptionRestricted(userProfile);

  return (
    <AnimatePresence>
      {loading ? (
        <OutstandingLoader key="loader" />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // ✅ FIX: Increased duration to 2s to allow UltimateHero animation to be fully visible
          transition={{ duration: 2 }}
          className="min-h-screen font-sans bg-neutral-light text-neutral-900 relative overflow-x-hidden"
        >
          {currentUser && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24">
              {freeTrialActive && <TrialBanner userProfile={userProfile} />}
              {freeAccessRestricted && (
                <div className="w-full mb-6">
                  <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 text-amber-950 shadow-xl">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.35),transparent_55%)]" />
                    <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="text-lg sm:text-xl font-extrabold tracking-wide">
                          Your Free Trial Has Ended
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-amber-900">
                          Your account is currently restricted until you
                          subscribe to Pro.
                        </div>
                        <div className="text-xs sm:text-sm text-amber-800">
                          Upgrade now to restore access to the full platform.
                        </div>
                      </div>
                      <Link
                        to="/subscribe?reason=trial-expired"
                        className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow hover:bg-amber-600 transition"
                      >
                        View Plans
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Floating actions (desktop) - Hidden when user is logged in */}
          {!currentUser && (
            <div className="hidden lg:flex fixed top-1/3 right-6 flex-col gap-4 z-50">
              <motion.div
                {...floatBtn}
                className="rounded-full overflow-hidden"
              >
                <Link
                  to="/programs"
                  className="bg-gradient-to-r from-primary to-indigo-600 text-white px-6 py-3 rounded-full shadow-md font-semibold"
                >
                  Search Now
                </Link>
              </motion.div>
            </div>
          )}
          {!currentUser && (
            <motion.section
              initial="hidden"
              animate="show"
              variants={container}
              onMouseMove={(e) => {
                const el = e.currentTarget as HTMLElement;
                const rect = el.getBoundingClientRect();
                const mx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
                const my = (e.clientY - rect.top) / rect.height - 0.5; // -0.5..0.5
                el.style.setProperty("--mx", String(mx));
                el.style.setProperty("--my", String(my));
              }}
              className="relative overflow-hidden pt-8 -mb-16 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28"
              style={{
                background:
                  "linear-gradient(180deg,#ffffff 0%, #f8fafc 40%, #eef2ff 100%)",
              }}
            >
              <UltimateHero
                heroTitle={heroTitle}
                heroSubTitle={heroSubTitle}
                heroText={heroText}
              />
            </motion.section>
          )}

          {/* What GradManager Offers */}
          <section className="relative overflow-hidden pt-16 -mb-24 pb-14 bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {/* Floating blobs (optional, like hero) */}
            <YouthfulOffersSection
              currentUser={currentUser}
              platformFeatures={platformFeatures}
              setModalFeature={setModalFeature}
            />
          </section>

          {/* Video Walkthrough - Visible to all users */}
          <section className="relative overflow-hidden py-20 -mb-16 bg-gradient-to-r from-blue-100 via-white to-purple-100 animate-gradient">
            {/* Soft floating blobs */}
            <DemoSection />
          </section>

          {/* Scholarship Showcase - Displays ONLY if the user is NOT logged in */}
          {/* ------------------------------------------------------------------ */}
          {/* NEW Dynamic Feature Showcase */}
          {!currentUser && (
            <section className="relative overflow-hidden py-20 -mt-16 bg-gradient-to-br from-blue-50 via-white to-pink-50">
              {/* Glow Orbs / Background Accents */}
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-300/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 -right-16 w-72 h-72 bg-purple-300/40 rounded-full blur-3xl animate-pulse delay-500"></div>

              <div className="container mx-auto px-6 relative z-10">
                {/* Heading + CTA */}
                <motion.div
                  className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                >
                  <h3
                    className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight
                                                     bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500
                                                     bg-clip-text text-transparent drop-shadow-sm text-center sm:text-left"
                  >
                    What's Trending This Month{" "}
                    <br className="hidden sm:block" /> on Grad Manager
                  </h3>
                  <Link
                    to="/signup"
                    className="hidden sm:inline-block self-center sm:self-end px-6 py-2.5 rounded-full text-white
                                              bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                                              shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Get Started →
                  </Link>
                </motion.div>

                {/* Dynamic Grid Showcase */}
                <motion.div
                  className="grid lg:grid-cols-3 gap-8"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
                  }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  {/* Card 1: Programs & Scholarships */}
                  <DynamicFeatureCard
                    dataArray={dynamicScholarships}
                    cardTitle="Featured Funded Programs & Scholarships"
                    backgroundColorClass="bg-blue-100/70"
                    tagClass="bg-blue-200 text-blue-800"
                    cardIcon={
                      <FaGraduationCap className="text-3xl text-blue-600" />
                    }
                    linkTo="/signup"
                  />

                  {/* Card 2: Ongoing Projects */}
                  <DynamicFeatureCard
                    dataArray={featuredProjects}
                    cardTitle="Featured Research & Project Collaboration"
                    backgroundColorClass="bg-purple-100/70"
                    tagClass="bg-purple-200 text-purple-800"
                    cardIcon={<FaUsers className="text-3xl text-purple-600" />}
                    linkTo="/signup"
                  />

                  {/* Card 3: AI Application Predictor */}
                  <DynamicFeatureCard
                    dataArray={predictorHighlights}
                    cardTitle="Featured AI Admission Predictor"
                    backgroundColorClass="bg-pink-100/70"
                    tagClass="bg-pink-200 text-pink-800"
                    cardIcon={<FaBrain className="text-3xl text-pink-600" />}
                    linkTo="/signup"
                  />
                </motion.div>
              </div>
            </section>
          )}

          {/* Testimonials & Success Stories - Hidden when logged in */}
          {!currentUser && (
            <section className="relative overflow-hidden py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-gradient">
              {/* floating decorative blobs */}
              <TestimonialsSection testimonials={testimonials} />
            </section>
          )}

          {/* Community and Impact Counters - Hidden when logged in */}
          {!currentUser && (
            <section className="relative py-20 md:py-32 overflow-hidden bg-gray-900">
              {/* Background layers */}
              <div className="absolute inset-0 -z-20">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-500/30 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[150px] animate-pulse-slower"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-80"></div>

                {/* Cursor-reactive particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const offsetX = (Math.random() - 0.5) * 200;
                    const offsetY = (Math.random() - 0.5) * 200;
                    return (
                      <span
                        key={idx}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                        style={{
                          transform: `translate(${mouse.x / 100 + offsetX}px, ${mouse.y / 100 + offsetY}px)`,
                          transition: "transform 0.1s linear",
                          opacity: 0.3 + Math.random() * 0.7,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 drop-shadow-lg mb-12 md:mb-16"
                >
                  Our Impact in Numbers 🚀
                </motion.h2>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-20">
                  {[
                    { value: "Coming Soon", label: "Mentors" },
                    { value: "Coming Soon", label: "Students Helped" },
                    { value: "Coming Soon", label: "Success Rate" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.3, duration: 0.8 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1 }}
                      className="relative w-40 sm:w-48 md:w-64 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-700/70 to-indigo-800/70 shadow-2xl border border-white/20 backdrop-blur-md cursor-pointer overflow-hidden group perspective"
                    >
                      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-400 to-indigo-400 opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse-fast"></div>

                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 6 }).map((_, sparkIdx) => (
                          <span
                            key={sparkIdx}
                            className="absolute w-1 h-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 animate-sparkle"
                            style={{
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              animationDelay: `${Math.random() * 0.5}s`,
                            }}
                          ></span>
                        ))}
                      </div>

                      <div
                        className="relative z-10 flex flex-col items-center justify-center"
                        style={{ perspective: "1000px" }}
                      >
                        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                          {stat.value}
                        </div>
                        <div className="mt-2 sm:mt-3 text-sm sm:text-lg md:text-xl font-medium text-white/90 tracking-wide">
                          {stat.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  viewport={{ once: true }}
                  className="mt-10 md:mt-16 text-sm sm:text-lg md:text-xl text-white/80 font-light"
                >
                  Connecting mentors with learners worldwide, building the
                  future, one success at a time.
                </motion.p>
              </div>

              {/* Styles */}
              <style>{`
                                @keyframes pulse-slow { 0%,100%{transform:scale(1);opacity:0.3;}50%{transform:scale(1.1);opacity:0.6;} }
                                @keyframes pulse-slower { 0%,100%{transform:scale(1);opacity:0.2;}50%{transform:scale(1.15);opacity:0.5;} }
                                @keyframes pulse-fast { 0%,100%{opacity:0.4;}50%{opacity:0.8;} }
                                @keyframes sparkle { 0%{opacity:0;transform:scale(0.5);}50%{opacity:1;transform:scale(1.2);}100%{opacity:0;transform:scale(0.5);} }
                                .animate-pulse-slow{animation:pulse-slow 6s ease-in-out infinite;}
                                .animate-pulse-slower{animation:pulse-slower 8s ease-in-out infinite;}
                                .animate-pulse-fast{animation:pulse-fast 2s ease-in-out infinite;}
                                .animate-sparkle{animation:sparkle 1s ease-in-out infinite;}
                            `}</style>
            </section>
          )}

          {/* FAQ Cards - HIDDEN WHEN LOGGED IN */}
          {!currentUser && (
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {[
                {
                  q: "How do I search for graduate programs?",
                  a: "Use our intuitive Graduate Program Search to filter programs by field, country, funding type, and deadlines. You can save your favorite programs for easy tracking.",
                },
                {
                  q: "Can I track my application progress?",
                  a: "Yes! Our Application Progress Tracker lets you monitor each step of your applications, from submission to acceptance.",
                },
                {
                  q: "What is the AI Application Predictor?",
                  a: "Our AI tool predicts your chances of acceptance based on your profile and the program requirements, helping you focus on realistic opportunities.",
                },
                {
                  q: "Do you help with essays, SOPs, and CVs?",
                  a: "Absolutely. Our platform provides writing assistance, tips, and templates for Essays, SOPs, and CVs. You can also request personalized reviews from mentors.",
                },
                {
                  q: "Can I join ongoing projects or research?",
                  a: "Yes! We list available ongoing projects where students can participate, gain experience, and strengthen their applications.",
                },
                {
                  q: "How does interview preparation work?",
                  a: "We provide mock interview sessions, common questions, and tips to help you prepare confidently for graduate program interviews.",
                },
                {
                  q: "What content is available in the Application Blog & News?",
                  a: "Stay updated with articles on scholarships, application tips, success stories, and trending graduate programs worldwide.",
                },
                {
                  q: "How do I connect and chat with other users?",
                  a: "Our Connect & Chat feature allows you to communicate with peers, share experiences, and ask questions in real-time.",
                },
                {
                  q: "Can I connect with a mentor?",
                  a: "Yes. You can request mentorship from experienced professionals who provide guidance on applications, essays, and career growth.",
                },
                {
                  q: "Does the platform suggest programs for me?",
                  a: "Our AI-powered recommendations suggest programs based on your profile, interests, and academic background to maximize your chances.",
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition"
                >
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 bg-gradient-to-r from-blue-400 to-indigo-400 blur-lg transition" />
                  <h4 className="font-semibold text-lg text-secondary">
                    {faq.q}
                  </h4>
                  <p className="mt-3 text-sm text-neutral-dark">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* FINAL CTA - Already conditional, no change needed here, just keep it wrapped */}
          {!currentUser && (
            <section className="relative overflow-hidden py-20">
              {/* background gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 animate-gradient bg-[length:400%_400%]" />

              {/* floating blobs */}
              <motion.div
                className="absolute z-0 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl"
                animate={{ y: [0, -25, 0] }}
                transition={{ repeat: Infinity, duration: 9 }}
                style={{ top: "12%", left: "-6%" }}
              />
              <motion.div
                className="absolute z-0 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl"
                animate={{ y: [0, 30, 0] }}
                transition={{ repeat: Infinity, duration: 11 }}
                style={{ bottom: "6%", right: "-10%" }}
              />

              <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/40"
                >
                  {/* headline */}
                  <h3
                    className="text-3xl md:text-4xl font-extrabold
                                                                     bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                                                                     bg-clip-text text-transparent animate-text"
                  >
                    Ready to find your funded path?
                  </h3>

                  {/* subtext */}
                  <p className="max-w-2xl mx-auto mt-4 text-gray-700 text-lg">
                    Join thousands of students discovering fully funded
                    opportunities. Sign up for free and get{" "}
                    <span className="font-semibold text-indigo-600">
                      your first document review on us.
                    </span>
                  </p>

                  {/* buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-5"
                  >
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3 rounded-full
                                                                             shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                    >
                      Create free account
                    </Link>
                    <Link
                      to="/contact"
                      className="underline text-indigo-700 font-semibold hover:text-indigo-900 transition"
                    >
                      Contact sales
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              <style>{`
                                @keyframes gradientAnimation {
                                    0% { background-position: 0% 50%; }
                                    50% { background-position: 100% 50%; }
                                    100% { background-position: 0% 50%; }
                                }
                                .animate-gradient {
                                    animation: gradientAnimation 10s ease infinite;
                                }
                                .animate-text {
                                    background-size: 300% 300%;
                                    animation: gradientAnimation 6s ease infinite;
                                }
                            `}</style>
            </section>
          )}

          {/* Manual Feedback Section */}
          <section className="py-12 mt-20 bg-gray-100 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Send us feedback anytime
            </h3>
            <p className="text-gray-700 mb-6">
              Have something to share? Open the feedback form here.
            </p>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-xl transition"
            >
              Open Feedback Form
            </button>
          </section>

          <AnimatePresence>
            {modalFeature && (
              <FeatureModal
                feature={modalFeature}
                onClose={() => setModalFeature(null)}
              />
            )}
          </AnimatePresence>

          {/* Feedback modal */}
          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={handleFeedbackClose}
            onSubmit={handleFeedbackSubmit}
          />

          {!currentUser && isVideoOpen && (
            <VideoGuidePopup onClose={handleVideoClose} />
          )}
        </motion.div>
      )}
      <FeatureModal
        feature={modalFeature}
        onClose={() => setModalFeature(null)}
      />
    </AnimatePresence>
  );
}
