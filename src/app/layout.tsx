import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/react";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});
export const metadata: Metadata = {
  title: "Archive of Almost — A Permanent Collection of Objects Left Behind",
  description: "250 objects. 250 stories. A permanent digital archive for the things we kept when we couldn't keep each other.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "Archive of Almost",
    description: "A permanent collection of objects left behind. Limited to 250.",
    url: "https://archiveofalmost.co",
    siteName: "Archive of Almost",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Archive of Almost",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive of Almost",
    description: "250 objects. 250 stories. A permanent archive for things left behind.",
    images: ["/og-image.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${cormorant.className} bg-black antialiased`}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
