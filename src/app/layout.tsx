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
    default: "Pathforge — Your personal curriculum, forged for how you learn",
    template: "%s · Pathforge",
  },
  description:
    "Pathforge builds a staged learning roadmap for anything you want to learn, then teaches you one module at a time with real lessons, progress, and a module tutor.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/pathforge-mark.png" }],
  },
  openGraph: {
    title: "Pathforge — Your personal curriculum, forged for how you learn",
    description:
      "AI learning paths that teach: staged roadmaps, real module lessons, and a tutor that stays on topic.",
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
    title: "Pathforge — Your personal curriculum, forged for how you learn",
    description:
      "Staged roadmaps, real module lessons, and a tutor that stays on topic.",
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
