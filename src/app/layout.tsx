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
  },
  twitter: {
    card: "summary",
    title: "Pathforge — AI learning paths that teach",
    description:
      "Personalized paths, teachable MDX lessons, and a grounded module tutor.",
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
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
