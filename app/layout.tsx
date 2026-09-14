import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gadgets.bevanssons.store"),
  title: {
    default: "Bevanssons | Premium Gadgets — Worldwide Shipping",
    template: "%s | Bevanssons",
  },
  description: "Premium gadgets for everyday convenience. iPhones, Smart TVs, Gaming, Laptops, MacBooks, Home Appliances, Solar & more. Free worldwide delivery. Same-day delivery in South Africa.",
  keywords: "gadgets South Africa, iPhones, smart TVs, gaming consoles, PS5, Xbox, laptops, MacBook, solar panels, home appliances, bevanssons gadgets",
  openGraph: {
    title: "Bevanssons | Premium Gadgets For Everyday Convenience",
    description: "Premium gadgets for everyday convenience. Worldwide shipping available. Free delivery in South Africa.",
    url: "https://gadgets.bevanssons.store",
    siteName: "Bevanssons",
    locale: "en_ZA",
    type: "website",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "Bevanssons" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bevanssons | Premium Gadgets — Worldwide Shipping",
    description: "Premium gadgets for everyday convenience. Worldwide shipping. Same-day delivery in South Africa.",
    images: ["/logo.jpg"],
  },
  alternates: {
    canonical: "https://gadgets.bevanssons.store",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bevanssons",
  url: "https://gadgets.bevanssons.store",
  logo: "https://gadgets.bevanssons.store/logo.jpg",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+27-84-896-1782",
    contactType: "customer service",
    areaServed: ["ZA", "Worldwide"],
    availableLanguage: "English",
  },
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
        {process.env.NODE_ENV === "development" && (
          <Script src="http://localhost:7891/vibe-client.js" data-project="C:/Users/money/daisy-co" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
