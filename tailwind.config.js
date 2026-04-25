/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
    "node_modules/flowbite/**/*.js",
  ],
  safelist: [
    "text-primary", "bg-primary", "border-primary",
    "animate-fade-in", "animate-fade-in-up", "animate-slide-up-fade",
    "md:grid-cols-2", "lg:grid-cols-4"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#1F2937",
        accent: "#F472B6",
        neutralLight: "#F9FAFB",
        neutralDark: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "dashboard-gradient":
          "linear-gradient(135deg, #D8B4FE, #A5B4FC, #67E8F9)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
