// src/components/ScrollToTop.tsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // This scrolls the window to the top with a smooth animation
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]); // This effect runs whenever the pathname (URL) changes

  return null; // This component doesn't render anything itself
};

export default ScrollToTop;