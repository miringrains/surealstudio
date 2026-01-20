import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUREAL STUDIO | Premiere",
  description: "Enter the premiere. Experience the drop.",
  keywords: ["sureal", "studio", "premiere", "video", "cinema"],
  authors: [{ name: "Sureal Studio" }],
  openGraph: {
    title: "SUREAL STUDIO | Premiere",
    description: "Enter the premiere. Experience the drop.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUREAL STUDIO | Premiere",
    description: "Enter the premiere. Experience the drop.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Noise overlay for texture */}
        <div className="fixed inset-0 noise pointer-events-none z-50" />
        
        {children}
      </body>
    </html>
  );
}
