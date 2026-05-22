import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VercelAnalytics from "./VercelAnalytics"; // Import the new component
import CookieConsent from "./common/CookieConsent";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      {/* Vercel Analytics component added here for global tracking */}
      <VercelAnalytics />
      <CookieConsent />
    </div>
  );
};

export default Layout;
