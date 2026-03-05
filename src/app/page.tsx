'use client';
import Link from 'next/link';
import { useSlotCount } from '@/lib/useSlotCount';

export default function Home() {
  const { archived, remaining, total } = useSlotCount();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/the.archiveofalmost',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    <main className="h-screen bg-black flex flex-col items-center justify-center text-center px-4 font-serif selection:bg-white selection:text-black overflow-hidden">
      
      {/* Grain texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px'
      }} />

      {/* Radial spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)'
      }} />

      <div className="relative z-10 space-y-10 md:space-y-20 max-w-4xl w-full">
        
        {/* Edition marker */}
        <div className="hidden md:flex items-center justify-center gap-6">
          <div className="w-12 md:w-20 h-[1px] bg-neutral-800"></div>
          <span className="text-[11px] md:text-[11px] tracking-[0.5em] text-neutral-600 uppercase font-bold">
            Est. 2026 — Limited to {total} Objects
          </span>
          <div className="w-12 md:w-20 h-[1px] bg-neutral-800"></div>
        </div>

        {/* Main title */}
        <div className="space-y-6 cursor-default">
          <h1 className="text-[2.8rem] md:text-[7rem] tracking-tight text-white italic font-light leading-[0.9]">
            Archive<br />
            <span className="font-bold not-italic">of Almost</span>
          </h1>
          <p className="hidden md:block text-[11px] md:text-sm tracking-[0.3em] text-neutral-500 uppercase font-light max-w-sm mx-auto">
            A permanent collection of objects left behind
          </p>
        </div>

        {/* Manifesto */}
        <p className="text-lg md:text-2xl text-white/70 italic font-light max-w-2xl mx-auto leading-relaxed px-4 tracking-wide">
          "Some things outlive the people who owned them."
        </p>

        {/* CTA */}
        <div className="space-y-4">
          <Link 
            href="/archive" 
            className="group relative inline-flex items-center justify-center px-12 md:px-20 py-4 md:py-5 overflow-hidden border border-white/20 transition-all duration-700 hover:border-white/60"
          >
            <span className="relative text-white text-[11px] md:text-[12px] tracking-[0.6em] md:tracking-[0.8em] uppercase transition-colors duration-500 group-hover:text-black z-10 font-bold">
              Enter the Archive
            </span>
            <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          </Link>

          <div className="block text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] uppercase mt-4">
            {archived !== null ? (
              <>
                <span className="text-white/30">{archived} of {total} objects archived</span>
                <span className="text-neutral-800 mx-3">—</span>
                <span className="text-white/20">{remaining} slots remaining</span>
              </>
            ) : (
              <span className="text-neutral-800">Loading...</span>
            )}
          </div>

          {/* Social icons */}
          <div className="flex items-center justify-center gap-6 pt-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/20 hover:text-white/60 transition-colors duration-300"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom details */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-between items-end px-8 md:px-12">
        <span className="text-[11px] md:text-[11px] tracking-[0.3em] text-neutral-800 uppercase">
          archiveofalmost.co
        </span>
        <Link href="/about" className="text-[11px] md:text-[11px] tracking-[0.3em] text-neutral-800 uppercase hover:text-neutral-600 transition-colors">
          About
        </Link>
      </div>

    </main>
  );
}
