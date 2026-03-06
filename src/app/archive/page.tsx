'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const TOTAL_SLOTS = 150;
const AUTO_INTERVAL = 6000;

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const touchStartX = useRef<number>(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTotalCount = useCallback(async () => {
    const { count } = await supabase
      .from('exhibits')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true);
    if (count !== null) setTotalCount(count);
  }, []);

  useEffect(() => { fetchTotalCount(); }, [fetchTotalCount]);

  const fetchExhibits = useCallback(async () => {
    const { data, error } = await supabase
      .from('exhibits')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    if (!error && data) setExhibits(data);
  }, []);

  useEffect(() => { fetchExhibits(); }, [fetchExhibits]);

  // Auto-rotate — loops back to start
  useEffect(() => {
    if (exhibits.length === 0 || isPaused || selectedExhibit) return;
    autoRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % exhibits.length);
    }, AUTO_INTERVAL);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [exhibits.length, isPaused, selectedExhibit]);

  // Hide swipe hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const goTo = (i: number) => {
    setActiveIndex(((i % exhibits.length) + exhibits.length) % exhibits.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
    setShowSwipeHint(false);
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedExhibit) {
        if (e.key === 'Escape') setSelectedExhibit(null);
        if (e.key === 'ArrowRight') { const n = (activeIndex + 1) % exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }
        if (e.key === 'ArrowLeft') { const n = ((activeIndex - 1) + exhibits.length) % exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }
      } else {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedExhibit, activeIndex, exhibits]);

  // Fade on story scroll
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

  const getIndex = (offset: number) =>
    ((activeIndex + offset) % exhibits.length + exhibits.length) % exhibits.length;

  return (
    <main
      className="text-white overflow-hidden select-none"
      style={{ height: '100dvh', backgroundColor: '#0d0b0a', fontFamily: 'Georgia, serif' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.8;  }
        }
        @keyframes swipeAnim {
          0%   { transform: translateX(0);    opacity: 0.6; }
          50%  { transform: translateX(12px); opacity: 1;   }
          100% { transform: translateX(0);    opacity: 0.6; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .modal-anim { animation: modalIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fu1 { animation: fadeUp 0.55s ease-out 0.05s forwards; opacity: 0; }
        .fu2 { animation: fadeUp 0.55s ease-out 0.18s forwards; opacity: 0; }
        .fu3 { animation: fadeUp 0.55s ease-out 0.30s forwards; opacity: 0; }

        .side-card {
          transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94),
                      opacity  0.65s ease,
                      filter   0.65s ease;
        }
        .side-card:hover { opacity: 0.7 !important; filter: brightness(0.85) !important; }

        .nav-btn {
          transition: color 0.25s, border-color 0.25s, background 0.25s;
        }
        .nav-btn:hover {
          color: white !important;
          border-color: rgba(255,255,255,0.35) !important;
          background: rgba(255,255,255,0.05) !important;
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div
        className="fixed top-[57px] md:top-[61px] left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3"
        style={{ backgroundColor: 'rgba(13,11,10,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="cg text-[10px] tracking-[0.55em] uppercase italic" style={{ color: '#3a3a3a' }}>
          Permanent Collection
        </span>
        <div className="flex items-center gap-5">
          {exhibits.length > 0 && (
            <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.45em', color: '#282828', textTransform: 'uppercase', fontWeight: 700 }}>
              {String(activeIndex + 1).padStart(2, '0')} <span style={{ color: '#1a1a1a' }}>/ {String(exhibits.length).padStart(2, '0')}</span>
            </span>
          )}
          <span className="hidden md:block" style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.35em', color: '#1e1e1e', textTransform: 'uppercase' }}>
            ← → navigate
          </span>
        </div>
      </div>

      {/* ── MUSEUM STAGE ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '100dvh', overflow: 'hidden' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
        }}
      >
        {/* Wall texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.005) 49px, rgba(255,255,255,0.005) 50px)', pointerEvents: 'none' }} />

        {/* Ceiling rail */}
        <div style={{ position: 'absolute', top: '95px', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)', pointerEvents: 'none' }} />

        {/* Ceiling spotlight cone */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '300px', height: '100%', background: 'radial-gradient(ellipse 35% 90% at 50% 0%, rgba(255,244,210,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Floor line */}
        <div style={{ position: 'absolute', bottom: '68px', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.03) 80%, transparent)', pointerEvents: 'none' }} />

        {/* Side vignettes */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />

        {exhibits.length > 0 && (
          <div className="relative flex items-end justify-center" style={{ width: '100%', gap: '0px', paddingBottom: '60px' }}>

            {/* ── LEFT CARD ── */}
            <div
              className="side-card absolute cursor-pointer"
              style={{
                left: 'calc(50% - 520px)',
                bottom: '60px',
                width: '240px',
                opacity: 0.32,
                filter: 'brightness(0.5) saturate(0.6)',
                transform: 'translateY(40px) scale(0.82)',
                transformOrigin: 'center bottom',
              }}
              onClick={prev}
            >
              <div style={{ display: 'flex', justifyContent: 'center', height: '18px' }}>
                <div style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div style={{ background: 'linear-gradient(135deg, #3a2e20 0%, #251a0e 50%, #3a2e20 100%)', padding: '7px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
                <div style={{ background: '#eae4d8', padding: '7px 7px 22px 7px' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#111' }}>
                    <Image src={exhibits[getIndex(-1)].image_url} alt="" fill unoptimized className="object-cover" style={{ filter: 'saturate(0.7)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── CENTER (ACTIVE) CARD ── */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Wire */}
              <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.12)', marginBottom: '0px' }} />

              {/* Frame */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #4a3825 0%, #2e1e10 40%, #4a3825 60%, #1e1005 100%)',
                  padding: '10px',
                  boxShadow: '0 50px 120px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.07), 0 0 60px rgba(255,244,200,0.04)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.4s ease',
                }}
                onClick={() => setSelectedExhibit(exhibits[activeIndex])}
              >
                {/* Passepartout */}
                <div style={{ background: '#ede7db', padding: '10px 10px 32px 10px' }}>
                  <div style={{ position: 'relative', width: 'min(340px, 52vw)', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#111' }}>
                    <Image
                      src={exhibits[activeIndex].image_url}
                      alt={exhibits[activeIndex].title}
                      fill unoptimized
                      className="object-cover"
                      style={{ filter: 'saturate(0.88) contrast(1.04)' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,244,200,0.1) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }} />
                  </div>
                </div>
              </div>

              {/* Museum label */}
              <div style={{ marginTop: '18px', textAlign: 'left', width: 'min(360px, 54vw)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.55em', color: '#2e2e2e', textTransform: 'uppercase', fontWeight: 700 }}>
                    {exhibits[activeIndex].catalog_id}
                  </span>
                  <div style={{ width: '14px', height: '1px', background: '#222' }} />
                  <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.45em', color: '#2e2e2e', textTransform: 'uppercase', fontWeight: 700 }}>
                    {exhibits[activeIndex].year}
                  </span>
                </div>
                <p
                  className="cg"
                  style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.3, marginBottom: '10px', cursor: 'pointer' }}
                  onClick={() => setSelectedExhibit(exhibits[activeIndex])}
                >
                  "{exhibits[activeIndex].title}"
                </p>
                <span
                  style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', color: '#252525', textTransform: 'uppercase', cursor: 'pointer' }}
                  onClick={() => setSelectedExhibit(exhibits[activeIndex])}
                >
                  View object →
                </span>
              </div>

              {/* Auto-progress bar */}
              {!isPaused && !selectedExhibit && (
                <div style={{ width: 'min(360px, 54vw)', height: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '20px', overflow: 'hidden' }}>
                  <div
                    key={activeIndex}
                    style={{
                      height: '100%',
                      background: 'rgba(255,255,255,0.2)',
                      animation: `progressBar ${AUTO_INTERVAL}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* ── RIGHT CARD ── */}
            <div
              className="side-card absolute cursor-pointer"
              style={{
                right: 'calc(50% - 520px)',
                bottom: '60px',
                width: '240px',
                opacity: 0.32,
                filter: 'brightness(0.5) saturate(0.6)',
                transform: 'translateY(40px) scale(0.82)',
                transformOrigin: 'center bottom',
              }}
              onClick={next}
            >
              <div style={{ display: 'flex', justifyContent: 'center', height: '18px' }}>
                <div style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div style={{ background: 'linear-gradient(135deg, #3a2e20 0%, #251a0e 50%, #3a2e20 100%)', padding: '7px', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
                <div style={{ background: '#eae4d8', padding: '7px 7px 22px 7px' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#111' }}>
                    <Image src={exhibits[getIndex(1)].image_url} alt="" fill unoptimized className="object-cover" style={{ filter: 'saturate(0.7)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NAV ARROWS ── */}
        <button
          className="nav-btn absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center"
          onClick={prev}
          style={{ width: '42px', height: '42px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.22)', cursor: 'pointer', backdropFilter: 'blur(8px)', fontSize: '16px' }}
        >←</button>
        <button
          className="nav-btn absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center"
          onClick={next}
          style={{ width: '42px', height: '42px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.22)', cursor: 'pointer', backdropFilter: 'blur(8px)', fontSize: '16px' }}
        >→</button>

        {/* ── DOT NAV ── */}
        {exhibits.length > 1 && (
          <div style={{ position: 'absolute', bottom: '82px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {exhibits.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === activeIndex ? '22px' : '4px',
                  height: '3px',
                  borderRadius: '2px',
                  background: i === activeIndex ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.45s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* ── SWIPE HINT (mobile) ── */}
        {showSwipeHint && (
          <div
            className="md:hidden"
            style={{
              position: 'absolute',
              bottom: '110px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: showSwipeHint ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          >
            <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Swipe</span>
            <div style={{ animation: 'swipeAnim 1.5s ease-in-out infinite', fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>→</div>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
              const n = diff > 0
                ? (activeIndex + 1) % exhibits.length
                : ((activeIndex - 1) + exhibits.length) % exhibits.length;
              setActiveIndex(n);
              setSelectedExhibit(exhibits[n]);
            }
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(4,3,2,0.97)', backdropFilter: 'blur(28px)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '350px', pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(255,244,200,0.06) 0%, transparent 70%)' }} />

          {/* Modal arrows */}
          <button
            className="hidden md:flex nav-btn absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n = ((activeIndex - 1) + exhibits.length) % exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.22)', cursor: 'pointer' }}
          >←</button>
          <button
            className="hidden md:flex nav-btn absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n = (activeIndex + 1) % exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.22)', cursor: 'pointer' }}
          >→</button>

          <div
            className="modal-anim relative w-full max-w-5xl flex flex-col md:flex-row z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image panel */}
            <div className="w-full md:w-[52%] shrink-0" style={{ backgroundColor: '#0a0807', padding: '18px' }}>
              <div style={{ background: 'linear-gradient(135deg, #4a3825 0%, #2e1e10 40%, #4a3825 60%, #1e1005 100%)', padding: '8px', boxShadow: '0 24px 70px rgba(0,0,0,0.9)' }}>
                <div style={{ background: '#ede7db', padding: '9px 9px 26px 9px' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                    <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter: 'saturate(0.85) contrast(1.05)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,244,200,0.08) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.38)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Text panel */}
            <div className="w-full md:w-[48%] flex flex-col justify-between p-6 md:p-10" style={{ backgroundColor: '#090706', borderLeft: '1px solid rgba(255,255,255,0.04)', minHeight: '300px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#222', fontWeight: 700 }}>
                    {String(activeIndex + 1).padStart(2,'0')} / {String(exhibits.length).padStart(2,'0')}
                  </span>
                  <button
                    onClick={() => setSelectedExhibit(null)}
                    style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#333', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
                  >Close ×</button>
                </div>

                <div className="fu1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#282828', fontWeight: 700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width: '14px', height: '1px', background: '#1e1e1e' }} />
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#282828', fontWeight: 700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.88)', lineHeight: 1.2 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="fu1" style={{ width: '24px', height: '1px', background: '#181818' }} />

                <div className="fu2" style={{ position: 'relative' }}>
                  <div
                    ref={storyRef}
                    className="scrollbar-hide"
                    style={{ maxHeight: '220px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1';
                    }}
                  >
                    <p className="cg" style={{ fontSize: '15px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.8, color: 'rgba(255,255,255,0.6)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, #090706, transparent)', pointerEvents: 'none', transition: 'opacity 0.3s' }} />
                </div>
              </div>

              <div className="fu3" style={{ paddingTop: '18px', marginTop: '18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedExhibit.submitter_name && (
                  <p className="cg" style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#262626', fontStyle: 'italic' }}>
                    — {selectedExhibit.submitter_name}
                  </p>
                )}
                <button
                  onClick={() => handleShare(selectedExhibit)}
                  style={{ width: '100%', padding: '12px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.45em', textTransform: 'uppercase', fontWeight: 700, color: '#383838', border: '1px solid rgba(255,255,255,0.06)', background: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#383838'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >Share this object</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13,11,10,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', animation: 'blink 2.5s infinite' }} />
          <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.15)' }}>
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a
          href="/submit"
          style={{ padding: '10px 28px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.22)', textDecoration: 'none', transition: 'all 0.3s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
        >Apply</a>
      </div>
    </main>
  );
}
