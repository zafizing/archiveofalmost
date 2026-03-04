'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'The Collection', href: '/archive' },
    { name: 'Apply', href: '/submit' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Refund', href: '/refund' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] px-6 md:px-10 py-5 bg-black/80 backdrop-blur-md border-b border-white/[0.04]">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link href="/" className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase font-bold text-white/80 hover:text-white transition-colors duration-300">
          Archive of Almost
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[9px] tracking-[0.35em] uppercase transition-all duration-300 font-bold ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-white/30 hover:text-white/70'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile: Apply button + hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <Link
            href="/submit"
            className={`text-[8px] tracking-[0.25em] uppercase border px-3 py-1.5 transition-all duration-300 font-bold ${
              pathname === '/submit'
                ? 'bg-white text-black border-white'
                : 'text-white/60 border-white/20 hover:text-white hover:border-white/50'
            }`}
          >
            Apply
          </Link>
          <button
            className="flex flex-col gap-1.5 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className={`w-5 h-[1px] bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></div>
            <div className={`w-5 h-[1px] bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-[1px] bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-64 opacity-100 pt-8' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col items-center gap-6 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-[9px] tracking-[0.4em] uppercase font-bold transition-colors duration-300 ${
                pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
