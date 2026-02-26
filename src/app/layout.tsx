import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: "italic",
});

export const metadata: Metadata = {
  title: "Archive of Almost",
  description: "A curated digital museum of unfinished love.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.className} bg-[#0a0a0a] text-[#e5e5e5] antialiased`}>
        {children}
      </body>
    </html>
  );
}