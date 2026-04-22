import type { Metadata } from "next";
import Script from 'next/script';
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { siteConfig, generateOrganizationSchema } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
  preload: true,
  variable: "--font-lora",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Giày Sneaker Chính Hãng`,
    template: `%s | ${siteConfig.name}`,
  },
  icons: {
    icon: "/Logo_UITSneaker.png",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
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
  verification: {
    google: "Dz0zY8psEIuDpWF0fX9STA-oXW_Lw-V72ZIKHs8c40w",
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${lora.variable}`}>
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body className={inter.className}>
          {/* Google Analytics */}
  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-5BZ31EGL10"
    strategy="afterInteractive"
  />
  <Script id="google-analytics" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-5BZ31EGL10');
    `}
  </Script>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}