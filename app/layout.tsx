import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
});

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://diffusions.vercel.app";
const ogImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  title: "Diffusion",
  description: "Draw, prompt, and generate AI art in seconds.",
  openGraph: {
    title: "Diffusion — AI Art Playground",
    description: "Draw, prompt, and generate AI art in seconds.",
    url: siteUrl,
    siteName: "Diffusion",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Diffusion — AI Art Generator",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diffusion — AI Art Generator",
    description: "Draw, prompt, and generate AI art in seconds.",
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
