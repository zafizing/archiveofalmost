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
      if (e.key === 'ArrowRight' && idx < exhibits.length - 1) { setSelectedExhibit(exhibits[idx + 1]); setSelectedIndex(idx + 1); }
      else if (e.key === 'ArrowLeft' && idx > 0) { setSelectedExhibit(exhibits[idx - 1]); setSelectedIndex(idx - 1); }
      else if (e.key === 'Escape') setSelectedExhibit(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedExhibit, exhibits]);

  const fetchExhibits = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('exhibits').select('*').eq('is_approved', true)
      .order('created_at', { ascending: false }).range(from, to);
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

  useEffect(() => {
    if (selectedExhibit && storyRef.current && fadeRef.current) {
      const el = storyRef.current;
      fadeRef.current.style.opacity = el.scrollHeight <= el.clientHeight ? '0' : '1';
    }
  }, [selectedExhibit]);

  const handleShare = async (item: any) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Archive of Almost — "${item.title}"`, url: 'https://archiveofalmost.co/archive' });
      } else {
        await navigator.clipboard.writeText('https://archiveofalmost.co/archive');
      }
    } catch {}
  };

  return (
    <main className="min-h-screen text-white font-serif selection:bg-white selection:text-black" style={{ backgroundColor: '#111010' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cormorant:ital,wght@0,300;1,300&display=swap');

        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }

        /* === MUSEUM ROOM === */
        .museum-room {
          position: relative;
          background-color: #141312;
          /* Parquet floor hint at very bottom */
          background-image:
            /* Ceiling gradient — light source from top center */
            radial-gradient(ellipse 100% 35% at 50% 0%, rgba(255, 248, 220, 0.07) 0%, transparent 100%),
            /* Left wall shadow */
            linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 18%),
            /* Right wall shadow */
            linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 18%),
            /* Floor shadow */
            linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 25%);
          overflow: hidden;
        }

        /* Subtle wall texture using repeating pattern */
        .museum-room::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,0.003) 3px,
              rgba(255,255,255,0.003) 4px
            );
          pointer-events: none;
          z-index: 0;
        }

        /* Ceiling track lighting bar */
        .ceiling-track {
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,248,220,0.15) 10%,
            rgba(255,248,220,0.25) 30%,
            rgba(255,248,220,0.30) 50%,
            rgba(255,248,220,0.25) 70%,
            rgba(255,248,220,0.15) 90%,
            transparent 100%
          );
          z-index: 1;
        }

        /* === ARTWORK FRAME === */
        @keyframes artworkReveal {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .artwork-item {
          opacity: 0;
          animation: artworkReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .artwork-item:nth-child(1)  { animation-delay: 0.10s; }
        .artwork-item:nth-child(2)  { animation-delay: 0.20s; }
        .artwork-item:nth-child(3)  { animation-delay: 0.30s; }
        .artwork-item:nth-child(4)  { animation-delay: 0.40s; }
        .artwork-item:nth-child(5)  { animation-delay: 0.50s; }
        .artwork-item:nth-child(6)  { animation-delay: 0.60s; }
        .artwork-item:nth-child(7)  { animation-delay: 0.70s; }
        .artwork-item:nth-child(8)  { animation-delay: 0.80s; }
        .artwork-item:nth-child(9)  { animation-delay: 0.90s; }

        .artwork-wrapper {
          cursor: pointer;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .artwork-wrapper:hover { transform: scale(1.02) translateY(-3px); }

        /* Spotlight cone from ceiling — visible above each piece */
        .spot-cone {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 200%;
          height: 110px;
          clip-path: polygon(35% 0%, 65% 0%, 80% 100%, 20% 100%);
          background: linear-gradient(to bottom,
            rgba(255, 248, 200, 0.10) 0%,
            rgba(255, 248, 200, 0.04) 60%,
            transparent 100%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
        }
        .artwork-wrapper:hover .spot-cone { opacity: 1; }

        /* Spot glow on the wall behind */
        .spot-wall {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 150%;
          height: 60%;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,248,200,0.06) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 1;
        }
        .artwork-wrapper:hover .spot-wall { opacity: 1; }

        /* The outer frame (dark wood effect) */
        .frame-outer {
          background: linear-gradient(145deg,
            #2a2520 0%,
            #1a1612 25%,
            #2a2520 50%,
            #1a1612 75%,
            #2a2520 100%
          );
          padding: 8px;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.04) inset,
            0 -2px 0 rgba(0,0,0,0.4) inset,
            2px 0 0 rgba(255,255,255,0.02) inset,
            -2px 0 0 rgba(0,0,0,0.3) inset,
            0 20px 60px rgba(0,0,0,0.7),
            0 4px 12px rgba(0,0,0,0.5);
          transition: box-shadow 0.5s ease;
        }
        .artwork-wrapper:hover .frame-outer {
          box-shadow:
            0 2px 0 rgba(255,255,255,0.06) inset,
            0 -2px 0 rgba(0,0,0,0.4) inset,
            2px 0 0 rgba(255,255,255,0.03) inset,
            -2px 0 0 rgba(0,0,0,0.3) inset,
            0 30px 80px rgba(0,0,0,0.8),
            0 8px 24px rgba(0,0,0,0.6),
            0 0 40px rgba(255,248,200,0.04);
        }

        /* White mat / passe-partout */
        .frame-mat {
          background: #f0ece6;
          padding: 12px 12px 28px 12px;
        }

        /* Image itself */
        .frame-image {
          position: relative;
          overflow: hidden;
          display: block;
        }

        /* Glare on glass */
        .frame-glass {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.06) 0%,
            rgba(255,255,255,0.02) 20%,
            transparent 50%
          );
          pointer-events: none;
          z-index: 3;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .artwork-wrapper:hover .frame-glass { opacity: 1; }

        /* === MUSEUM LABEL === */
        .museum-label-card {
          margin-top: 14px;
          padding: 10px 2px;
          border-left: 1px solid rgba(255,255,255,0.08);
          padding-left: 12px;
        }

        /* === FLOOR LINE === */
        .floor-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
          pointer-events: none;
        }

        /* === MODAL === */
        @keyframes modalReveal {
          0% { opacity: 0; transform: scale(0.96) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes textUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .modal-anim { animation: modalReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .t1 { animation: textUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .t2 { animation: textUp 0.6s ease-out 0.25s forwards; opacity: 0; }
        .t3 { animation: textUp 0.6s ease-out 0.4s forwards; opacity: 0; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Wall division lines (like real museum panels) */
        .wall-panel-left {
          position: absolute;
          left: 7%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent);
          pointer-events: none;
        }
        .wall-panel-right {
          position: absolute;
          right: 7%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent);
          pointer-events: none;
        }

        /* Baseboard */
        .baseboard {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to top, rgba(255,255,255,0.05), transparent);
        }
      `}</style>

      {/* Sticky top bar */}
      <div
        className="sticky top-[57px] md:top-[61px] z-50 border-b px-6 md:px-10 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(17,16,16,0.97)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <span className="cg text-[10px] md:text-[11px] tracking-[0.6em] text-neutral-500 uppercase font-normal" style={{ letterSpacing: '0.5em' }}>Permanent Collection</span>
        <span className="text-[10px] tracking-[0.4em] text-neutral-600 uppercase font-bold">
          {exhibits.length} <span style={{ color: '#333' }}>/ {TOTAL_SLOTS}</span>
        </span>
      </div>

      {/* Page header — like a museum entrance plaque */}
      <div
        className="relative px-8 md:px-16 pt-14 pb-14 md:pt-20 md:pb-16"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', backgroundColor: '#111010' }}
      >
        <p className="text-[9px] tracking-[0.8em] text-neutral-700 uppercase mb-3 font-bold">Gallery I — Objects of Remembrance</p>
        <h1 className="cg text-5xl md:text-7xl font-light italic" style={{ color: 'rgba(255,255,255,0.88)' }}>The Archive</h1>
        <div className="mt-5 flex items-center gap-4">
          <div className="h-px w-8" style={{ background: 'rgba(255,255,255,0.15)' }}></div>
          <p className="text-[9px] tracking-[0.5em] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>Objects from relationships that have ended</p>
        </div>
      </div>

      {/* THE MUSEUM ROOM */}
      <div className="museum-room relative min-h-screen" style={{ paddingBottom: '120px' }}>
        <div className="ceiling-track"></div>
        <div className="wall-panel-left"></div>
        <div className="wall-panel-right"></div>

        {/* Individual spotlight dots on ceiling track */}
        {[15, 32, 50, 68, 85].map((pos) => (
          <div key={pos} className="absolute top-0 z-10 w-1 h-1 rounded-full" style={{ left: `${pos}%`, background: 'rgba(255,248,200,0.6)', boxShadow: '0 0 4px rgba(255,248,200,0.8)' }}></div>
        ))}

        {/* === ARTWORK GRID === */}
        <div
          className="relative z-10"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '80px 60px',
            padding: '80px 80px 80px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {exhibits.map((item, index) => {
            const isLast = exhibits.length === index + 1;
            return (
              <div
                key={item.id}
                ref={isLast ? lastExhibitElementRef : null}
                className="artwork-item"
                style={{
                  // Slight perspective/tilt variation per column for depth
                  transform: index % 3 === 0 ? 'perspective(1200px) rotateY(0.5deg)' :
                             index % 3 === 2 ? 'perspective(1200px) rotateY(-0.5deg)' : 'none',
                }}
              >
                <div className="artwork-wrapper" onClick={() => { setSelectedExhibit(item); setSelectedIndex(index); }}>
                  {/* Spotlight cone */}
                  <div className="spot-cone"></div>
                  {/* Wall glow */}
                  <div className="spot-wall"></div>

                  {/* Outer dark frame */}
                  <div className="frame-outer">
                    {/* White mat */}
                    <div className="frame-mat">
                      {/* Image */}
                      <div className="frame-image" style={{ aspectRatio: '1/1', width: '100%' }}>
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                          style={{ filter: 'saturate(0.75) contrast(1.08) brightness(0.95)' }}
                        />
                        {/* Glass glare */}
                        <div className="frame-glass"></div>
                        {/* Inner vignette */}
                        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Museum label */}
                  <div className="museum-label-card">
                    <p className="cg text-sm md:text-base font-light italic leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      "{item.title}"
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] tracking-[0.45em] uppercase font-bold" style={{ color: '#444' }}>{item.catalog_id}</span>
                      <span style={{ color: '#333', fontSize: '8px' }}>—</span>
                      <span className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: '#444' }}>{item.year}</span>
                    </div>
                    {item.submitter_name && (
                      <p className="text-[9px] tracking-[0.3em] uppercase font-bold mt-0.5" style={{ color: '#333' }}>
                        {item.submitter_name}
                      </p>
                    )}
                  </div>

                  {/* Shadow on floor beneath frame */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '10%',
                    right: '10%',
                    height: '20px',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.4) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile grid — simpler for small screens */}
        <style jsx>{`
          @media (max-width: 768px) {
            .museum-grid-override {
              grid-template-columns: 1fr !important;
              gap: 60px 0 !important;
              padding: 40px 24px !important;
            }
          }
          @media (min-width: 769px) and (max-width: 1100px) {
            .museum-grid-override {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 60px 40px !important;
              padding: 60px 40px !important;
            }
          }
        `}</style>

        {/* Floor shadow */}
        <div className="floor-line"></div>
        <div className="baseboard"></div>
      </div>

      {exhibits.length === 0 && (
        <div className="text-center py-40 museum-room">
          <p className="cg text-neutral-600 italic text-xl">The collection is being assembled.</p>
        </div>
      )}

      {/* === MODAL === */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50 && selectedIndex < exhibits.length - 1) { setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }
            if (diff < -50 && selectedIndex > 0) { setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }
          }}
        >
          {/* Dark room backdrop */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(8,7,7,0.96)', backdropFilter: 'blur(20px)' }}></div>

          {/* Ceiling spotlight on modal */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{
            width: '600px', height: '400px',
            background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255,248,200,0.06) 0%, transparent 70%)'
          }}></div>

          {/* Arrows */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center text-white/30 hover:text-white transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.5)' }}
            >←</button>
          )}
          {selectedIndex < exhibits.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center text-white/30 hover:text-white transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.5)' }}
            >→</button>
          )}

          {/* Modal content */}
          <div
            className="modal-anim relative w-full max-w-5xl flex flex-col md:flex-row z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Framed image in modal */}
            <div className="relative w-full md:w-[55%] shrink-0" style={{ backgroundColor: '#0e0d0d' }}>
              {/* Frame in modal */}
              <div style={{ padding: '20px', backgroundColor: '#0e0d0d' }}>
                <div style={{
                  background: 'linear-gradient(145deg, #2a2520, #1a1612 30%, #2a2520 50%, #1a1612 75%, #2a2520)',
                  padding: '6px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)'
                }}>
                  <div style={{ background: '#f0ece6', padding: '10px 10px 22px 10px' }}>
                    <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                      <Image
                        src={selectedExhibit.image_url}
                        alt={selectedExhibit.title}
                        fill
                        unoptimized
                        className="object-cover"
                        style={{ filter: 'saturate(0.75) contrast(1.08) brightness(0.95)' }}
                      />
                      {/* Spotlight from above on modal image */}
                      <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,248,200,0.1) 0%, transparent 60%)'
                      }}></div>
                      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info panel */}
            <div
              className="w-full md:w-[45%] flex flex-col justify-between p-6 md:p-10 min-h-[320px]"
              style={{ backgroundColor: '#0c0b0b', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[0.5em] uppercase font-bold" style={{ color: '#333' }}>
                    {selectedIndex + 1} / {exhibits.length}
                  </span>
                  <button onClick={() => setSelectedExhibit(null)} className="text-[10px] tracking-[0.5em] uppercase font-bold hover:text-white transition-colors" style={{ color: '#555' }}>
                    Close ×
                  </button>
                </div>

                <div className="t1 space-y-2">
                  <div className="flex items-center gap-3 text-[9px] tracking-[0.5em] uppercase font-bold" style={{ color: '#444' }}>
                    <span>{selectedExhibit.catalog_id}</span>
                    <div className="w-4 h-px" style={{ background: '#333' }}></div>
                    <span>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg text-2xl md:text-4xl font-light italic leading-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="t1 w-8 h-px" style={{ background: '#222' }}></div>

                <div className="t2 relative">
                  <div
                    ref={storyRef}
                    className="scrollbar-hide"
                    style={{ maxHeight: '220px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1';
                    }}
                  >
                    <p className="cg text-sm md:text-base font-light italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, #0c0b0b, transparent)' }}></div>
                </div>
              </div>

              <div className="t3 space-y-4 pt-6 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {selectedExhibit.submitter_name && (
                  <p className="cg text-[10px] tracking-[0.4em] uppercase font-bold italic" style={{ color: '#444' }}>
                    — {selectedExhibit.submitter_name}
                  </p>
                )}
                <button
                  onClick={() => handleShare(selectedExhibit)}
                  className="w-full py-3 text-[10px] tracking-[0.45em] uppercase font-bold transition-colors hover:text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', color: '#555' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
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
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(17,16,16,0.97)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}></div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a
          href="/submit"
          className="px-6 md:px-10 py-2.5 text-[10px] tracking-[0.4em] uppercase font-bold text-white transition-all duration-300 hover:bg-white hover:text-black"
          style={{ border: '1px solid rgba(255,255,255,0.3)' }}
        >
          Apply
        </a>
      </div>
    </main>
  );
}
