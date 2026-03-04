'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const PAGE_SIZE = 6;

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchExhibits = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('exhibits')
      .select('*')
      .order('catalog_id', { ascending: false })
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
    <main className="min-h-screen bg-black text-white pt-28 md:pt-36 pb-24 px-4 md:px-8 font-serif selection:bg-white selection:text-black">
      <style jsx global>{`
        @keyframes spotlightFocus {
          0% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes textReveal {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slowPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .animate-spotlight { animation: spotlightFocus 1.2s ease-out forwards; }
        .animate-text-1 { animation: textReveal 0.7s ease-out 0.2s forwards; opacity: 0; }
        .animate-text-2 { animation: textReveal 0.7s ease-out 0.4s forwards; opacity: 0; }
        .animate-text-3 { animation: textReveal 0.7s ease-out 0.6s forwards; opacity: 0; }
        .animate-glow { animation: slowPulse 6s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24">
        <div className="flex items-end justify-between border-b border-white/[0.06] pb-8">
          <div className="space-y-3">
            <div className="text-[8px] tracking-[0.5em] text-neutral-600 uppercase font-bold">
              Permanent Collection
            </div>
            <h1 className="text-4xl md:text-6xl font-light italic text-white/90 leading-none">
              The Archive
            </h1>
          </div>
          <div className="text-right space-y-1 hidden md:block">
            <div className="text-[8px] tracking-[0.4em] text-neutral-700 uppercase font-bold">
              Objects Archived
            </div>
            <div className="text-2xl font-light text-white/30 tabular-nums">
              {exhibits.length} <span className="text-neutral-800">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-px bg-white/[0.04]">
        {exhibits.map((item, index) => {
          const isLastElement = exhibits.length === index + 1;
          return (
            <div
              ref={isLastElement ? lastExhibitElementRef : null}
              key={item.id}
              className="group bg-black p-4 md:p-8 space-y-4 md:space-y-6 hover:bg-neutral-950 transition-colors duration-700"
            >
              {/* Image */}
              <div
                onClick={() => setSelectedExhibit(item)}
                className="aspect-square relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 cursor-pointer"
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-103 transition-transform duration-1000"
                />
                {/* Overlay hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700 flex items-center justify-center">
                  <span className="text-[8px] tracking-[0.4em] text-white uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    View
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex justify-between items-center text-[8px] md:text-[9px] tracking-[0.3em] text-neutral-400 uppercase font-bold">
                <span>{item.catalog_id}</span>
                <span>{item.year}</span>
              </div>

              {/* Title */}
              <h3
                onClick={() => setSelectedExhibit(item)}
                className="text-sm md:text-lg font-light italic text-white/80 group-hover:text-white transition-colors duration-500 cursor-pointer leading-snug"
              >
                "{item.title}"
              </h3>

              {/* Share */}
              <button
                onClick={() => handleShare(item)}
                className="text-[8px] md:text-[9px] tracking-[0.35em] text-neutral-500 uppercase font-bold hover:text-white/70 transition-colors duration-300"
              >
                — Share
              </button>
            </div>
          );
        })}
      </div>

      {exhibits.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-32">
          <p className="text-neutral-700 italic text-lg">The archive is being curated.</p>
        </div>
      )}

      {/* Modal */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-16"
          onClick={() => setSelectedExhibit(null)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl"></div>

          <div
            className="relative w-full max-w-6xl flex flex-col md:flex-row gap-8 md:gap-20 items-start md:items-center z-10 overflow-y-auto scrollbar-hide max-h-[90vh] md:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedExhibit(null)}
              className="absolute top-0 right-0 text-[9px] tracking-[0.4em] text-white/40 uppercase font-bold hover:text-white transition-colors z-50"
            >
              Close ×
            </button>

            {/* Image */}
            <div className="relative w-full md:w-1/2 aspect-square shrink-0">
              <div className="absolute -inset-12 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)] blur-[60px] -z-10 animate-glow"></div>
              <div className="relative w-full h-full border border-white/[0.08] overflow-hidden animate-spotlight">
                <Image
                  src={selectedExhibit.image_url}
                  alt={selectedExhibit.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 space-y-8 text-left pb-8 md:pb-0">
              <div className="space-y-2 animate-text-1">
                <div className="flex items-center gap-4 text-[8px] md:text-[9px] tracking-[0.5em] text-white/40 uppercase font-bold">
                  <span>{selectedExhibit.catalog_id}</span>
                  <div className="w-8 h-[1px] bg-white/20"></div>
                  <span>{selectedExhibit.year}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-light italic text-white leading-tight">
                  "{selectedExhibit.title}"
                </h2>
              </div>

              <div className="w-8 h-[1px] bg-neutral-800 animate-text-2"></div>

              <div className="max-h-[200px] md:max-h-[300px] overflow-y-auto scrollbar-hide animate-text-2">
                <p className="text-base md:text-xl text-white/70 font-light leading-relaxed italic">
                  {selectedExhibit.description}
                </p>
              </div>

              {selectedExhibit.submitter_name && (
                <p className="text-[9px] tracking-[0.4em] text-neutral-600 uppercase font-bold animate-text-3">
                  — {selectedExhibit.submitter_name}
                </p>
              )}

              <button
                onClick={() => handleShare(selectedExhibit)}
                className="animate-text-3 text-[9px] tracking-[0.4em] text-white/30 uppercase font-bold hover:text-white/70 transition-colors border border-white/10 hover:border-white/30 px-6 py-3"
              >
                Share this object
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
