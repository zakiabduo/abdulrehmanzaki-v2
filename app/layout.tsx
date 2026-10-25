import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/newsreader";
import "./globals.css";
import Providers from "@/components/Providers";
import Background from "@/components/Background";
import { profile, skillGroups, timeline } from "@/data/content";

const desc = `${profile.name} – AI/ML trainee, MERN full-stack developer and UX/UI designer from ${profile.location}. Explore projects, skills, certificates and contact details.`;
const title = `${profile.name} | AI/ML Trainee & MERN Full-Stack Developer`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s | ${profile.name}` },
  description: desc,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  keywords: [profile.name, "Zakii", "AI/ML trainee", "MERN stack developer", "full-stack developer Pakistan", "UX/UI designer", "portfolio"],
  alternates: { canonical: "/" },
  icons: { icon: "/icon.png" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  openGraph: { title, description: desc, type: "profile", url: profile.siteUrl, siteName: `${profile.name} Portfolio`, locale: "en_US" },
  twitter: { card: "summary_large_image", title, description: desc },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f4" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

const noJs = `.hl-inner,.sw-inner{transform:none!important}.sw-fade,.pre-fade{opacity:1!important}.clip-init{clip-path:none!important}.preloader{display:none!important}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${profile.siteUrl}/#person`,
        name: profile.name,
        alternateName: ["Zakii"],
        jobTitle: profile.roles[0],
        description: profile.bio,
        url: profile.siteUrl,
        image: `${profile.siteUrl}/me.jpg.png`,
        address: { "@type": "PostalAddress", addressCountry: "PK" },
        worksFor: { "@type": "Organization", name: timeline[0].place },
        alumniOf: { "@type": "CollegeOrUniversity", name: timeline[1].place },
        knowsAbout: skillGroups.flatMap((g) => g.items),
        sameAs: [profile.linkedin, profile.github],
      },
      { "@type": "WebSite", "@id": `${profile.siteUrl}/#website`, url: profile.siteUrl, name: `${profile.name} Portfolio`, inLanguage: "en", publisher: { "@id": `${profile.siteUrl}/#person` } },
    ],
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <noscript><style>{noJs}</style></noscript>
      </head>
      <body>
        <a href="#about" className="sans fixed left-4 top-4 z-[100] -translate-y-20 bg-ink px-4 py-2 text-sm text-bg focus:translate-y-0">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
          <Background />
          {children}
        </Providers>
      </body>
    </html>
  );
}
