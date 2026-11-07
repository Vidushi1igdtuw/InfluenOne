import type { Metadata, Viewport } from "next";
import { Quicksand, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LinkedInProvider } from "@/contexts/LinkedInContext";
import { SlackProvider } from "@/contexts/SlackContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { Toaster } from "@/components/ui/sonner";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfluenOne — ASI:One for LinkedIn influencers | Fetch.ai Innovation Lab",
  description: "ASI:One ghostwriter for LinkedIn influencers. Generate, schedule, and post. Pay with Stripe or FET. Built for Stranger Builds.",
  keywords: ["ASI:One", "ASI-1", "influencer", "LinkedIn", "Fetch.ai", "Innovation Lab", "Stranger Builds", "uAgents", "Stripe", "FET"],
  authors: [{ name: "InfluenOne" }],
  creator: "InfluenOne",
  publisher: "InfluenOne",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://influenone.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'InfluenOne — ASI:One for LinkedIn influencers | Fetch.ai Innovation Lab',
    description: 'ASI:One ghostwriter for LinkedIn influencers. Generate, schedule, and post. Pay with Stripe or FET. Built for Stranger Builds.',
    siteName: 'InfluenOne',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfluenOne — ASI:One for LinkedIn influencers | Fetch.ai Innovation Lab',
    description: 'ASI:One ghostwriter for LinkedIn influencers. Generate, schedule, and post. Pay with Stripe or FET. Built for Stranger Builds.',
    creator: '@influenone',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#5F43F1' },
    { media: '(prefers-color-scheme: dark)', color: '#5F43F1' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${quicksand.variable} ${geistMono.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PaymentProvider>
              <LinkedInProvider>
                <SlackProvider>
                  {children}
                  <Toaster />
                </SlackProvider>
              </LinkedInProvider>
            </PaymentProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

