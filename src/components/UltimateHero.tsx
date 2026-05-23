/* eslint-disable no-irregular-whitespace */
// components/UltimateHero.tsx
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  FaGraduationCap,
  FaBolt,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Download } from "lucide-react";
import { useInstallPWA } from "../hooks/useInstallPWA";
import { IOSInstallGuide } from "./IOSInstallGuide";

// --- DYNAMIC TEXT SUB-COMPONENT ---
const PHRASES = [
  "School & Funding Search",
  "Application Tracker",
  "AI Evaluation",
  "Essays & SOPs",
  "Projects to boost your CV",
];

const DynamicTextHero: React.FC = () => {
  const [currentText, setCurrentText] = React.useState("");
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [typingSpeed, setTypingSpeed] = React.useState(100);

  // Main effect to handle the typing and deleting process
  React.useEffect(() => {
    const handleTyping = () => {
      const fullPhrase = PHRASES[phraseIndex];

      if (isDeleting) {
        // Deleting state
        setCurrentText(fullPhrase.substring(0, currentText.length - 1));
        setTypingSpeed(50); // Fast deletion
      } else {
        // Typing state
        setCurrentText(fullPhrase.substring(0, currentText.length + 1));
        setTypingSpeed(100); // Standard typing speed
      }

      // Logic transition
      if (!isDeleting && currentText === fullPhrase) {
        // Pause at end of typing
        setTypingSpeed(1500);
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        // Transition to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }
    };

    const timer = setInterval(handleTyping, typingSpeed);

    return () => clearInterval(timer);
  }, [currentText, isDeleting, phraseIndex, typingSpeed]); // Dependencies for re-run logic

  return (
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="mt-4 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 leading-snug tracking-tight"
    >
      Your Journey to Smart{" "}
      <span className="text-purple-600 font-extrabold">{currentText}</span>
      {/* Blinking Cursor - using a simple Tailwind animate-pulse on the border for effect */}
      <span className="border-r-2 border-purple-600 h-6 inline-block ml-0.5 animate-pulse" />
    </motion.h2>
  );
};
// --- END DYNAMIC TEXT SUB-COMPONENT ---

// --- MAIN HERO COMPONENT ---
export default function UltimateHero({
  heroTitle,
  heroSubTitle,
  heroText,
}: {
  heroTitle: string;
  heroSubTitle: string;
  heroText: string;
}) {
  useAuth();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { handleInstallClick, isStandalone } = useInstallPWA();
  const [showInstall, setShowInstall] = useState(false);
  const navigatorAgent = window.navigator.userAgent;
  const isIOS = navigatorAgent.match(/(iPad|iPhone|iPod)/i);

  const handleMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const floatX = useTransform(mouseX, (v) => `${v * 18}px`);
  const floatY = useTransform(mouseY, (v) => `${v * 12}px`); // Animation variants

  const fadeIn = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }; // Stagger delay set to 0.1
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <section
      onMouseMove={handleMove}
      ref={containerRef}
      aria-label="Hero — Grad Manager" // FIX 1: Reduced minimum height on mobile
      className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 text-gray-900 min-h-[70vh] lg:min-h-screen flex items-center"
    >
      {/* Grid Pattern from NextGenHome */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      {/* Floating Shapes */}
      <motion.div
        aria-hidden
        style={{ translateX: floatX, translateY: floatY }}
        className="pointer-events-none absolute -left-36 -top-28 w-96 h-96 rounded-full blur-3xl opacity-40 z-20"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.6), rgba(99,102,241,0.3) 40%, rgba(99,102,241,0.1))",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ translateX: floatX, translateY: floatY }}
        className="pointer-events-none absolute -right-40 -bottom-36 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-35 z-20"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(236,72,153,0.5), rgba(99,102,241,0.3) 50%, rgba(236,72,153,0.1))",
          }}
        />
      </motion.div>
      {/* Main Content Container */}
      {/* ✅ FIX: Increased top padding to pt-24 (6rem) on mobile */}
      <div className="container mx-auto px-6 pt-24 pb-10 lg:py-28 relative z-30">
        <motion.div
          initial="hidden" // Hides all children initially
          animate="show" // Triggers the animation (now visible after loader)
          variants={stagger} // Staggers the immediate children (the two columns)
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          {/* LEFT: Text + CTA (Now acts as a container for its own staggered items) */}
          <motion.div // Removed variants={fadeIn} from this outer div so the children can be the staggered items
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* 1. Badge */}
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white backdrop-blur-md border border-gray-200 shadow-md"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-pink-400 shadow-sm" />
              <span className="text-xs font-semibold text-slate-700">
                New • Smart Matches
              </span>
            </motion.div>
            {/* 2. Title */}
            <motion.h1
              variants={fadeIn}
              className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
            >
              <span className="block">{heroTitle}</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600">
                {heroSubTitle}
              </span>
            </motion.h1>
            {/* ⭐️ DYNAMIC TEXT HERO COMPONENT INSERTED HERE ⭐️ */}
            <DynamicTextHero />
            {/* ⭐️ END DYNAMIC TEXT HERO ⭐️ */} {/* 3. Body Text */}
            <motion.p
              variants={fadeIn}
              className="mt-5 text-lg text-gray-700 max-w-2xl mx-auto lg:mx-0"
            >
              {heroText}
            </motion.p>
            {/* 4. CTA Button */}
            <motion.div
              variants={fadeIn}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/signup"
                className="relative inline-flex items-center gap-3 justify-center px-10 py-3 rounded-full text-white font-semibold bg-blue-600 shadow-lg hover:bg-blue-700 hover:scale-105 transform transition"
              >
                <FaGraduationCap className="text-lg" />
                <span className="uppercase tracking-wide">
                  Join Grad Manager
                </span>
              </Link>
              {!isStandalone && (
                <>
                  <button
                    onClick={
                      isIOS ? () => setShowInstall(true) : handleInstallClick
                    }
                    className="relative inline-flex items-center gap-3 justify-center px-10 py-3 rounded-full hover:text-white text-primary border font-semibold border-blue-600 shadow-lg hover:border-none hover:bg-gray-500 hover:scale-105 transform transition"
                  >
                    <Download className="text-lg" />
                    <span className="uppercase tracking-wide">Install App</span>
                  </button>

                  <IOSInstallGuide
                    appName="GradManager"
                    appIcon="/android-chrome-192x192.png"
                    open={showInstall}
                    onClose={() => setShowInstall(false)}
                  />
                </>
              )}
            </motion.div>
            {/* 5. Feature Cards Container (Still uses fadeIn to move as one block, FeatureCards handle internal stagger) */}
            <motion.div
              variants={fadeIn}
              className="mt-10 hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0"
            >
              <FeatureCard
                icon={<FaBolt className="text-blue-600" />}
                title="Curated funded programs"
                subtitle=""
                mouseX={mouseX}
                mouseY={mouseY}
              />
              <FeatureCard
                icon={<FaShieldAlt className="text-pink-600" />}
                title="Verified info"
                subtitle=""
                mouseX={mouseX}
                mouseY={mouseY}
              />
              <FeatureCard
                icon={<FaCheckCircle className="text-teal-600" />}
                title="Mentors & reviews"
                subtitle=""
                mouseX={mouseX}
                mouseY={mouseY}
              />
            </motion.div>
          </motion.div>
          {/* RIGHT: Visual (Still uses variants={fadeIn} for a single staggered entrance) */}
          <motion.div
            variants={fadeIn}
            className="hidden lg:col-span-5 lg:flex items-center justify-center relative z-30"
          >
            {/* Soft background blob for the visual - adjusted opacity and blur for light background */}
            <motion.div
              style={{ translateX: floatX, translateY: floatY }}
              className="absolute -inset-6 m-auto w-[420px] h-[300px] rounded-3xl blur-3xl opacity-40"
              aria-hidden
            >
              <div
                className="w-full h-full rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.1))",
                }}
              />
            </motion.div>
            <motion.div // Kept mouse following effects
              style={{
                translateX: useTransform(mouseX, (v) => `${v * 18}px`),
                translateY: useTransform(mouseY, (v) => `${v * 10}px`),
                rotateY: useTransform(mouseX, (v) => `${v * -6}deg`),
                rotateX: useTransform(mouseY, (v) => `${v * 6}deg`),
              }}
              className="relative w-[360px] sm:w-[420px] lg:w-[480px]"
            >
              {/* Small floating card: Adjusted background for light theme */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="absolute -left-6 -top-8 w-36 h-44 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl hidden sm:block"
              />
              {/* Main Visual Box: Border updated */}
              <motion.div
                initial={{ scale: 0.98, opacity: 0.95 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="rounded-2xl overflow-hidden border-8 border-white shadow-[0_30px_90px_rgba(30,58,138,0.12)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src="https://img.freepik.com/premium-photo/png-young-university-graduate-american-man-graduation-finger-adult_53876-765521.jpg?semt=ais_hybrid&w=740&q=80"
                  alt="Students collaborating illustration"
                  loading="lazy"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-0 top-0 w-2/3 h-1/2 bg-gradient-to-tr from-white/20 to-transparent blur-sm mix-blend-screen" />
                  <div className="absolute right-0 bottom-0 w-1/2 h-1/3 bg-gradient-to-br from-pink-50/30 to-transparent blur-sm mix-blend-screen" />
                </div>
              </motion.div>
              {/* Bottom Card: Adjusted background for light theme */}
              <motion.div
                whileHover={{ y: -4 }}
                className="mt-6 p-4 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-lg flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#f59e0b"
                      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Top-rated guidance
                  </div>
                  <div className="text-xs text-slate-600">
                    Students rated 4.8/5 on outcome & service
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------- FeatureCard ------------------------- */
function FeatureCard({
  icon,
  title,
  subtitle,
  mouseX,
  mouseY,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const tx = useTransform(mouseX, (v: number) => `${v * 8}px`);
  const ty = useTransform(mouseY, (v: number) => `${v * 6}px`); // Define a custom variant for feature cards if you want them to stagger internally (e.g., scale up)
  const cardFadeIn = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };
  return (
    <motion.div
      style={{ translateX: tx, translateY: ty }}
      whileHover={{ scale: 1.04 }}
      variants={cardFadeIn} // Apply local variant
      className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-lg"
      role="group"
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <div className="flex-none w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-600 mt-1">{subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}
