import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

// SEO ve Sosyal Medya Kart Ayarları
export const metadata: Metadata = {
  title: "Almost — The Archive of Unfinished Memories",
  description: "A digital vault for the words unsaid, the paths not taken, and the memories left in between.",
  openGraph: {
    title: "Almost — The Archive",
    description: "Surrender your unfinished memories to the void.",
    url: "https://archiveofalmost.vercel.app",
    siteName: "Almost Archive",
    images: [
      {
        url: "/og-image.jpg", // public klasörüne koyacağın bir önizleme görseli
        width: 1200,
        height: 630,
        alt: "Almost Archive - Dark Aesthetic Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Almost — The Archive",
    description: "A digital vault for unfinished memories.",
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
      <body className={`${inter.className} bg-black antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}