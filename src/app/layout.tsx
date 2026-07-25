import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/query-provider";
import { publicEnv } from "@/lib/env";

import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "HaloKYC",
    template: "%s | HaloKYC",
  },
  description:
    "HaloKYC — One API for identity verification: selfie capture, document OCR, liveness, face match, age checks, duplicate detection, risk scoring, and a review queue your team controls.",
  icons: {
    icon: {
      url: "/assets/logo/halokyc-icon.svg",
      type: "image/svg+xml",
    },
    apple: {
      url: "/assets/logo/halokyc-icon.svg",
      type: "image/svg+xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "HaloKYC",
    title: "HaloKYC — Stop fake users before they cost you",
    description:
      "One API. Practical identity checks. Your team keeps the final decision. No enterprise procurement cycle.",
    images: [
      {
        url: "/assets/og/halokyc-og.png",
        width: 1200,
        height: 630,
        alt: "HaloKYC — Identity verification API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HaloKYC — Stop fake users before they cost you",
    description:
      "One API. Practical identity checks. Your team keeps the final decision. No enterprise procurement cycle.",
    images: ["/assets/og/halokyc-og.png"],
    creator: "@halokyc",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
