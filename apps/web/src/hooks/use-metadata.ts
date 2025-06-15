import { useEffect } from "react";

interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
}

/**
 * Hook for dynamic metadata management in React components
 *
 * Current status: Ready for future multi-page expansion
 * Future usage: Dashboard, Community, Marketplace, Auth pages
 *
 * @param options - Metadata configuration object
 *
 * @example
 * // Future usage in dashboard page:
 * useMetadata({
 *   title: "Analytics Dashboard - Freelaz",
 *   description: "Track your freelance pricing performance",
 *   url: "/dashboard",
 *   image: "/og-dashboard.jpg"
 * });
 */
export const useMetadata = ({
  title = "🇧🇷 Freelaz - Calculadora de Preços para Freelancers",
  description = "Calculadora de preços para freelancers brasileiros que trabalham com clientes americanos. Calcule suas tarifas de forma inteligente e competitiva.",
  image = "/og-image.jpg",
  url = typeof window !== "undefined"
    ? window.location.href
    : "https://freelaz.com",
  type = "website",
  keywords = "freelancer, brasil, calculadora, preços, tarifas, dólar, real, conversão, trabalho remoto",
}: MetadataOptions = {}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (
      property: string,
      content: string,
      isProperty = false
    ) => {
      const selector = isProperty
        ? `meta[property="${property}"]`
        : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", property);
        } else {
          meta.setAttribute("name", property);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    // Ensure image URL is absolute
    const imageUrl = image.startsWith("http")
      ? image
      : `${window.location.origin}${image}`;
    const pageUrl = url.startsWith("http")
      ? url
      : `${window.location.origin}${url}`;

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // OpenGraph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:url", pageUrl, true);
    updateMetaTag("og:image", imageUrl, true);
    updateMetaTag("og:image:width", "1200", true);
    updateMetaTag("og:image:height", "630", true);
    updateMetaTag("og:image:type", "image/jpeg", true);
    updateMetaTag("og:site_name", "Freelaz", true);
    updateMetaTag("og:locale", "pt_BR", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", imageUrl);
    updateMetaTag("twitter:image:alt", title);

    // Update canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", pageUrl);
  }, [title, description, image, url, type, keywords]);
};
