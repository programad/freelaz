import { useEffect } from "react";

interface GoogleAnalyticsProps {
  measurementId?: string;
  debug?: boolean;
}

// Helper function to check if we're in production environment
const isProduction = (): boolean => {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  const isDev = import.meta.env.DEV;

  // Consider it production if:
  // 1. Not in dev mode AND
  // 2. Not localhost or 127.0.0.1 or local development domains
  return (
    !isDev &&
    !hostname.includes("localhost") &&
    !hostname.includes("127.0.0.1") &&
    !hostname.includes(".local") &&
    !hostname.includes("dev.")
  );
};

// Helper function to check if analytics should be enabled
const shouldEnableAnalytics = (measurementId?: string): boolean => {
  return !!measurementId && isProduction();
};

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
    if (!shouldEnableAnalytics(measurementId)) {
      if (debug) {
        console.warn(
          "Google Analytics: Disabled in development environment or no measurement ID provided"
        );
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
    // Only track events in production environment
    if (!isProduction()) {
      console.log(`[DEV] Analytics Event: ${eventName}`, parameters);
      return;
    }

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, parameters);
    }
  };

  const trackPageView = (pageTitle?: string, pageLocation?: string) => {
    // Only track page views in production environment
    if (!isProduction()) {
      console.log(`[DEV] Analytics Page View:`, {
        page_title: pageTitle || document.title,
        page_location: pageLocation || window.location.href,
      });
      return;
    }

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
    isProduction: isProduction(),
  };
};

// Export helper functions for use in other components
export { isProduction, shouldEnableAnalytics };
