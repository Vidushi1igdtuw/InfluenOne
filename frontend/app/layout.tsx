import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LinkedInProvider } from "@/contexts/LinkedInContext";
import { SlackProvider } from "@/contexts/SlackContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { Toaster } from "@/components/ui/sonner";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "InfluenOne — Powered by ASI:One | Fetch.ai Innovation Lab",
  description:
    "LinkedIn ghostwriter agent powered by ASI:One. Intent to action: generate, design, pay, and publish. Built for Stranger Builds 1.",
  keywords: [
    "ASI:One",
    "ASI:One",
    "InfluenOne",
    "Fetch.ai",
    "Innovation Lab",
    "Stranger Builds",
    "uAgents",
    "Agentverse",
    "LinkedIn",
  ],
  authors: [{ name: "InfluenOne" }],
  creator: "InfluenOne",
  publisher: "InfluenOne",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://influenone.app"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "InfluenOne — Powered by ASI:One",
    description:
      "LinkedIn ghostwriter agent powered by ASI:One. Intent to action for Fetch.ai Innovation Lab Stranger Builds.",
    siteName: "InfluenOne",
  },
  twitter: {
    card: "summary_large_image",
    title: "InfluenOne — Powered by ASI:One",
    description:
      "LinkedIn ghostwriter agent powered by ASI:One. Intent to action for Fetch.ai Innovation Lab Stranger Builds.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5F43F1" },
    { media: "(prefers-color-scheme: dark)", color: "#060814" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${space.variable} ${plex.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
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
