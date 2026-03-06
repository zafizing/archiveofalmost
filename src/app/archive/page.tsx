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
      if (navigator.share) await navigator.share({ title: `Archive of Almost — "${item.title}"`, url: 'https://archiveofalmost.co/archive' });
      else await navigator.clipboard.writeText('https://archiveofalmost.co/archive');
    } catch {}
  };

  return (
    <main className="min-h-screen text-white selection:bg-white selection:text-black" style={{ fontFamily: "'Georgia', serif", backgroundColor: '#0d0b0a' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }

        /* ===================== MUSEUM ROOM ===================== */

        /* The wall itself — dark warm stone, not flat black */
        .gallery-wall {
          background-color: #181614;
          background-image:
            /* Strong overhead lighting band */
            radial-gradient(ellipse 90% 20% at 50% 0%, rgba(255, 244, 210, 0.09) 0%, transparent 100%),
            /* Left corner dark */
            linear-gradient(100deg, rgba(0,0,0,0.55) 0%, transparent 22%),
            /* Right corner dark */
            linear-gradient(260deg, rgba(0,0,0,0.55) 0%, transparent 22%),
            /* Very subtle warm wall tint */
            radial-gradient(ellipse 140% 60% at 50% 40%, rgba(60,45,30,0.12) 0%, transparent 70%);
          position: relative;
        }

        /* Horizontal wainscoting line — divides wall into upper/lower */
        .gallery-wall::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          bottom: 18%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 85%, transparent 100%);
          pointer-events: none;
        }

        /* Ceiling rail line */
        .ceiling-rail {
          height: 3px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255,244,210,0.06) 5%,
            rgba(255,244,210,0.18) 20%,
            rgba(255,244,210,0.22) 50%,
            rgba(255,244,210,0.18) 80%,
            rgba(255,244,210,0.06) 95%,
            transparent 100%
          );
          position: relative;
        }

        /* Individual spot light dots */
        .spot-dot {
          position: absolute;
          top: -1px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,244,200,0.9);
          box-shadow: 0 0 6px 2px rgba(255,244,200,0.6), 0 0 16px 4px rgba(255,244,200,0.2);
          transform: translateX(-50%);
        }

        /* ===================== ARTWORK ===================== */

        @keyframes revealArtwork {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .artwork-cell {
          opacity: 0;
          animation: revealArtwork 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
        }
        .artwork-cell:nth-child(1) { animation-delay: 0.05s; }
        .artwork-cell:nth-child(2) { animation-delay: 0.15s; }
        .artwork-cell:nth-child(3) { animation-delay: 0.25s; }
        .artwork-cell:nth-child(4) { animation-delay: 0.35s; }
        .artwork-cell:nth-child(5) { animation-delay: 0.45s; }
        .artwork-cell:nth-child(6) { animation-delay: 0.55s; }
        .artwork-cell:nth-child(7) { animation-delay: 0.65s; }
        .artwork-cell:nth-child(8) { animation-delay: 0.75s; }
        .artwork-cell:nth-child(9) { animation-delay: 0.85s; }

        /* The spotlight cone — from ceiling down onto frame */
        .artwork-cell::before {
          content: '';
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 80px;
          clip-path: polygon(30% 0%, 70% 0%, 85% 100%, 15% 100%);
          background: linear-gradient(to bottom,
            rgba(255,244,200,0.10) 0%,
            rgba(255,244,200,0.03) 70%,
            transparent 100%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .artwork-cell:hover::before { opacity: 1; }

        /* Wall glow behind frame on hover */
        .artwork-cell::after {
          content: '';
          position: absolute;
          inset: -30px;
          background: radial-gradient(ellipse 80% 70% at 50% 40%,
            rgba(255,244,200,0.05) 0%,
            transparent 70%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 0;
        }
        .artwork-cell:hover::after { opacity: 1; }

        .artwork-inner {
          position: relative;
          z-index: 1;
          cursor: pointer;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .artwork-cell:hover .artwork-inner { transform: translateY(-5px) scale(1.015); }

        /* ===== THE FRAME ===== */

        /* Outer shadow — frame casting shadow on wall */
        .frame-shadow {
          box-shadow:
            0 8px 30px rgba(0,0,0,0.7),
            0 20px 60px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.8);
          transition: box-shadow 0.5s ease;
        }
        .artwork-cell:hover .frame-shadow {
          box-shadow:
            0 12px 40px rgba(0,0,0,0.8),
            0 28px 80px rgba(0,0,0,0.6),
            0 2px 4px rgba(0,0,0,0.9),
            0 0 60px rgba(255,244,200,0.04);
        }

        /* Wooden frame border — dark walnut look */
        .frame-wood {
          padding: 7px;
          background:
            linear-gradient(135deg, #3a2e22 0%, #2a2018 40%, #3a2e22 60%, #221a10 100%);
          position: relative;
        }
        /* Frame highlight edge */
        .frame-wood::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%),
            linear-gradient(315deg, rgba(0,0,0,0.3) 0%, transparent 40%);
          pointer-events: none;
        }

        /* White mat / passepartout */
        .frame-mat {
          background: #ede8e0;
          padding: 10px 10px 26px 10px;
          position: relative;
        }
        /* Mat inner shadow */
        .frame-mat::after {
          content: '';
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 12px rgba(0,0,0,0.15);
          pointer-events: none;
        }

        /* Glass reflection */
        .frame-glass {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            130deg,
            rgba(255,255,255,0.07) 0%,
            rgba(255,255,255,0.02) 25%,
            transparent 45%
          );
          pointer-events: none;
          z-index: 3;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .artwork-cell:hover .frame-glass { opacity: 1; }

        /* ===== MUSEUM LABEL ===== */
        .label-card {
          margin-top: 16px;
          padding-left: 0;
        }
        .label-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 300;
          font-size: 15px;
          line-height: 1.3;
          color: rgba(255,255,255,0.72);
          margin-bottom: 6px;
        }
        .label-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .label-id {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          font-weight: 700;
          color: #3d3630;
          font-family: Georgia, serif;
        }
        .label-year {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 700;
          color: #3d3630;
          font-family: Georgia, serif;
        }
        .label-submitter {
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 700;
          color: #2e2822;
          font-family: Georgia, serif;
          margin-top: 3px;
        }
        /* Thin underline like real museum card */
        .label-line {
          width: 32px;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin-top: 10px;
        }

        /* ===== FLOOR ===== */
        .gallery-floor {
          height: 60px;
          background: linear-gradient(to top,
            rgba(0,0,0,0.7) 0%,
            rgba(0,0,0,0.3) 40%,
            transparent 100%
          );
        }

        /* ===== MODAL ===== */
        @keyframes modalIn {
          0%   { opacity: 0; transform: scale(0.96) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .modal-anim { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fu1 { animation: fadeUp 0.6s ease-out 0.08s forwards; opacity: 0; }
        .fu2 { animation: fadeUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .fu3 { animation: fadeUp 0.6s ease-out 0.34s forwards; opacity: 0; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Responsive */
        @media (max-width: 640px) {
          .gallery-grid { grid-template-columns: 1fr !important; gap: 56px 0 !important; padding: 48px 20px 80px !important; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 64px 40px !important; padding: 64px 40px 80px !important; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div
        className="sticky top-[57px] md:top-[61px] z-50 px-6 md:px-10 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13,11,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="cg text-[10px] tracking-[0.6em] uppercase" style={{ color: '#444', fontStyle: 'italic' }}>Permanent Collection</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '0.4em', color: '#333', textTransform: 'uppercase', fontWeight: 700 }}>
          {exhibits.length} <span style={{ color: '#252525' }}>/ {TOTAL_SLOTS}</span>
        </span>
      </div>

      {/* ── PAGE HEADER ── */}
      <div style={{ backgroundColor: '#0d0b0a', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '56px 64px 52px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '9px', letterSpacing: '0.7em', textTransform: 'uppercase', color: '#2e2822', marginBottom: '12px', fontWeight: 700 }}>
          Gallery I — Objects of Remembrance
        </p>
        <h1 className="cg" style={{ fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.88)', lineHeight: 1 }}>
          The Archive
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.12)' }}></div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', fontWeight: 700 }}>
            Objects from relationships that have ended
          </p>
        </div>
      </div>

      {/* ══════════════ THE GALLERY ROOM ══════════════ */}
      <div className="gallery-wall" style={{ minHeight: '100vh', paddingBottom: '0' }}>

        {/* Ceiling rail with spot lights */}
        <div className="ceiling-rail" style={{ position: 'relative' }}>
          {[12, 28, 50, 72, 88].map((p) => (
            <div key={p} className="spot-dot" style={{ left: `${p}%` }}></div>
          ))}
        </div>

        {/* Side wall panels (vertical lines for architectural depth) */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: '6%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)', pointerEvents: 'none' }}></div>

        {/* ── GRID ── */}
        <div
          className="gallery-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '90px 70px',
            padding: '80px 72px 100px',
            maxWidth: '1380px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {exhibits.map((item, index) => {
            const isLast = exhibits.length === index + 1;
            return (
              <div
                key={item.id}
                ref={isLast ? lastExhibitElementRef : null}
                className="artwork-cell"
              >
                <div
                  className="artwork-inner"
                  onClick={() => { setSelectedExhibit(item); setSelectedIndex(index); }}
                >
                  {/* Frame with shadow */}
                  <div className="frame-shadow">
                    {/* Wood frame */}
                    <div className="frame-wood">
                      {/* White mat */}
                      <div className="frame-mat">
                        {/* Image */}
                        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                            style={{ filter: 'saturate(0.80) contrast(1.06) brightness(0.93)' }}
                          />
                          {/* Top spotlight on image */}
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(255,244,200,0.10) 0%, transparent 60%)'
                          }}></div>
                          {/* Vignette */}
                          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 28px rgba(0,0,0,0.35)' }}></div>
                          {/* Glass glare */}
                          <div className="frame-glass"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Museum label */}
                  <div className="label-card">
                    <p className="label-title">"{item.title}"</p>
                    <div className="label-meta">
                      <span className="label-id">{item.catalog_id}</span>
                      <span style={{ color: '#2e2822', fontSize: '8px' }}>—</span>
                      <span className="label-year">{item.year}</span>
                    </div>
                    {item.submitter_name && <p className="label-submitter">{item.submitter_name}</p>}
                    <div className="label-line"></div>
                  </div>
                </div>

                {/* Frame floor shadow */}
                <div style={{
                  position: 'absolute', bottom: '-16px', left: '8%', right: '8%', height: '16px',
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.45) 0%, transparent 70%)',
                  pointerEvents: 'none', zIndex: 0,
                }}></div>
              </div>
            );
          })}
        </div>

        {/* Floor */}
        <div className="gallery-floor"></div>
      </div>

      {exhibits.length === 0 && (
        <div style={{ textAlign: 'center', padding: '160px 0', backgroundColor: '#181614' }}>
          <p className="cg" style={{ color: '#333', fontStyle: 'italic', fontSize: '18px' }}>The collection is being assembled.</p>
        </div>
      )}

      {/* ══════════════ MODAL ══════════════ */}
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
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,5,4,0.96)', backdropFilter: 'blur(24px)' }}></div>
          {/* Ceiling spot in modal */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '700px', height: '500px', pointerEvents: 'none',
            background: 'radial-gradient(ellipse 50% 70% at 50% 0%, rgba(255,244,200,0.07) 0%, transparent 70%)'
          }}></div>

          {/* Nav arrows */}
          {selectedIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >←</button>
          )}
          {selectedIndex < exhibits.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >→</button>
          )}

          {/* Modal card */}
          <div
            className="modal-anim relative w-full max-w-5xl flex flex-col md:flex-row z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left — framed image */}
            <div className="w-full md:w-[55%] shrink-0" style={{ backgroundColor: '#0f0d0c', padding: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #3a2e22 0%, #2a2018 40%, #3a2e22 60%, #221a10 100%)',
                padding: '6px',
                boxShadow: '0 16px 50px rgba(0,0,0,0.8)',
              }}>
                <div style={{ background: '#ede8e0', padding: '8px 8px 20px 8px' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                    <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover"
                      style={{ filter: 'saturate(0.80) contrast(1.06) brightness(0.93)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,244,200,0.10) 0%, transparent 60%)' }}></div>
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — info */}
            <div className="w-full md:w-[45%] flex flex-col justify-between p-6 md:p-10 min-h-[320px]"
              style={{ backgroundColor: '#0c0a09', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#2e2822', fontWeight: 700 }}>
                    {selectedIndex + 1} / {exhibits.length}
                  </span>
                  <button onClick={() => setSelectedExhibit(null)}
                    style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#444', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                  >Close ×</button>
                </div>

                {/* Catalog */}
                <div className="fu1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#333', fontWeight: 700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width: '16px', height: '1px', background: '#2a2a2a' }}></div>
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#333', fontWeight: 700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', lineHeight: 1.2 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="fu1" style={{ width: '28px', height: '1px', background: '#1e1e1e' }}></div>

                {/* Story */}
                <div className="fu2" style={{ position: 'relative' }}>
                  <div ref={storyRef} className="scrollbar-hide" style={{ maxHeight: '220px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1';
                    }}
                  >
                    <p className="cg" style={{ fontSize: '15px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, #0c0a09, transparent)', pointerEvents: 'none', transition: 'opacity 0.3s' }}></div>
                </div>
              </div>

              {/* Bottom */}
              <div className="fu3" style={{ paddingTop: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedExhibit.submitter_name && (
                  <p className="cg" style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#333', fontStyle: 'italic' }}>
                    — {selectedExhibit.submitter_name}
                  </p>
                )}
                <button onClick={() => handleShare(selectedExhibit)}
                  style={{ width: '100%', padding: '12px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.45em', textTransform: 'uppercase', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.07)', background: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >Share this object</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13,11,10,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.22)' }}>
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a href="/submit"
          style={{ padding: '10px 32px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'all 0.3s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
        >Apply</a>
      </div>
    </main>
  );
}
