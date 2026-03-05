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
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchTotalCount = useCallback(async () => {
    const { count } = await supabase.from('exhibits').select('*', { count: 'exact', head: true }).eq('is_approved', true);
    if (count !== null) setTotalCount(count);
  }, []);

  useEffect(() => { fetchTotalCount(); }, [fetchTotalCount]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedExhibit) return;
    const handleKey = (e: KeyboardEvent) => {
      const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id);
      if (e.key === 'ArrowRight' && idx < exhibits.length - 1) {
        setSelectedExhibit(exhibits[idx + 1]);
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        setSelectedExhibit(exhibits[idx - 1]);
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

  useEffect(() => {
    fetchExhibits(page);
  }, [page, fetchExhibits]);

  const lastExhibitElementRef = useCallback((node: any) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);

  const handleShare = async (item: any) => {
    try {
      const shareUrl = `https://archiveofalmost.co/archive`;
      if (navigator.share) {
        await navigator.share({
          title: `Archive of Almost — "${item.title}"`,
          text: `"${item.title}" — ${item.year}. An object preserved in the Archive of Almost.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard.');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-serif selection:bg-white selection:text-black">
      <style jsx global>{`
        @keyframes modalReveal {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes textReveal {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slowPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        @keyframes spotlightDrop {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-modal { animation: modalReveal 0.6s ease-out forwards; }
        .animate-text-1 { animation: textReveal 0.6s ease-out 0.15s forwards; opacity: 0; }
        .animate-text-2 { animation: textReveal 0.6s ease-out 0.3s forwards; opacity: 0; }
        .animate-text-3 { animation: textReveal 0.6s ease-out 0.45s forwards; opacity: 0; }
        .animate-glow { animation: slowPulse 6s ease-in-out infinite; }
        .animate-spotlight { animation: spotlightDrop 1s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Sticky top bar */}
      <div className="sticky top-[57px] md:top-[61px] z-50 bg-black/95 backdrop-blur-sm border-b border-white/[0.05] px-6 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[11px] md:text-[11px] tracking-[0.5em] text-neutral-400 uppercase font-bold">Permanent Collection</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-[1px] bg-neutral-800 hidden md:block"></div>
          <span className="text-[11px] md:text-[11px] tracking-[0.4em] text-neutral-400 uppercase font-bold">
            {exhibits.length} <span className="text-neutral-500">/ {TOTAL_SLOTS}</span> archived
          </span>
        </div>
      </div>

      {/* Page header */}
      <div className="px-6 md:px-10 pt-12 pb-10 md:pt-16 md:pb-14 border-b border-white/[0.04]">
        <h1 className="text-4xl md:text-6xl font-light italic text-white/90">The Archive</h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-8 pb-24">
        {exhibits.map((item, index) => {
          const isLastElement = exhibits.length === index + 1;
          return (
            <div
              ref={isLastElement ? lastExhibitElementRef : null}
              key={item.id}
              className="group border border-white/[0.15] hover:border-white/[0.35] transition-colors duration-700"
            >
              <div
                onClick={() => setSelectedExhibit(item)}
                className="aspect-square relative overflow-hidden cursor-pointer"
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover transition-all duration-1000 group-hover:grayscale group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
                <div className="absolute inset-0 flex items-end justify-start p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[11px] tracking-[0.5em] text-white/60 uppercase font-bold">View Object</span>
                </div>
              </div>

              <div className="p-5 md:p-8 space-y-3 md:space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] md:text-[11px] tracking-[0.4em] text-neutral-400 uppercase font-bold">{item.catalog_id}</span>
                  <span className="text-[11px] md:text-[11px] tracking-[0.3em] text-neutral-400 uppercase font-bold">{item.year}</span>
                </div>
                <h3
                  onClick={() => setSelectedExhibit(item)}
                  className="text-base md:text-lg font-light italic text-white leading-snug cursor-pointer hover:text-white/70 transition-colors"
                >
                  "{item.title}"
                </h3>
                <button
                  onClick={() => handleShare(item)}
                  className="text-[10px] md:text-xs tracking-[0.3em] text-neutral-400 uppercase font-bold hover:text-white transition-colors duration-300"
                >
                  — Share
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {exhibits.length === 0 && (
        <div className="text-center py-40">
          <p className="text-neutral-500 italic">The archive is being curated.</p>
        </div>
      )}

      {/* Modal */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-16"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit?.id);
            if (diff > 50 && idx < exhibits.length - 1) setSelectedExhibit(exhibits[idx + 1]);
            if (diff < -50 && idx > 0) setSelectedExhibit(exhibits[idx - 1]);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl"></div>

          {/* Left Arrow */}
          {exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id) > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id);
                setSelectedExhibit(exhibits[idx - 1]);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white/60 text-white/40 hover:text-white transition-all duration-300 cursor-pointer bg-black/60 backdrop-blur-sm hidden md:flex"
            >
              ←
            </button>
          )}

          {/* Right Arrow */}
          {exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id) < exhibits.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id);
                setSelectedExhibit(exhibits[idx + 1]);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white/60 text-white/40 hover:text-white transition-all duration-300 cursor-pointer bg-black/60 backdrop-blur-sm hidden md:flex"
            >
              →
            </button>
          )}

          <div
            className="animate-modal relative w-full max-w-5xl flex flex-col md:flex-row gap-0 z-10 max-h-[90vh] md:max-h-none overflow-y-auto scrollbar-hide border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image panel */}
            <div className="relative w-full md:w-[55%] aspect-square shrink-0 overflow-hidden">
              <div className="animate-spotlight absolute inset-0 z-10 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.12) 0%, transparent 70%)'
              }}></div>
              <div className="absolute -inset-8 animate-glow z-0" style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)'
              }}></div>
              <Image
                src={selectedExhibit.image_url}
                alt={selectedExhibit.title}
                fill
                unoptimized
                className="object-cover relative z-[1]"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-[2] pointer-events-none"></div>
            </div>

            {/* Info panel */}
            <div className="w-full md:w-[45%] bg-black border-t md:border-t-0 md:border-l border-white/[0.06] p-6 md:p-10 flex flex-col justify-between min-h-[300px] md:min-h-0">
              <div className="space-y-6 md:space-y-8">
                {/* Close + Navigation */}
                <div className="flex justify-between items-center">
                  <div className="text-[10px] tracking-[0.3em] text-neutral-700 uppercase font-bold">
                    {(() => { const idx = exhibits.findIndex((ex: any) => ex.id === selectedExhibit.id); return `${idx + 1} / ${exhibits.length}`; })()}
                  </div>
                  <button
                    onClick={() => setSelectedExhibit(null)}
                    className="text-[11px] tracking-[0.5em] text-neutral-400 uppercase font-bold hover:text-white transition-colors cursor-pointer"
                  >
                    Close ×
                  </button>
                </div>

                {/* Catalog info */}
                <div className="animate-text-1 space-y-1">
                  <div className="flex items-center gap-3 text-[11px] tracking-[0.5em] text-neutral-400 uppercase font-bold">
                    <span>{selectedExhibit.catalog_id}</span>
                    <div className="w-6 h-[1px] bg-neutral-700"></div>
                    <span>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-light italic text-white leading-tight">
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="w-8 h-[1px] bg-neutral-800 animate-text-1"></div>

                {/* Story — fade out at bottom to indicate scroll */}
                <div className="animate-text-2 relative">
                  <div className="max-h-[180px] md:max-h-[240px] overflow-y-auto scrollbar-hide">
                    <p className="text-sm md:text-base text-white/80 font-light leading-relaxed italic">
                      {selectedExhibit.description}
                    </p>
                  </div>
                  {/* Fade out efekti */}
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Bottom */}
              <div className="animate-text-3 space-y-4 pt-6 border-t border-white/[0.05] mt-6">
                {selectedExhibit.submitter_name && (
                  <p className="text-[11px] tracking-[0.4em] text-neutral-600 uppercase font-bold">
                    — {selectedExhibit.submitter_name}
                  </p>
                )}
                <button
                  onClick={() => handleShare(selectedExhibit)}
                  className="text-[11px] tracking-[0.45em] text-neutral-300 uppercase font-bold hover:text-white transition-colors border border-white/[0.08] hover:border-white/30 px-5 py-3 w-full"
                >
                  Share this object
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-black/95 backdrop-blur-sm px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></div>
          <span className="text-[11px] tracking-[0.4em] text-white/40 uppercase font-bold">
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a
          href="/submit"
          className="group relative overflow-hidden border border-white/40 hover:border-white/80 px-6 md:px-10 py-2.5 transition-all duration-500"
        >
          <span className="relative text-[11px] tracking-[0.4em] uppercase font-bold text-white transition-colors duration-500 z-10">
            Apply
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
        </a>
      </div>

    </main>
  );
}
