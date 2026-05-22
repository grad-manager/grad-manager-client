import { useEffect, useState } from 'react';

export default function useUserAgent() {
  // If Platform is mobile
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // The Browser
  const [userAgent, setUserAgent] = useState<string | null>(null);
  // If Mobile Platform is IOS
  const [isIOS, setIsIOS] = useState<boolean | null>(null);
  // if Pwa has been installed before
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
  const [userAgentString, setUserAgentString] = useState<string | null>(null);

  useEffect(() => {
    if (window) {
      const navigatorAgent = window.navigator.userAgent;
      setUserAgentString(navigatorAgent);
      let userAgent: string;

      // Check the browser the user is using
      if (navigatorAgent.indexOf('SamsungBrowser') > -1) {
        userAgent = 'SamsungBrowser';
      } else if (navigatorAgent.indexOf('Opera') > -1) {
        userAgent = 'Opera';
      } else if (navigatorAgent.indexOf('Edge') > -1) {
        userAgent = 'Edge';
      } else if (navigatorAgent.indexOf('Safari') > -1) {
        userAgent = 'Safari';
      } else if (navigatorAgent.indexOf('Chrome') > -1) {
        userAgent = 'Chrome';
      } else if (navigatorAgent.indexOf('Firefox') > -1) {
        userAgent = 'Firefox';
      } else {
        userAgent = 'unknown';
      }
      //
      setUserAgent(userAgent);

      // Check if user agent/ Browser is mobile and what type of mobile
      const isIOS = navigatorAgent.match(/(iPad|iPhone|iPod)/i);
      const isAndroid = navigatorAgent.match(/(Android)/i);
      setIsIOS(!!isIOS);

      const isMobile = isAndroid || isIOS;
      setIsMobile(!!isMobile);

      // Check is app is installed  (prompt wont be shown)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
      }
    }
  }, []);

  return {
    isMobile,
    userAgent,
    isIOS,
    isStandalone,
    userAgentString,
  };
}
