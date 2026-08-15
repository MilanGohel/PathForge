import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Pathforge — AI learning paths that teach",
    template: "%s · Pathforge",
  },
  description:
    "Personalized learning paths with on-demand AI generation, teachable MDX lessons, curated resources, and a module tutor.",
  openGraph: {
    title: "Pathforge — AI learning paths that teach",
    description:
      "Generate a path, learn module-by-module with real lessons, and go deeper with curated resources.",
    type: "website",
    siteName: "Pathforge",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "Pathforge — AI learning paths that teach",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathforge — AI learning paths that teach",
    description:
      "Personalized paths, teachable MDX lessons, and a grounded module tutor.",
    images: ["/og.svg"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeScript />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
