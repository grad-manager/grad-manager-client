// src/data/homePageData.ts

import type { ReactNode } from "react";
import {
  FaGraduationCap,
  FaSearchDollar,
  FaCalendarAlt,
  FaUserFriends,
  FaPenNib,
  FaUsers,
  FaBrain,
  FaVideo,
} from "react-icons/fa";


// TODO: Replace with actual images once available in the assets folder
// Import local images for platform features (These should remain local imports for bundler optimization)
import scholarshipImage from "../assets/images/web 5.png";
import calendarImage from "../assets/images/web 5.png";
import SOP from "../assets/images/SOP.jpg";
import Project2 from "../assets/images/web 5.png";
import mentorImage from "../assets/images/web 5.png";
import blogImage from "../assets/images/web 5.png";
import connectImage from "../assets/images/web 5.png";
import interviewImage from "../assets/images/web 5.png";
import aiPredictorImage from "../assets/images/web 5.png";

// --- Type definitions ---
export interface Scholarship {
  name: string;
  location: string;
  level: string;
  funding: string;
  deadline: string;
  blurb: string;
  image: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image: string; // This will now be a public path: /images/user.jpg
}

export interface BlogPost {
  title: string;
  date: string;
  blurb: string;
  image: string;
  link: string;
}

export interface Feature {
  icon: ReactNode;
  title: string;
  desc: string;
  src: string;
  fullDesc: string;
  fullImage: string;
}

export interface Step {
  icon: ReactNode;
  title: string;
  desc: string;
  img: string;
}

// --- NEW INTERFACE FOR DYNAMIC SHOWCASE CARDS ---
export interface DynamicFeature {
  title: string;
  blurb: string;
  tag: string; // Used for deadline/role/certainty
  icon: ReactNode; // Icon to replace image in the card body
}

// --- Data for the home page sections ---
export const platformFeatures: Feature[] = [
  {
    icon: <FaSearchDollar className="text-2xl" />,
    src: scholarshipImage,
    title: "Graduate Program Search",
    desc: "Find schools faster. Filter by program, funding, waiver (app fee, GRE, IELTS) - no more endless searching.",
    fullDesc:
      "Our advanced search engine allows you to filter and discover thousands of graduate programs with funding. You can search by degree level, subject, location, and even specific research interests. We provide verified information on funding availability, application fees, and key requirements, helping you save time and focus on the best-fit opportunities. The platform also gives you a personalized dashboard to track and manage your potential programs.",
    fullImage: scholarshipImage,
  },
  {
    icon: <FaCalendarAlt className="text-2xl" />,
    src: calendarImage,
    title: "Application Progress Tracker",
    desc: "See all your applications at a glance. Track from 'Interested' to 'Accepted' without losing count.",
    fullDesc:
      'The GradManager dashboard is your central hub for all applications. It features a customisable kanban board and a calendar view, allowing you to track each program from "Researching" to "Accepted." You can upload documents, add notes, set reminders, and manage your to-do lists all in one place, ensuring you never miss a critical step.',
    fullImage: calendarImage,
  },
  {
    icon: <FaBrain className="text-2xl" />,
    src: aiPredictorImage,
    title: "AI Application Predictor",
    desc: "Boost your chances of getting in! Our AI predicts your probability of admission into your dream school using key data points.",
    fullDesc:
      "Curious about your chances of admission? Our AI Application Predictor analyzes thousands of data points from previous successful applicants to provide a personalized prediction of your admission probability. By entering your GPA, test scores, research experience, and other key details, you can see how you stack up against the competition. This powerful tool helps you make data-driven decisions about where to apply, maximizing your chances of success.",
    fullImage: aiPredictorImage,
  },
  {
    icon: <FaPenNib className="text-2xl" />,
    src: SOP,
    title: "ESSAY, SOP & CV Writing",
    desc: "Struggling with your first draft? Get paired with a mentor who will co-write your SOP and CV from scratch with you over Zoom, guiding you step by step.",
    fullDesc:
      "Feeling overwhelmed staring at a blank page? You’re not alone—most students struggle to put their dreams into words. That’s where we come in. In a live Zoom session, you’ll work one-on-one with an expert mentor who understands the pressure you’re under. Together, we’ll turn your raw ideas into a polished SOP and CV that capture your true potential. No more second-guessing or rejection fears—just powerful, professional documents that open doors and give you the confidence to chase your future.",
    fullImage: SOP,
  },
  {
    icon: <FaUsers className="text-2xl" />,
    src: Project2,
    title: "Join Ongoing Projects",
    desc: "Worried your CV is not strong enough? Collaborate on real projects with peers to boost your portfolio (e.g write review papers for publications, build a model, do research e.t.c).",
    fullDesc:
      "Worried your CV isn’t enough? Stand out by collaborating on real projects with driven peers—whether it’s writing impactful review papers, building innovative models, or contributing to research that gets noticed. Not only will you strengthen your portfolio, but you’ll also gain the kind of hands-on experience and credibility that admissions committees and employers truly value.",
    fullImage: Project2,
  },
  {
    icon: <FaVideo className="text-2xl" />,
    src: interviewImage,
    title: "Interview Preparation",
    desc: "Nervous about your interview? Get expert guidance on what questions to expect and how to ace them with confidence. We offer mock interview sessions with feedback on your responses and body language.",
    fullDesc:
      "Ace your interviews with confidence! Our interview preparation service provides comprehensive guidance for both graduate school admissions and visa interviews. You’ll receive personalized coaching on how to structure your answers, present your research interests effectively, and articulate your career goals. We offer mock interviews with experienced mentors who will provide constructive feedback to help you refine your communication skills and impress the admissions committee.",
    fullImage: interviewImage,
  },
  {
    icon: <FaGraduationCap className="text-2xl" />,
    src: blogImage,
    title: "Application Blog & News",
    desc: "You will find curated and organized content and videos to help you along the process, from how to craft award-winning SOPs to approaching your referees, e.t.c.",
    fullDesc:
      "We have a library of resources to help you with every stage of the application process. From sample essays to video tutorials on approaching referees, our blog and resource center is designed to provide you with the tools and knowledge you need to succeed. Our content is curated by scholarship winners and admissions professionals.",
    fullImage: blogImage,
  },
  {
    icon: <FaUserFriends className="text-2xl" />,
    src: connectImage,
    title: "Connect & Chat",
    desc: "You get to find other applicants, form accountability partner and navigate grad school process together. There is also a community page to connect at large. Offline meetup is also a possibility",
    fullDesc:
      "The journey to graduate school is easier with a community. Our platform allows you to connect with other applicants from similar backgrounds and interests. You can form accountability partnerships, share tips, and support each other. We also host a community page for broader discussions and even facilitate offline meetups for local members.",
    fullImage: connectImage,
  },
  {
    icon: <FaUserFriends className="text-2xl" />,
    src: mentorImage,
    title: "Connect with a Mentor",
    desc: "This allows you to find a scholarship mentor and/or alumni of a specific scholarship or specific school.",
    fullDesc:
      "Once you get that interview invitation, GradManager offers comprehensive resources to help you prepare. Practice with mock interviews, get feedback on your responses, and learn the common questions and strategies for your specific program. Our mentors will help you build the confidence and skills needed to impress the admissions committee.",
    fullImage: mentorImage,
  },
];

export const featuredScholarships: Scholarship[] = [
  {
    name: "Rice University",
    location: "United States",
    level: "Masters",
    funding: "Full Scholarship",
    deadline: "2025-12-01",
    blurb:
      "Full tuition + stipend for outstanding international students in STEM & Social Sciences. Covers travel and living allowance.",
    image:
      "https://questbridge.imgix.net/content/uploads/partners/rice-university/University_Lockups_Print_Rice_Blue-1.png?auto=compress%2Cformat&fit=clip&h=384&q=90&s=f18020c84f8ca5a4777f9ddd296519cc",
  },
  {
    name: "Massachusetts Institute of Technology (MIT)",
    location: "USA (virtual + campus)",
    level: "Masters & PhD",
    funding: "Tuition + Stipend",
    deadline: "2025-12-01",
    blurb:
      "Supporting researchers and practitioners from Africa with funding, mentorship and placement opportunities.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdM5ksmAFMHhM9XaNNnqDfxCFxFb3LfBXLjA&s",
  },
  {
    name: "University of California, Berkeley",
    location: "California",
    level: "MBA",
    funding: "Partial Scholarships",
    deadline: "2025-12-01",
    blurb:
      "Merit-based partial scholarships and waived application fee for select MBA applicants.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg",
  },
];

// --- NEW DATA FOR DYNAMIC SHOWCASE CARDS (Added for dynamic display) ---

// Data for Program/Scholarship Showcase (Card 1)
export const dynamicScholarships: DynamicFeature[] = [
  {
    title: "King's College London",
    blurb:
      "Fully funded grant for graduate study in the U.K. for international students.",
    tag: "Deadline: Oct 1, 2025",
    icon: <FaGraduationCap className="text-3xl text-blue-600" />,
  },
  {
    title: "Rice University",
    blurb:
      "All Ph.D. students are fully funded through a combination of Teaching Assistantships (TA) and Research Assistantships (RA) for five years.",
    tag: "Deadline: Dec 10, 2025",
    icon: <FaGraduationCap className="text-3xl text-blue-600" />,
  },
  {
    title: "Shanghai Jiao Tong University (China)",
    blurb:
      "Fully funded one-year Master’s program at Shanghai Jiao Tong University in Beijing.",
    tag: "Deadline: Sep 12, 2025",
    icon: <FaGraduationCap className="text-3xl text-blue-600" />,
  },
];

// Data for Ongoing Projects Showcase (Card 2)
export const featuredProjects: DynamicFeature[] = [
  {
    title: "Review Paper: AI in Sustainable Energy",
    blurb:
      "Collaborate with a team to publish a literature review for a high-impact journal. All majors welcome.",
    tag: "Role: Co-Author",
    icon: <FaPenNib className="text-3xl text-purple-600" />,
  },
  {
    title: "Building a Loan Default Prediction Model",
    blurb:
      "Join a data science team using Python/R to predict financial risk. Experience in ML is a plus.",
    tag: "Role: Data Analyst",
    icon: <FaUsers className="text-3xl text-purple-600" />,
  },
  {
    title: "Development of an EdTech Platform Feature",
    blurb:
      "Work with the GradManager dev team on a real-world software feature (React/Node).",
    tag: "Role: Contributor",
    icon: <FaUsers className="text-3xl text-purple-600" />,
  },
];

// Data for AI Predictor Showcase (Card 3)
export const predictorHighlights: DynamicFeature[] = [
  {
    title: "Admission Certainty: 85%",
    blurb:
      "Based on your profile (GPA 3.8, GRE 325, 2 Pubs) for Rice University.",
    tag: "Decision: Low Risk",
    icon: <FaBrain className="text-3xl text-pink-600" />,
  },
  {
    title: "Admission Certainty: 42%",
    blurb:
      "Based on your profile for MIT. Recommend strengthening SOP/Research experience.",
    tag: "Decision: Medium Risk",
    icon: <FaBrain className="text-3xl text-pink-600" />,
  },
  {
    title: "Admission Certainty: 95%",
    blurb:
      "Based on your profile for University of Toronto. Recommend early application.",
    tag: "Decision: Very Low Risk",
    icon: <FaBrain className="text-3xl text-pink-600" />,
  },
];

// --- END OF NEW DATA ---

export const testimonials = [
  {
    name: "Blessing Jumoke",
    role: "PhD Candidate — MIT Neuroscience",
    quote:
      "I discovered fellowships I had never heard of. The AI essay feedback gave me the confidence to apply broadly — now I’m fully funded!",
    image: "/images/testimonials/Avatar.webp", // Changed to public path
  },
  {
    name: "Chinasa Mitchell",
    role: "Masters in Public Policy — Oxford",
    quote:
      "Networking through the Grad Manager community introduced me to alumni mentors who shaped my application strategy.",
    image: "/images/testimonials/Avatar.webp", // Changed to public path
  },
  {
    name: "Adewale Michael",
    role: "Fulbright Scholar 2024",
    quote:
      "Grad Manager turned hours of research into one dashboard. I found funded programs and connected with a mentor who reviewed my SOP — I got in!",
    image: "/images/testimonials/Avatar.webp", // Changed to public path
  },
];

export const steps: Step[] = [
  {
    title: "Search & Discover",
    desc: "Filter programs by funding type, country, field, and application fee to find matches in seconds.",
    icon: <FaSearchDollar className="text-4xl" />,
    img: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1000&q=80&auto=format&fit=crop",
  },
  {
    title: "Track Applications",
    desc: "One place for deadlines, required docs, statuses and notes. Share progress with mentors.",
    icon: <FaCalendarAlt className="text-4xl" />,
    img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1000&q=80&auto=format&fit=crop",
  },
  {
    title: "Get Reviews & Mentorship",
    desc: "Submit essays, CVs, and documents for mentor feedback and iterate until it shines.",
    icon: <FaUserFriends className="text-4xl" />,
    img: "https://images.unsplash.com/photo-1544717305-996b815c338c?w=1000&q=80&auto=format&fit=crop",
  },
  {
    title: "Celebrate Offers",
    desc: "Track your acceptances and next steps — celebrate milestones and plan your next move.",
    icon: <FaGraduationCap className="text-4xl" />,
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=80&auto=format&fit=crop",
  },
];

export const blogPosts = [
  {
    title: "How to Write a Winning Statement of Purpose",
    date: "Aug 1, 2025",
    image:
      "https://blog.scholarden.com/wp-content/uploads/2022/01/Time-Management-on-the-GRE-1680-%C3%97-945-px-14-1536x864-1-1024x576.webp",
    blurb:
      "Your SOP is your story. Learn to craft a compelling narrative that stands out to admissions committees and secures your spot.",
    link: "/blog/sop-guide",
  },
  {
    title: "The Ultimate Guide to Getting a Reference Letter",
    date: "Jul 25, 2025",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4M1XO1Ee4sH3gE5AqbKdbSMuje373qbUOfTMVLVimCIGCiDbPlMx4dwXhscsj7XAr3E&usqp=CAU",
    blurb:
      "A great reference letter can make all the difference. Find out how to approach professors and secure the best recommendations.",
    link: "/blog/reference-letter-guide",
  },
  {
    title: "Navigating Application Fee Waivers and Deadlines",
    date: "Jul 18, 2025",
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop",
    blurb:
      "Don’t let fees and deadlines stop you. We’ve compiled a list of schools that offer waivers and tips to keep your applications on track.",
    link: "/blog/fee-waivers-guide",
  },
];
