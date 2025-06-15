# SEO Implementation for Freelaz

This implementation provides comprehensive OpenGraph and Twitter Card metadata management for the React + Vite application.

## Current Status: **Future-Ready Architecture**

- **Phase 1 (Current)**: SPA using static meta tags in `index.html` ✅
- **Phase 2+ (Future)**: Multi-page app using dynamic SEO components 🔮

## Files Created

- `hooks/use-metadata.ts` - React hook for dynamic metadata management
- `components/seo.tsx` - Reusable SEO component
- `config/seo-config.ts` - Predefined SEO settings for planned pages
- `public/og-image.jpg` - Main OpenGraph image (1200x630px)
- `public/favicon.svg` - SVG favicon
- `public/favicon-32x32.png` - 32x32 PNG favicon
- `public/favicon-16x16.png` - 16x16 PNG favicon
- `public/apple-touch-icon.png` - 180x180 Apple touch icon

## Features

### Static Metadata (index.html)

- OpenGraph meta tags (title, description, image, etc.)
- Twitter Card meta tags
- SEO meta tags (keywords, robots, canonical)
- Multiple favicon formats for cross-platform support

### Dynamic Metadata (React Components)

- `useMetadata` hook for programmatic metadata updates
- `SEO` component for declarative metadata management
- Automatic absolute URL generation
- Page-specific metadata override capability

## Usage Examples

### Current Usage (SPA - Not Needed Yet)

```tsx
// ❌ Current SPA doesn't need this
// index.html already handles all meta tags
```

### Future Usage (Multi-page App)

#### Using SEO Config (Recommended)

```tsx
import { SEO } from "../components/seo";
import { getSEOConfig } from "../config/seo-config";

export const DashboardPage = () => {
  const seoConfig = getSEOConfig("dashboard");

  return (
    <>
      <SEO {...seoConfig} />
      <div>Dashboard content</div>
    </>
  );
};
```

#### Custom Page Metadata

```tsx
import { SEO } from "../components/seo";

export const BlogPostPage = () => {
  return (
    <>
      <SEO
        title="Como Calcular Preços - Freelaz Blog"
        description="Guia completo sobre precificação para freelancers."
        type="article"
        url="/blog/como-calcular-precos"
        image="/og-blog-post.jpg"
      />
      <article>Blog content</article>
    </>
  );
};
```

#### Using the Hook Directly

```tsx
import { useMetadata } from "../hooks/use-metadata";

export const DynamicComponent = ({ projectData }) => {
  useMetadata({
    title: `${projectData.title} - Freelaz`,
    description: projectData.description,
    image: projectData.ogImage,
  });

  return <div>Dynamic content</div>;
};
```

## OpenGraph Image Specifications

- **Dimensions**: 1200x630px (recommended)
- **Format**: JPG or PNG
- **File size**: Keep under 1MB for faster loading
- **Safe zone**: Keep important content within central 1200x630px area

## Best Practices

1. **Always provide alt text** for social media images
2. **Use absolute URLs** for images (handled automatically by the hook)
3. **Keep titles under 60 characters** for better display
4. **Keep descriptions under 160 characters** for SEO
5. **Use unique images** for each page when possible
6. **Test your metadata** using social media debugging tools

## Testing Tools

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [OpenGraph.xyz](https://www.opengraph.xyz/)

## Deployment Notes

When deploying to Cloudflare Pages:

1. Ensure all images are in the `public/` directory
2. Update the domain in OpenGraph URLs to your production domain
3. Test that all meta tags are properly rendered
4. Consider implementing dynamic OG images using Cloudflare Workers if needed

## File Structure

```
apps/web/
├── public/
│   ├── og-image.jpg          # Main OpenGraph image
│   ├── favicon.svg           # SVG favicon
│   ├── favicon-32x32.png     # 32x32 favicon
│   ├── favicon-16x16.png     # 16x16 favicon
│   └── apple-touch-icon.png  # Apple touch icon
├── src/
│   ├── hooks/
│   │   └── use-metadata.ts   # Metadata management hook
│   └── components/
│       ├── seo.tsx           # SEO component
│       └── example-usage.tsx # Usage examples
└── index.html                # Updated with static meta tags
```
