'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const PAGE_SIZE = 9;
const TOTAL_SLOTS = 150;

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const touchStartX = useRef<number>(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  const fetchTotalCount = useCallback(async () => {
    const { count } = await supabase.from('exhibits').select('*', { count: 'exact', head: true }).eq('is_approved', true);
    if (count !== null) setTotalCount(count);
  }, []);

  useEffect(() => { fetchTotalCount(); }, [fetchTotalCount]);

  useEffect(() => {
    if (!selectedExhibit) return;
    const handleKey = (e: KeyboardEvent) => {
      const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id);
      if (e.key === 'ArrowRight' && idx < exhibits.length - 1) {
        setSelectedExhibit(exhibits[idx + 1]);
        setSelectedIndex(idx + 1);
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        setSelectedExhibit(exhibits[idx - 1]);
        setSelectedIndex(idx - 1);
      } else if (e.key === 'Escape') {
        setSelectedExhibit(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedExhibit, exhibits]);

  const fetchExhibits = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('exhibits')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (!error && data) {
      setExhibits((prev) => [...prev, ...data]);
      if (data.length < PAGE_SIZE) setHasMore(false);
    }
  }, []);

  useEffect(() => { fetchExhibits(page); }, [page, fetchExhibits]);

  const lastExhibitElementRef = useCallback((node: any) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) setPage((prev) => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);

  const openExhibit = (item: any, idx: number) => {
    setSelectedExhibit(item);
    setSelectedIndex(idx);
  };

  const handleShare = async (item: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Archive of Almost — "${item.title}"`,
          text: `"${item.title}" — ${item.year}. An object preserved in the Archive of Almost.`,
          url: 'https://archiveofalmost.co/archive',
        });
      } else {
        await navigator.clipboard.writeText('https://archiveofalmost.co/archive');
      }
    } catch {}
  };

  // Check scroll fade on story open
  useEffect(() => {
    if (selectedExhibit && storyRef.current && fadeRef.current) {
      const el = storyRef.current;
      fadeRef.current.style.opacity = el.scrollHeight <= el.clientHeight ? '0' : '1';
    }
  }, [selectedExhibit]);

  return (
    <main className="min-h-screen text-white font-serif selection:bg-white selection:text-black" style={{ backgroundColor: '#0a0a0a' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        .museum-font { font-family: 'Cormorant Garamond', Georgia, serif; }

        /* Museum wall texture */
        .museum-wall {
          background-color: #0c0c0c;
          background-image:
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,255,255,0.015) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255,255,255,0.008) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(255,255,255,0.008) 0%, transparent 50%);
        }

        /* Frame glow on hover */
        @keyframes frameReveal {
          0% { opacity: 0; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spotlightOn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes modalIn {
          0% { opacity: 0; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes textUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes labelSlide {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(255,255,255,0.02), 0 0 0 1px rgba(255,255,255,0.06); }
          50% { box-shadow: 0 0 60px rgba(255,255,255,0.04), 0 0 0 1px rgba(255,255,255,0.10); }
        }

        .frame-card { animation: frameReveal 0.8s ease-out forwards; opacity: 0; }
        .frame-card:nth-child(1) { animation-delay: 0.05s; }
        .frame-card:nth-child(2) { animation-delay: 0.12s; }
        .frame-card:nth-child(3) { animation-delay: 0.19s; }
        .frame-card:nth-child(4) { animation-delay: 0.26s; }
        .frame-card:nth-child(5) { animation-delay: 0.33s; }
        .frame-card:nth-child(6) { animation-delay: 0.40s; }
        .frame-card:nth-child(7) { animation-delay: 0.47s; }
        .frame-card:nth-child(8) { animation-delay: 0.54s; }
        .frame-card:nth-child(9) { animation-delay: 0.61s; }

        .animate-modal { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-t1 { animation: textUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .animate-t2 { animation: textUp 0.6s ease-out 0.25s forwards; opacity: 0; }
        .animate-t3 { animation: textUp 0.6s ease-out 0.4s forwards; opacity: 0; }

        /* The frame itself */
        .exhibit-frame {
          position: relative;
          cursor: pointer;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .exhibit-frame:hover {
          transform: translateY(-4px);
        }

        /* Spotlight from above */
        .spotlight {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 120px;
          background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
        }
        .exhibit-frame:hover .spotlight { opacity: 1; }

        /* Frame border */
        .frame-border {
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.5s ease, box-shadow 0.5s ease;
        }
        .exhibit-frame:hover .frame-border {
          border-color: rgba(255,255,255,0.20);
          box-shadow:
            0 0 30px rgba(255,255,255,0.03),
            0 20px 60px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* Museum label */
        .museum-label {
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;
        }
        .exhibit-frame:hover .museum-label { opacity: 1; transform: translateY(0); }

        /* Image overlay on hover */
        .img-overlay {
          background: radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%);
          transition: opacity 0.5s ease;
          opacity: 0.4;
        }
        .exhibit-frame:hover .img-overlay { opacity: 0.2; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Wall hanging wire illusion */
        .wire {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 40%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent);
          pointer-events: none;
        }
      `}</style>

      {/* Sticky top bar */}
      <div className="sticky top-[57px] md:top-[61px] z-50 border-b border-white/[0.05] px-6 md:px-10 py-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)' }}>
        <span className="text-[10px] md:text-[11px] tracking-[0.5em] text-neutral-500 uppercase font-bold">Permanent Collection</span>
        <span className="text-[10px] md:text-[11px] tracking-[0.4em] text-neutral-500 uppercase font-bold">
          {exhibits.length} <span className="text-neutral-700">/ {TOTAL_SLOTS}</span>
        </span>
      </div>

      {/* Page header */}
      <div className="px-6 md:px-16 pt-14 pb-12 md:pt-20 md:pb-16 border-b border-white/[0.04]" style={{ backgroundColor: '#0a0a0a' }}>
        <p className="text-[10px] tracking-[0.6em] text-neutral-600 uppercase font-bold mb-4">Gallery I</p>
        <h1 className="museum-font text-5xl md:text-7xl font-light italic text-white/90 leading-none">The Archive</h1>
        <p className="mt-4 text-[11px] tracking-[0.3em] text-neutral-600 uppercase font-bold">Objects from relationships that have ended</p>
      </div>

      {/* Museum wall — the gallery */}
      <div className="museum-wall px-4 md:px-12 pb-32 pt-16">

        {/* Ambient ceiling light bar */}
        <div className="w-full h-px mb-16 opacity-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 80%, transparent)' }}></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-20 md:gap-x-12 md:gap-y-28 max-w-7xl mx-auto">
          {exhibits.map((item, index) => {
            const isLast = exhibits.length === index + 1;
            return (
              <div
                key={item.id}
                ref={isLast ? lastExhibitElementRef : null}
                className="frame-card"
              >
                <div className="exhibit-frame" onClick={() => openExhibit(item, index)}>
                  {/* Hanging wire */}
                  <div className="wire"></div>

                  {/* Spotlight from above */}
                  <div className="spotlight"></div>

                  {/* The frame */}
                  <div className="frame-border" style={{ padding: '10px', backgroundColor: '#0f0f0f' }}>
                    {/* Matte inner border */}
                    <div style={{ padding: '0', border: '1px solid rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
                      {/* Image */}
                      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: '#080808' }}>
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover transition-all duration-1000 group-hover:scale-[1.03]"
                          style={{ filter: 'saturate(0.85) contrast(1.05)' }}
                        />
                        <div className="img-overlay absolute inset-0 pointer-events-none"></div>
                        {/* Subtle inner shadow / vignette */}
                        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Museum label card */}
                  <div className="museum-label mt-5 px-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="museum-font text-base md:text-lg font-light italic text-white/85 leading-snug truncate">
                          "{item.title}"
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] tracking-[0.4em] text-neutral-600 uppercase font-bold">{item.catalog_id}</span>
                          <div className="w-3 h-px bg-neutral-700"></div>
                          <span className="text-[10px] tracking-[0.3em] text-neutral-600 uppercase font-bold">{item.year}</span>
                        </div>
                        {item.submitter_name && (
                          <p className="text-[10px] tracking-[0.3em] text-neutral-700 uppercase font-bold mt-1">— {item.submitter_name}</p>
                        )}
                      </div>
                    </div>
                    {/* Thin line under label, like a real museum card */}
                    <div className="mt-3 h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom ambient line */}
        {exhibits.length > 0 && (
          <div className="w-full h-px mt-24 opacity-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 50%, transparent)' }}></div>
        )}
      </div>

      {exhibits.length === 0 && (
        <div className="text-center py-40">
          <p className="museum-font text-neutral-600 italic text-lg">The collection is being assembled.</p>
        </div>
      )}

      {/* MODAL */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit?.id);
            if (diff > 50 && idx < exhibits.length - 1) { setSelectedExhibit(exhibits[idx + 1]); setSelectedIndex(idx + 1); }
            if (diff < -50 && idx > 0) { setSelectedExhibit(exhibits[idx - 1]); setSelectedIndex(idx - 1); }
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(24px)' }}></div>

          {/* Ceiling spotlight in modal */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)' }}></div>

          {/* Left Arrow */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center border border-white/10 hover:border-white/40 text-white/30 hover:text-white transition-all duration-300"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >←</button>
          )}

          {/* Right Arrow */}
          {selectedIndex < exhibits.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center border border-white/10 hover:border-white/40 text-white/30 hover:text-white transition-all duration-300"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >→</button>
          )}

          <div
            className="animate-modal relative w-full max-w-5xl flex flex-col md:flex-row gap-0 z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image panel — framed like museum */}
            <div className="relative w-full md:w-[55%] shrink-0 overflow-hidden" style={{ backgroundColor: '#080808' }}>
              {/* Frame padding like a real museum mount */}
              <div className="p-3 md:p-5 h-full" style={{ backgroundColor: '#0a0a0a' }}>
                <div className="relative w-full aspect-square overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Image
                    src={selectedExhibit.image_url}
                    alt={selectedExhibit.title}
                    fill
                    unoptimized
                    className="object-cover"
                    style={{ filter: 'saturate(0.85) contrast(1.05)' }}
                  />
                  {/* Spotlight in modal image */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)' }}></div>
                  <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }}></div>
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div className="w-full md:w-[45%] flex flex-col justify-between p-6 md:p-10 min-h-[320px]" style={{ backgroundColor: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="space-y-6">
                {/* Top row */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] tracking-[0.4em] text-neutral-700 uppercase font-bold">
                    {selectedIndex + 1} / {exhibits.length}
                  </span>
                  <button
                    onClick={() => setSelectedExhibit(null)}
                    className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase font-bold hover:text-white transition-colors cursor-pointer"
                  >Close ×</button>
                </div>

                {/* Catalog line */}
                <div className="animate-t1 space-y-1">
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.5em] text-neutral-600 uppercase font-bold">
                    <span>{selectedExhibit.catalog_id}</span>
                    <div className="w-5 h-px bg-neutral-800"></div>
                    <span>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="museum-font text-2xl md:text-4xl font-light italic text-white leading-tight">
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="animate-t1 w-8 h-px bg-neutral-800"></div>

                {/* Story */}
                <div className="animate-t2 relative">
                  <div
                    ref={storyRef}
                    className="max-h-[180px] md:max-h-[240px] overflow-y-auto scrollbar-hide"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
                      if (fadeRef.current) fadeRef.current.style.opacity = isAtBottom ? '0' : '1';
                    }}
                  >
                    <p className="museum-font text-sm md:text-base text-white/75 font-light leading-relaxed italic">
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300" style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }}></div>
                </div>
              </div>

              {/* Bottom */}
              <div className="animate-t3 space-y-4 pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {selectedExhibit.submitter_name && (
                  <p className="text-[10px] tracking-[0.4em] text-neutral-700 uppercase font-bold museum-font italic">
                    — {selectedExhibit.submitter_name}
                  </p>
                )}
                <button
                  onClick={() => handleShare(selectedExhibit)}
                  className="text-[10px] tracking-[0.45em] text-neutral-400 uppercase font-bold hover:text-white transition-colors w-full py-3 font-serif"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  Share this object
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.05] px-6 md:px-10 py-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse"></div>
          <span className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-bold">
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a
          href="/submit"
          className="group relative overflow-hidden px-6 md:px-10 py-2.5 transition-all duration-500 text-[10px] tracking-[0.4em] uppercase font-bold text-white"
          style={{ border: '1px solid rgba(255,255,255,0.3)' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
        >
          Apply
        </a>
      </div>
    </main>
  );
}
