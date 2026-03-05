'use client';
import Link from 'next/link';
import { useSlotCount } from '@/lib/useSlotCount';

export default function Home() {
  const { archived, remaining, total } = useSlotCount();

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
        <p className="text-sm md:text-xl text-white/60 italic font-light max-w-xl mx-auto leading-relaxed px-4">
          "Some things outlive<br className="hidden md:block" /> the people who owned them."
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
