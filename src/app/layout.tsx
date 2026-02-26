import type { Metadata } from "next";
import { Inter } from "next/font/config"; // Veya projenin kullandığı font
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Museum of Left",
  description: "An archive for things left behind.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black antialiased">
        {/* Navbar her sayfanın tepesinde sabit duracak */}
        <Navbar />
        
        {/* Sayfaların içeriği buraya gelecek */}
        {children}
      </body>
    </html>
  );
}