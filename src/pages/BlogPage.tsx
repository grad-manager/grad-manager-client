import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaTimes, FaSearch, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getEffectivePlanLabel } from '../utils/trial';

// Blog post type
interface BlogPost {
  title: string;
  date: string;
  image: string;
  blurb: string;
  fullContent: string;
  category: string;
  author: string;
  authorImage: string;
}

// Animations
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const item = { hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6 } } };

// Blog posts (unchanged)
const blogPosts: BlogPost[] = [
  {
    title: 'How to Write a Winning Statement of Purpose',
    date: 'Aug 1, 2025',
    image: 'https://blog.scholarden.com/wp-content/uploads/2022/01/Time-Management-on-the-GRE-1680-%C3%97-945-px-14-1536x864-1-1024x576.webp',
    blurb: 'Your SOP is your story. Learn to craft a compelling narrative that stands out to admissions committees and secures your spot.',
    fullContent: `Your Statement of Purpose (SOP) is one of the most critical components of your application. It’s your opportunity to tell your story, share your motivations, and convince the admissions committee that you are the perfect fit for their program.

    A winning SOP is not just a list of your accomplishments. It’s a narrative that connects your past experiences—academic, professional, and personal—to your future goals. Start with a captivating opening that grabs the reader’s attention, and then build a compelling argument for why you are a strong candidate.

    Focus on detailing your research interests, explaining why you're interested in this specific program, and mentioning any faculty members you hope to work with. Conclude with a powerful summary that reiterates your passion and commitment. A well-crafted SOP can make all the difference.`,
    category: 'Applications',
    author: 'Sarah Lee',
    authorImage: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    title: 'The Ultimate Guide to Getting a Reference Letter',
    date: 'Jul 25, 2025',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4M1XO1Ee4sH3gE5AqbKdbSMuje373qbUOfTMVLVimCIGCiDbPlMx4dwXhscsj7XAr3E&usqp=CAU',
    blurb: 'A great reference letter can make all the difference. Find out how to approach professors and secure the best recommendations.',
    fullContent: `A strong reference letter can significantly boost your application. The key is to ask the right person at the right time. Start by identifying professors or employers who know you well and can speak to your strengths, skills, and potential.

    It's crucial to give your recommenders plenty of time—at least a month—to write the letter. Provide them with a "recommender packet" that includes your CV, personal statement, and a list of the programs you're applying to with their deadlines. This makes their job easier and ensures they can write a detailed and personalized letter.

    Always follow up with a thank-you note, whether the outcome is a letter or not. Building and maintaining these professional relationships is a valuable part of your academic journey.`,
    category: 'Tips',
    author: 'Dr. Michael Chen',
    authorImage: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    title: 'Navigating Application Fee Waivers and Deadlines',
    date: 'Jul 18, 2025',
    image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=800&q=80&auto=format&fit=crop',
    blurb: 'Don’t let fees and deadlines stop you. We’ve compiled a list of schools that offer waivers and tips to keep your applications on track.',
    fullContent: `Application fees can be a significant barrier for many students. Fortunately, many universities offer fee waivers based on financial need, participation in certain programs, or other criteria.

    Begin your search early to identify schools that offer these waivers. Many graduate programs have specific forms or processes for requesting a waiver. It's often as simple as emailing the admissions office or filling out a form on the program's website.

    Staying on top of deadlines is equally important. Create a master spreadsheet with all your program deadlines, required materials, and contact information. This will help you stay organized and ensure you submit everything on time.`,
    category: 'Finance',
    author: 'Emily Johnson',
    authorImage: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    title: 'Crafting the Perfect Academic CV for Graduate School',
    date: 'Jul 10, 2025',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80&auto=format&fit=crop',
    blurb: 'An academic CV is different from a professional resume. Learn the key elements and what to include to highlight your research and publications.',
    fullContent: `An academic CV is a comprehensive document that highlights your scholarly achievements, not just your professional work history. While a resume is typically one page, a CV can be much longer, detailing your research, publications, presentations, and teaching experience.

    Key sections to include are: Education, Research Experience, Publications, Conference Presentations, Awards and Honors, and Teaching Experience. Unlike a resume, you should list everything in chronological order, with the most recent items first.

    Highlight your specific contributions to research projects and quantify your accomplishments whenever possible. A well-organized and detailed CV demonstrates your commitment to a career in academia.`,
    category: 'Career',
    author: 'James Carter',
    authorImage: 'https://randomuser.me/api/portraits/men/85.jpg'
  },
  {
    title: 'Finding Your Graduate School Mentor',
    date: 'Jul 3, 2025',
    image: 'https://images.squarespace-cdn.com/content/v1/5f8ef4dc9476572b4d6c99cd/84529f71-8524-40b4-984e-6b5b79d876d4/header+mentoring+101.png',
    blurb: 'A good mentor can be the key to your success. Discover strategies for identifying and reaching out to potential mentors in your field.',
    fullContent: `A strong mentor-mentee relationship is invaluable in graduate school. A mentor can guide your research, provide career advice, and connect you with key figures in your field.

    To find a mentor, start by researching faculty members whose work aligns with your interests. Read their publications, attend their seminars, and reach out to them to express your interest. A good initial email should be brief and respectful, mentioning a specific aspect of their work that you find compelling.

    Remember, a mentor doesn't have to be a faculty member. They can be a senior student, a postdoctoral researcher, or a professional in your industry. The goal is to find someone who can offer guidance and support throughout your journey.`,
    category: 'Mentorship',
    author: 'Olivia Brown',
    authorImage: 'https://randomuser.me/api/portraits/women/12.jpg'
  },
  {
    title: 'The Power of Cold Emails to Professors',
    date: 'Jun 28, 2025',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    blurb: 'Learn how to write a compelling cold email to a professor to discuss research opportunities or potential supervision.',
    fullContent: `A well-written cold email can open doors to research opportunities and potential supervision. The key is to be concise, professional, and targeted.

    Start with a clear subject line that immediately communicates your purpose, such as "Prospective Graduate Student Inquiry: [Your Name]". In the body, introduce yourself, state your academic background, and explain why you are interested in their work. Be specific! Mention a particular paper or project of theirs that you admire.

    End the email with a clear call to action, such as asking for a brief meeting or if they are accepting new students. Attach your CV and a transcript to make it easy for them to review your qualifications.`,
    category: 'Networking',
    author: 'Daniel Kim',
    authorImage: 'https://randomuser.me/api/portraits/men/27.jpg'
  },
  {
    title: 'How to Prepare for a Graduate School Interview',
    date: 'Aug 8, 2025',
    image: 'https://making-waves.org/wp-content/uploads/2023/04/making-waves-job-internship-interview-tips-1.png',
    blurb: 'Interviews are a critical part of the process. We break down common questions and strategies to help you ace your interview.',
    fullContent: `The graduate school interview is your chance to shine and show the admissions committee your passion, knowledge, and personality. Preparation is key to a successful interview.

    Start by researching the program and the faculty members you'll be meeting. Be prepared to discuss your past research, your future goals, and why you are interested in their specific program. You should also prepare a few questions to ask them, as this shows genuine interest.

    Practice your answers to common questions like "Tell me about yourself" and "Why this program?" Remember to be confident and enthusiastic. Your passion for the subject can be as important as your academic record.`,
    category: 'Interviews',
    author: 'Sophia Martinez',
    authorImage: 'https://randomuser.me/api/portraits/women/49.jpg'
  },
  {
    title: 'Choosing the Right Program for Your Career Goals',
    date: 'Aug 15, 2025',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6okOEM7jcnnK3E9GbP6trlRXxdZkTPDa0BQ&s',
    blurb: 'With so many options, choosing a program can be tough. Our guide helps you align your academic interests with your long-term career aspirations.',
    fullContent: `Selecting a graduate program is a major decision. It’s not just about the program's reputation; it’s about finding the right fit for your academic interests and career aspirations.

    Consider the program's curriculum, faculty, research opportunities, and resources. Does the program offer courses that align with your passions? Are there faculty members whose work excites you? Will the degree prepare you for the career path you envision?

    Don't hesitate to reach out to current students and alumni. Their insights can provide a more realistic picture of the program's strengths and weaknesses, helping you make an informed decision.`,
    category: 'Applications',
    author: 'William Davis',
    authorImage: 'https://randomuser.me/api/portraits/men/11.jpg'
  },
  {
    title: 'Mastering the Art of Networking in Academia',
    date: 'Aug 22, 2025',
    image: 'https://media.licdn.com/dms/image/v2/D4E12AQHTzisRUekK7g/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1721169482262?e=2147483647&v=beta&t=Bh7M3MpvGJ9Y3K2bryge2lmTiPf_sNDbjwSu5avOGew',
    blurb: 'Building connections is essential. Learn how to network effectively at conferences, seminars, and on social media to build your professional circle.',
    fullContent: `Networking is not just for the corporate world; it's a vital skill in academia. Building a strong professional network can lead to research collaborations, job opportunities, and lifelong friendships.

    Start by attending conferences, seminars, and workshops in your field. Don't be afraid to introduce yourself to speakers and other attendees. A simple, "I really enjoyed your talk on X; I'm a student interested in Y," can start a valuable conversation.

    Online platforms like LinkedIn and Twitter can also be powerful networking tools. Follow influential scholars and labs, engage with their posts, and share your own work. This helps you stay informed and visible within your academic community.`,
    category: 'Networking',
    author: 'Dr. Aisha Patel',
    authorImage: 'https://randomuser.me/api/portraits/women/21.jpg'
  }
];


export default function BlogPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const openModal = (post: BlogPost) => setSelectedPost(post);
  const closeModal = () => setSelectedPost(null);

  const userPlan = getEffectivePlanLabel(userProfile);
  const canAccessBlog = userPlan !== 'Free';

  // Block non-authenticated users from accessing blog
  if (!currentUser) {
    return (
      <div className="min-h-screen mt-24 font-sans text-neutral-900">
        <section className="bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12 sm:py-16 px-4 sm:px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GradManager Blog
            </h1>
            <p className="max-w-3xl mx-auto mt-4 text-base sm:text-lg text-gray-700">
              Your go-to resource for tips, guides, and inspiration on your graduate school journey.
            </p>
          </div>
        </section>

        <section className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <FaLock className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Sign in to access our blog and exclusive articles on application tips, scholarship guides, and more.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Sign In
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Block Free users from accessing blog
  if (!canAccessBlog) {
    return (
      <div className="min-h-screen mt-24 font-sans text-neutral-900">
        <section className="bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12 sm:py-16 px-4 sm:px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GradManager Blog
            </h1>
            <p className="max-w-3xl mx-auto mt-4 text-base sm:text-lg text-gray-700">
              Your go-to resource for tips, guides, and inspiration on your graduate school journey.
            </p>
          </div>
        </section>

        <section className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <FaLock className="text-6xl text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pro Feature</h2>
            <p className="text-gray-600 mb-2">
              Access to our blog is available for Pro subscribers.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Get expert tips, scholarship guides, and success stories to ace your applications.
            </p>
            <button
              onClick={() => navigate('/subscribe')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Upgrade to Pro
            </button>
          </div>
        </section>
      </div>
    );
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  // Extract categories dynamically
  const categories = ["All", ...new Set(blogPosts.map((p) => p.category))];

  // Filtered posts by search + category
  const filteredPosts = blogPosts.filter(post =>
    (selectedCategory === "All" || post.category === selectedCategory) &&
    (post.title.toLowerCase().includes(search.toLowerCase()) ||
     post.blurb.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen mt-24 font-sans text-neutral-900">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            GradManager Blog
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-base sm:text-lg text-gray-700">
            Your go-to resource for tips, guides, and inspiration on your graduate school journey.
          </p>
        </div>
      </section>

      

      {/* Search + Category Filter */}
      <section className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 py-8 sm:py-10 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md px-4 sm:px-5 py-2 sm:py-3 w-full md:w-1/2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blog posts..."
                className="w-full bg-transparent outline-none text-gray-700 text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow text-xs sm:text-sm font-semibold transition ${
                    selectedCategory === cat 
                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white" 
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" 
            variants={container} 
            initial="hidden" 
            animate="show"
          >
            {filteredPosts.map((post, i) => (
              <motion.div 
                key={i} 
                variants={item} 
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <img src={post.image} alt={post.title} className="w-full h-40 sm:h-48 object-cover" loading="lazy" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-600 rounded-full">{post.category}</span>
                  </div>
                  <h4 className="font-bold text-lg sm:text-xl mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{post.title}</h4>
                  <p className="mt-2 text-gray-600 text-xs sm:text-sm h-12 sm:h-14 overflow-hidden">{post.blurb}</p>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <img src={post.authorImage} alt={post.author} loading="lazy" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
                    <span className="text-xs sm:text-sm text-gray-500">{post.author}</span>
                  </div>
                  
                  <div className="mt-4">
                    <div 
                      onClick={() => openModal(post)} 
                      className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer text-sm"
                    >
                      Read more <FaBolt />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-purple-100 via-pink-50 to-red-100 py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Stay Updated 🚀
          </h2>
          <p className="mt-3 text-gray-700 text-sm sm:text-base">Subscribe to our newsletter to get the latest tips directly in your inbox.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 bg-white rounded-2xl shadow-md px-4 py-2 sm:py-3 w-full">
            <FaEnvelope className="text-gray-500 hidden sm:block" />
            <input type="email" placeholder="Enter your email" className="w-full bg-transparent outline-none text-sm sm:text-base" />
            <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow hover:scale-105 transition text-sm sm:text-base">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Full Blog Post Content */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 transition z-10"
              >
                <FaTimes size={22} className="sm:w-6 sm:h-6" />
              </button>
              <img src={selectedPost.image} alt={selectedPost.title} loading="lazy" className="w-full h-48 sm:h-72 object-cover rounded-t-2xl sm:rounded-t-3xl" />
              <div className="p-5 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{selectedPost.title}</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">{selectedPost.date} • {selectedPost.category}</p>
                
                <div className="flex items-center gap-3 mt-3">
                  <img src={selectedPost.authorImage} alt={selectedPost.author} loading="lazy" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">{selectedPost.author}</span>
                </div>

                <p className="mt-6 text-gray-700 text-sm sm:text-lg leading-relaxed whitespace-pre-wrap">{selectedPost.fullContent}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
