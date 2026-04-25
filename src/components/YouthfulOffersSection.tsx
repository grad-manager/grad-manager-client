import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { FaBolt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import type { Feature } from "../data/homePageData";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { shouldRestrictAppAccess } from "../utils/trial";

interface YouthfulOffersSectionProps {
  currentUser: { displayName?: string | null; uid?: string | null } | null;
  platformFeatures: Feature[];
  setModalFeature: React.Dispatch<React.SetStateAction<Feature | null>>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: { opacity: 0, y: 30, scale: 0.95 },
};

const colorStyles: Record<
  string,
  { border: string; bg: string; text: string; btn: string; btnHover: string }
> = {
  purple: {
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-800",
    btn: "bg-purple-600",
    btnHover: "hover:bg-purple-700",
  },
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-800",
    btn: "bg-blue-600",
    btnHover: "hover:bg-blue-700",
  },
  cyan: {
    border: "border-cyan-200",
    bg: "bg-cyan-50",
    text: "text-cyan-800",
    btn: "bg-cyan-600",
    btnHover: "hover:bg-cyan-700",
  },
  green: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-800",
    btn: "bg-green-600",
    btnHover: "hover:bg-green-700",
  },
  indigo: {
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    btn: "bg-indigo-600",
    btnHover: "hover:bg-indigo-700",
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-800",
    btn: "bg-red-600",
    btnHover: "hover:bg-red-700",
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    btn: "bg-amber-600",
    btnHover: "hover:bg-amber-700",
  },
  pink: {
    border: "border-pink-200",
    bg: "bg-pink-50",
    text: "text-pink-800",
    btn: "bg-pink-600",
    btnHover: "hover:bg-pink-700",
  },
  orange: {
    border: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-orange-800",
    btn: "bg-orange-600",
    btnHover: "hover:bg-orange-700",
  },
};

const NAVBAR_OFFSET_PX = 96;

const loggedInCards = [
  {
    title: "Discover Programs",
    desc: "Search thousands of funded graduate programs and scholarships.",
    link: "/programs",
    color: "purple",
    btn: "Start Exploring",
  },
  {
    title: "Your Application Progress",
    desc: "See your tracked programs and application status at a glance.",
    link: "/tracker",
    color: "blue",
    btn: "View My Tracker Board",
  },
  {
    title: "AI Application Predictor",
    desc: "Predict your admission chances based on your profile and target programs.",
    link: "/ai-predictor",
    color: "cyan",
    btn: "Check Your Chances",
  },
  {
    title: "ESSAY, SOP & CV Writing",
    desc: "Get one-on-one help to craft compelling application documents.",
    link: "/services/documents",
    color: "green",
    btn: "Request Help",
  },
  {
    title: "Join Ongoing Projects",
    desc: "Collaborate on research and community projects to boost your CV and gain experience.",
    link: "/projects",
    color: "indigo",
    btn: "View Projects",
  },
  {
    title: "Interview Preparation",
    desc: "Ace your admissions and visa interviews with mock sessions and expert feedback.",
    link: "/interview-prep",
    color: "red",
    btn: "Explore Services",
  },
  {
    title: "Application Blog & News",
    desc: "Stay updated with the latest tips, success stories, and visa policy changes.",
    link: "/blog",
    color: "amber",
    btn: "Read the Latest",
  },
  {
    title: "Connect & Chat",
    desc: "Your space to chat, gist, form groups, and find accountability partners.",
    link: "/community",
    color: "pink",
    btn: "Start Chatting",
  },
  {
    title: "Connect with a Mentor",
    desc: "Get personalized advice from a current grad student or professional.",
    link: "/mentorship",
    color: "orange",
    btn: "Find a Mentor",
  },
];

export default function YouthfulOffersSection({
  currentUser,
  platformFeatures,
  setModalFeature,
}: YouthfulOffersSectionProps) {
  const { userProfile } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [fetchedFirstName, setFetchedFirstName] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const displayedFeatures = showAll ? platformFeatures : platformFeatures.slice(0, 4);
  const isSubscriptionLocked = !!currentUser && shouldRestrictAppAccess(userProfile);

  useEffect(() => {
    if (!currentUser?.uid) {
      setFetchedFirstName(null);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid as string));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFetchedFirstName(data.firstName || data.displayName?.split(" ")[0] || null);
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile for greeting:", error);
      }

      setFetchedFirstName(currentUser.displayName?.split(" ")[0] || null);
    };

    void fetchUserProfile();
  }, [currentUser]);

  const userGreetingName = useMemo(() => {
    const defaultDisplayName = currentUser?.displayName?.split(" ")[0] || null;
    return fetchedFirstName || defaultDisplayName || "Your";
  }, [currentUser, fetchedFirstName]);

  const resolveCardLink = (link: string) => {
    if (!isSubscriptionLocked) return link;
    return `/subscribe?reason=trial-expired&next=${encodeURIComponent(link)}`;
  };

  const handleToggle = () => {
    if (showAll && sectionRef.current) {
      const topPosition =
        sectionRef.current.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET_PX;
      window.scrollTo({ top: topPosition, behavior: "smooth" });
    }

    setShowAll((prev) => !prev);
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className={`relative overflow-hidden pt-20 pb-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 ${
        currentUser ? "" : "-mt-20"
      }`}
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="h-24 -mt-24" aria-hidden="true" />

        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {currentUser ? `${userGreetingName}'s Dashboard` : "What Grad Manager Offers"}
        </motion.h2>

        <motion.p
          className="max-w-2xl mx-auto text-center mt-4 text-gray-600 text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.08 }}
        >
          {currentUser
            ? `Welcome back, ${userGreetingName}! Our powerful tools are here to help you every step of the way.`
            : "From discovery to mentorship, everything you need in one sleek dashboard."}
        </motion.p>

        {currentUser ? (
          <motion.div
            className="mt-14 grid gap-6 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {loggedInCards.map((card) => {
              const styles = colorStyles[card.color];

              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border ${styles.border} ${styles.bg} hover:scale-[1.02] transition-all duration-500`}
                >
                  <h4 className={`font-bold text-base sm:text-lg ${styles.text} mb-2`}>
                    {card.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{card.desc}</p>
                  <Link
                    to={resolveCardLink(card.link)}
                    className={`mt-4 inline-block px-4 py-2 sm:px-5 sm:py-2 rounded-full text-sm sm:text-base font-semibold text-white ${styles.btn} ${styles.btnHover} transition`}
                  >
                    {isSubscriptionLocked ? "Subscribe to Access" : card.btn}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mt-14 grid gap-6 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {displayedFeatures.map((feat) => {
                  const featureForModal = { ...feat } as Partial<Feature>;
                  delete featureForModal.src;
                  delete featureForModal.fullImage;

                  return (
                    <motion.div
                      key={feat.title}
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                      className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-transparent bg-white/80 backdrop-blur-md overflow-hidden group hover:scale-[1.02] hover:shadow-xl transition-all duration-500"
                    >
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="hidden sm:flex rounded-full w-14 h-14 items-center justify-center bg-gradient-to-tr from-blue-100 to-purple-100 text-primary mb-4 sm:mb-6">
                          {feat.icon ?? <FaBolt />}
                        </div>

                        <h4 className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                          {feat.title}
                        </h4>

                        <div className="w-full h-28 sm:h-40 mt-3 sm:mt-4 overflow-hidden rounded-xl">
                          {feat.src ? (
                            <img
                              src={feat.src}
                              alt={feat.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>

                        <p className="mt-3 sm:mt-4 text-sm text-gray-600 flex-grow line-clamp-3">
                          {feat.desc}
                        </p>

                        <button
                          onClick={() => setModalFeature(featureForModal as Feature)}
                          className="mt-3 sm:mt-4 self-start text-sm font-semibold text-blue-600 hover:underline"
                        >
                          See More
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <div className="mt-8 sm:mt-10 flex justify-center">
              <button
                onClick={handleToggle}
                className="px-5 py-2 sm:px-6 sm:py-2 rounded-full font-semibold text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 transition"
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
