import { useEffect } from "react";

interface GoogleAnalyticsProps {
  measurementId?: string;
  debug?: boolean;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GoogleAnalytics = ({
  measurementId,
  debug = false,
}: GoogleAnalyticsProps) => {
  useEffect(() => {
    if (!measurementId) {
      if (debug) {
        console.warn("Google Analytics: No measurement ID provided");
      }
      return;
    }

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    // Configure gtag
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      debug_mode: debug,
    });

    // Load Google Analytics script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    if (debug) {
      console.log(`Google Analytics initialized with ID: ${measurementId}`);
    }

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const existingScript = document.querySelector(
        `script[src*="${measurementId}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [measurementId, debug]);

  // This component renders nothing
  return null;
};

// Hook for tracking custom events
export const useGoogleAnalytics = () => {
  const trackEvent = (
    eventName: string,
    parameters: Record<string, any> = {}
  ) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, parameters);
    }
  };

  const trackPageView = (pageTitle?: string, pageLocation?: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: pageTitle || document.title,
        page_location: pageLocation || window.location.href,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
  };
};
