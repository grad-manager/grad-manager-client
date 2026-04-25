// src/components/VercelAnalytics.tsx
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

const VercelAnalytics: React.FC = () => {
  useEffect(() => {
    // This hook ensures the script is loaded on the client side
    // and correctly integrated with your app's lifecycle.
  }, []);

  return <Analytics />;
};

export default VercelAnalytics;