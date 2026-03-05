'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'The Collection', href: '/archive' },
    { name: 'About', href: '/about' },
    { name: 'Apply', href: '/submit' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Refund', href: '/refund' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/the.archiveofalmost',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com/@thearchiveofalmost',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
        </svg>
      ),
    },
    {
      name: 'X',
      href: 'https://x.com/archiveofalmost',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] px-6 md:px-10 py-5 bg-black/80 backdrop-blur-md border-b border-white/[0.04]">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="text-[11px] md:text-[12px] tracking-[0.4em] uppercase font-bold text-white/80 hover:text-white transition-colors duration-300">
          Archive of Almost
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] tracking-[0.35em] uppercase transition-all duration-300 font-bold ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-white/30 hover:text-white/70'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-[1px] h-4 bg-white/10"></div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/80 transition-colors duration-300"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile: hamburger only */}
        <div className="flex md:hidden items-center gap-4">
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
      <div className={`md:hidden transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100 pt-8' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col items-center gap-6 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-[11px] tracking-[0.4em] uppercase font-bold transition-colors duration-300 ${
                pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Social icons mobile */}
          <div className="flex items-center gap-6 pt-2 border-t border-white/10 w-full justify-center">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white/80 transition-colors duration-300"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
