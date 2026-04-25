import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaEnvelope, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

export default function ContactPage() {
  const faq = [
    {
      question: "What are your business hours?",
      answer: "Our office is open Monday to Friday from 9:00 AM to 5:00 PM WAT.",
    },
    {
      question: "How long will it take to get a response?",
      answer: "We aim to respond to all inquiries within 24 business hours.",
    },
    {
      question: "Do you offer support on weekends?",
      answer:
        "While our regular business hours are Monday to Friday, we do monitor urgent requests occasionally on weekends.",
    },
  ];

  return (
    <div className="overflow-hidden font-sans bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        {/* Floating blobs */}
        <motion.div
          className="absolute z-0 w-72 h-72 bg-blue-200 rounded-full opacity-25 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          style={{ top: "6%", left: "-8%" }}
        />
        <motion.div
          className="absolute z-0 w-96 h-96 bg-indigo-300 rounded-full opacity-20 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 10 }}
          style={{ bottom: "2%", right: "-12%" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Get in Touch With Us
          </h1>
          <p className="text-base sm:text-lg opacity-90 text-gray-700">
            We’d love to hear from you. Whether you have a question, feedback, or just want to say hi — our team is here to help.
          </p>
        </motion.div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.div
            variants={item}
            className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Contact Our Office
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex gap-3 items-start">
                <FaMapMarkerAlt className="text-blue-500 mt-1" />
                <address className="not-italic">
                  Houston, Texas, USA
                </address>
              </div>
              <div className="flex gap-3 items-center">
                <FaEnvelope className="text-blue-500" />
                <a
                  href="mailto:gradmanager@futuregrin.com"
                  className="hover:underline"
                >
                  gradmanager@futuregrin.com
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Find Us on Google Maps
            </h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              title="Google Maps location"
              className="rounded-lg"
            ></iframe>
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>
          {faq.map((faqItem, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow border border-gray-200 hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold mb-2 text-blue-900">
                {faqItem.question}
              </h4>
              <p className="text-gray-700">{faqItem.answer}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Social Links */}
      <section className="py-12 text-center bg-gradient-to-b from-indigo-50 via-white to-blue-50">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Connect With Us
        </h2>
        <div className="flex justify-center gap-8 text-3xl">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-500 transition"
          >
            <FaTwitter />
          </a>
          <a
            href="https://www.linkedin.com/company/grad-manager"
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:text-blue-800 transition"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-700 transition"
          >
            <FaFacebook />
          </a>
        </div>
        <p className="mt-6 text-gray-600">We’re always excited to connect with you!</p>
      </section>
    </div>
  );
}
