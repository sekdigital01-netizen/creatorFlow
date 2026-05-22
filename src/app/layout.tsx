import "./globals.css";
import type { Metadata, Viewport } from "next";
import { NavbarClient } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

const APP_NAME = "Streamly";
const APP_DESCRIPTION = "A creator-first platform for video lessons and long-form blog courses. Watch, learn, and share knowledge from creators worldwide.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://streamly.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Streamly — Learn from Great Creators",
    template: "%s | Streamly"
  },
  description: APP_DESCRIPTION,
  keywords: ["creators", "videos", "blogs", "learning", "courses", "education", "streaming"],
  authors: [{ name: "Streamly" }],
  creator: "Streamly",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Streamly — Learn from Great Creators",
    description: APP_DESCRIPTION,
    images: [{
      url: `${APP_URL}/og-image.png`,
      width: 1200,
      height: 630,
      alt: APP_NAME,
    }],
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Streamly — Learn from Great Creators",
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/twitter-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" }
  ],
};

// Preload critical fonts
const fontLink = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let role: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", user.id)
      .single();
    username = data?.username ?? null;
    role = data?.role ?? null;
  }

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: APP_NAME,
              description: APP_DESCRIPTION,
              url: APP_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${APP_URL}/search?q={search_term_string}`
                },
                query_input: "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-zinc-100 antialiased">
        <NavbarClient username={username} userEmail={user?.email ?? null} userRole={role} />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24" role="main">
          {children}
        </main>
        <footer className="border-t border-white/5 mt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between gap-4">
            <span>© {new Date().getFullYear()} {APP_NAME}</span>
            <span>v1.0 · MVP</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
