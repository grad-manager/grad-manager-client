import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function DemoSection() {
  return (
    <section className="relative overflow-hidden -mt-20 -mb-8 py-28 bg-gradient-to-br from-white via-blue-50 to-purple-100">
      {/* Floating Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-pink-400/30 to-indigo-400/30 blur-3xl"
        animate={{ y: [0, 25, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      {/* Glass Card Container */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-extrabold leading-tight font-display 
                     bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500 
                     bg-clip-text text-transparent drop-shadow-md"
        >
          See Grad Manager in Action 🚀
        </motion.h2>

        {/* Animated Underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 h-1.5 w-32 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-neutral-700 font-medium"
        >
          Watch this short walkthrough to see how{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
            Grad Manager
          </span>{" "}
          works.
        </motion.p>

        {/* Glassmorphic Video Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative mt-12 max-w-5xl mx-auto rounded-2xl p-[3px] 
                     bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient 
                     shadow-2xl"
        >
          <div className="rounded-2xl bg-white/70 backdrop-blur-lg overflow-hidden border border-white/40">
            <video
              src="https://res.cloudinary.com/ds7uxn9qt/video/upload/v1761188094/IMG_4060_cvy1ho.mp4"
              title="GradManager Demo"
              controls
              className="w-full h-[56.25vw] max-h-[600px] md:h-[480px]"
            />
          </div>
        </motion.div>

        {/* CTA Buttons (hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          viewport={{ once: true }}
          className="mt-10 hidden md:flex justify-center gap-6 flex-wrap"
        >
          <button className="px-8 py-3 text-lg font-semibold rounded-full text-white 
                             bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500 
                             shadow-lg hover:scale-105 transition-transform">
            <Link to="/signup" className="text-white">Get Started</Link>
          </button>
          <button className="px-8 py-3 text-lg font-semibold rounded-full text-blue-600 
                             bg-white/80 backdrop-blur-lg border border-blue-200 
                             shadow-md hover:scale-105 transition-transform">
            <Link to="/about">Learn More</Link>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
