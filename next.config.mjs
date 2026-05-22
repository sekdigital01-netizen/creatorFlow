/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance & Build Optimization
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Image Optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" } // Allow all HTTPS images (fallback)
    ],
    // Optimize image delivery
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // Headers for caching & security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      },
      {
        source: "/public/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" }
        ]
      }
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [];
  }
};

export default nextConfig;
