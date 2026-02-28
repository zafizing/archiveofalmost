'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react'; // state kullanmak için ekledik

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Menü durumu

  return (
    // z-50'yi z-[1000] yaparak en üste aldık
    <nav className="fixed top-0 left-0 w-full z-[1000] p-6 md:p-10 bg-black/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex justify-between items-center">
        {/* Sol Üst Logo */}
        <Link href="/" className="text-[11px] tracking-[0.5em] uppercase font-bold text-white transition-opacity hover:opacity-70">
          ARCHIVE OF ALMOST
        </Link>

        {/* Sağ Üst Linkler - Masaüstü */}
        <div className="hidden md:flex gap-12 text-white/70">
          <Link href="/gallery" className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${pathname === '/gallery' ? 'text-white' : ''}`}>
            The Gallery
          </Link>
          <Link href="/submit" className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${pathname === '/submit' ? 'text-white' : ''}`}>
            Archive Your Memory
          </Link>
        </div>

        {/* --- REVİZE: Hamburger İkonu - Tıklama İşlevi Eklendi --- */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white text-xl z-[1001]">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* --- REVİZE: Mobil Menü İçeriği --- */}
      {isOpen && (
        <div className="md:hidden flex flex-col gap-6 pt-10 pb-6 text-center text-white/70">
          <Link href="/gallery" className={`text-sm tracking-[0.2em] uppercase ${pathname === '/gallery' ? 'text-white font-bold' : ''}`} onClick={() => setIsOpen(false)}>
            The Gallery
          </Link>
          <Link href="/submit" className={`text-sm tracking-[0.2em] uppercase ${pathname === '/submit' ? 'text-white font-bold' : ''}`} onClick={() => setIsOpen(false)}>
            Archive Your Memory
          </Link>
        </div>
      )}
    </nav>
  );
}