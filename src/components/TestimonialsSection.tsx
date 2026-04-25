// src/components/TestimonialsSection.tsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import type { Testimonial } from "../data/homePageData";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const controls = useAnimation();
  const loopedTestimonials = [...testimonials, ...testimonials]; // Duplicate for infinite effect

  // Start infinite scroll
  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        ease: "linear",
        duration: 20,
        repeat: Infinity,
      },
    });
  }, [controls]);

  // Pause handler
  const handlePause = () => {
    controls.stop();
  };

  // Resume handler
  const handleResume = () => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        ease: "linear",
        duration: 20,
        repeat: Infinity,
      },
    });
  };

  return (
    <section className="relative py-24 overflow-hidden -mt-28 -mb-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background Glow Accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold font-display mb-12 text-center
            bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-md"
        >
          What Our Users Say ✨
        </motion.h2>

        {/* Infinite Auto-Scroll Carousel */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        >
          <motion.div className="flex gap-6" animate={controls}>
            {loopedTestimonials.map((t, idx) => (
              <motion.div
                key={idx}
                className="relative flex-shrink-0 w-80 bg-white/80 backdrop-blur-lg p-8 rounded-2xl 
                shadow-lg border border-white/40 hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                {/* Glow accent */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full 
                  bg-gradient-to-tr from-blue-500 to-pink-500 blur-xl opacity-60"></div>

                {/* User image */}
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  className="relative w-20 h-20 mx-auto rounded-full border-4 border-white shadow-md mb-6 object-cover"
                />

                {/* Quote */}
                <p className="text-neutral-700 italic mb-6 leading-relaxed">“{t.quote}”</p>

                {/* Name + role */}
                <h4 className="font-semibold text-lg text-neutral-900">{t.name}</h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
