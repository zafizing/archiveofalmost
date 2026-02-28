'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Archive', href: '/archive' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Refund', href: '/refund' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] p-4 md:p-10 bg-black/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex justify-between items-center">
        {/* Logo ve Buton Grubu */}
        <div className="flex items-center gap-4">
          {/* --- Logo Fontu Küçültüldü (text-[9px] md:text-[11px]) --- [cite: 2026-03-01] */}
          <Link href="/" className="text-[9px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase font-bold text-white transition-opacity hover:opacity-70">
            ARCHIVE OF ALMOST
          </Link>
          
          {/* Mobil Buton logonun yanına taşındı */}
          <Link href="/submit" className={`md:hidden text-[8px] tracking-[0.2em] uppercase transition-all duration-300 border border-white/20 px-2 py-1 hover:bg-white hover:text-black ${pathname === '/submit' ? 'bg-white text-black' : 'text-white'}`}>
            Submit
          </Link>
        </div>

        {/* Masaüstü ve Mobil Görünür Menü */}
        <div className="flex items-center gap-6 md:gap-12">
          {/* Masaüstü Linkleri (Geniş ekranda görünür) */}
          <div className="hidden md:flex items-center gap-6 md:gap-8">
            {/* --- Metin "Archive Your Memory" olarak düzeltildi --- [cite: 2026-03-01] */}
            <Link href="/submit" className={`text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase transition-all duration-300 hover:text-white whitespace-nowrap ${pathname === '/submit' ? 'text-white' : 'text-white/70'}`}>
              Archive Your Memory
            </Link>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase transition-all duration-300 hover:text-white whitespace-nowrap ${pathname === link.href ? 'text-white' : 'text-white/70'}`}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobil Menü Butonu (Hamburger) */}
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></div>
          </button>
        </div>
      </div>

      {/* Mobil Menü İçeriği */}
      <div className={`md:hidden flex flex-col items-center gap-6 pt-10 transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${pathname === link.href ? 'text-white' : 'text-white/70'}`} onClick={() => setIsOpen(false)}>
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}