'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Archive', href: '/archive' },
    { name: 'Archive Your Memory', href: '/submit' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Refund', href: '/refund' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] p-6 md:p-10 bg-black/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-[11px] tracking-[0.5em] uppercase font-bold text-white transition-opacity hover:opacity-70">
          ARCHIVE OF ALMOST
        </Link>

        {/* Masaüstü ve Mobil Görünür Menü */}
        <div className="flex items-center gap-6 md:gap-12">
          {/* Masaüstü Linkleri (Geniş ekranda görünür) --- revize: md:flex --- [cite: 2026-03-01] */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${pathname === link.href ? 'text-white' : 'text-white/70'}`}>
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

      {/* Mobil Menü İçeriği --- revize: md:hidden --- [cite: 2026-03-01] */}
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