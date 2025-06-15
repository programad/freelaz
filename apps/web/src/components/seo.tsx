import { useMetadata } from "../hooks/use-metadata";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
}

/**
 * SEO Component for dynamic metadata management
 *
 * Current usage: Not used (SPA with static meta tags in index.html)
 * Future usage: When adding routes for dashboard, community, marketplace, etc.
 *
 * @example
 * // Future usage in routed pages:
 * <SEO
 *   title="Dashboard - Freelaz Analytics"
 *   description="Visualize your freelance pricing trends and market data"
 *   url="/dashboard"
 *   image="/og-dashboard.jpg"
 * />
 */
export const SEO: React.FC<SEOProps> = (props) => {
  useMetadata(props);
  return null;
};
