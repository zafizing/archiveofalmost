'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const TOTAL_SLOTS = 150;

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const touchStartX = useRef<number>(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  const goTo = (i: number) => setActiveIndex(Math.max(0, Math.min(i, exhibits.length - 1)));

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedExhibit) {
        if (e.key === 'Escape') setSelectedExhibit(null);
        if (e.key === 'ArrowRight' && activeIndex < exhibits.length - 1) {
          const next = activeIndex + 1;
          setActiveIndex(next);
          setSelectedExhibit(exhibits[next]);
        }
        if (e.key === 'ArrowLeft' && activeIndex > 0) {
          const prev = activeIndex - 1;
          setActiveIndex(prev);
          setSelectedExhibit(exhibits[prev]);
        }
      } else {
        if (e.key === 'ArrowRight') goTo(activeIndex + 1);
        if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedExhibit, activeIndex, exhibits]);

  // Wheel scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 20 || e.deltaX > 20) setActiveIndex(i => Math.min(i + 1, exhibits.length - 1));
      else if (e.deltaY < -20 || e.deltaX < -20) setActiveIndex(i => Math.max(i - 1, 0));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [exhibits.length]);

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

  const CARD_W = 280;
  const CARD_GAP = 32;

  return (
    <main className="bg-black text-white overflow-hidden" style={{ height: '100dvh', fontFamily: 'Georgia, serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .modal-anim { animation: modalIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fu1 { animation: fadeUp 0.5s ease-out 0.05s forwards; opacity: 0; }
        .fu2 { animation: fadeUp 0.5s ease-out 0.15s forwards; opacity: 0; }
        .fu3 { animation: fadeUp 0.5s ease-out 0.25s forwards; opacity: 0; }
      `}</style>

      {/* TOP BAR */}
      <div className="fixed top-[57px] md:top-[61px] left-0 right-0 z-50 px-6 md:px-10 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="cg text-[10px] md:text-[11px] tracking-[0.5em] uppercase italic" style={{ color: '#444' }}>
          Permanent Collection
        </span>
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', color: '#2a2a2a', textTransform: 'uppercase', fontWeight: 700 }}>
            {exhibits.length > 0 ? activeIndex + 1 : 0} <span style={{ color: '#1a1a1a' }}>/ {exhibits.length}</span>
          </span>
          <span className="hidden md:block" style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.35em', color: '#1e1e1e', textTransform: 'uppercase' }}>
            ← → to navigate
          </span>
        </div>
      </div>

      {/* MUSEUM FLOOR */}
      <div
        ref={trackRef}
        className="relative flex flex-col items-center justify-center"
        style={{ height: '100dvh', overflow: 'hidden' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 40) goTo(activeIndex + 1);
          else if (diff < -40) goTo(activeIndex - 1);
        }}
      >
        {/* Subtle wall texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.006) 59px, rgba(255,255,255,0.006) 60px)', pointerEvents: 'none' }} />

        {/* Ceiling line */}
        <div style={{ position: 'absolute', top: '61px', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)' }} />

        {/* Spotlight from ceiling */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '220px', height: '60vh', background: 'radial-gradient(ellipse 40% 100% at 50% 0%, rgba(255,244,210,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Floor line */}
        <div style={{ position: 'absolute', bottom: '72px', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.025) 20%, rgba(255,255,255,0.025) 80%, transparent)' }} />

        {/* CAROUSEL */}
        {exhibits.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${CARD_GAP}px`,
            transform: `translateX(calc(50vw - ${activeIndex * (CARD_W + CARD_GAP) + CARD_W / 2}px))`,
            transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
            marginTop: '-30px',
            willChange: 'transform',
          }}>
            {exhibits.map((exhibit, i) => {
              const distance = Math.abs(i - activeIndex);
              const isActive = i === activeIndex;
              const scale = isActive ? 1 : distance === 1 ? 0.70 : 0.52;
              const opacity = isActive ? 1 : distance === 1 ? 0.40 : distance === 2 ? 0.18 : 0.06;
              const translateY = isActive ? 0 : distance === 1 ? 22 : 38;

              return (
                <div
                  key={exhibit.id}
                  style={{
                    width: `${CARD_W}px`,
                    flexShrink: 0,
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    opacity,
                    filter: isActive ? 'none' : 'brightness(0.55)',
                    transformOrigin: 'center bottom',
                    transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.7s ease, filter 0.7s ease',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => isActive ? setSelectedExhibit(exhibit) : goTo(i)}
                >
                  {/* Hanging wire */}
                  <div style={{ display: 'flex', justifyContent: 'center', height: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.08)' }} />
                  </div>

                  {/* Frame */}
                  <div style={{
                    background: 'linear-gradient(135deg, #3d3020 0%, #2a1e14 40%, #3d3020 60%, #1e1508 100%)',
                    padding: '8px',
                    boxShadow: isActive
                      ? '0 40px 100px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.05)'
                      : '0 20px 60px rgba(0,0,0,0.8)',
                    transition: 'box-shadow 0.5s ease',
                  }}>
                    {/* Passepartout */}
                    <div style={{ background: '#eee8de', padding: '8px 8px 26px 8px' }}>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#111' }}>
                        <Image
                          src={exhibit.image_url}
                          alt={exhibit.title}
                          fill unoptimized
                          className="object-cover"
                          style={{ filter: 'saturate(0.85) contrast(1.04)' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Museum label */}
                  <div style={{
                    marginTop: '14px',
                    paddingLeft: '2px',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                      <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', color: '#2e2e2e', textTransform: 'uppercase', fontWeight: 700 }}>
                        {exhibit.catalog_id}
                      </span>
                      <div style={{ width: '12px', height: '1px', background: '#1e1e1e' }} />
                      <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', color: '#2e2e2e', textTransform: 'uppercase', fontWeight: 700 }}>
                        {exhibit.year}
                      </span>
                    </div>
                    <p className="cg" style={{ fontSize: '19px', fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.25, marginBottom: '10px' }}>
                      "{exhibit.title}"
                    </p>
                    <p style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.35em', color: '#222', textTransform: 'uppercase' }}>
                      Tap to read →
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dot nav */}
        {exhibits.length > 1 && (
          <div style={{ position: 'absolute', bottom: '90px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '7px', alignItems: 'center' }}>
            {exhibits.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === activeIndex ? '18px' : '4px',
                  height: '3px',
                  borderRadius: '2px',
                  background: i === activeIndex ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Arrow buttons */}
        {activeIndex > 0 && (
          <button onClick={() => goTo(activeIndex - 1)}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', width: '38px', height: '38px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', transition: 'all 0.3s', backdropFilter: 'blur(8px)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >←</button>
        )}
        {activeIndex < exhibits.length - 1 && (
          <button onClick={() => goTo(activeIndex + 1)}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', width: '38px', height: '38px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', transition: 'all 0.3s', backdropFilter: 'blur(8px)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >→</button>
        )}
      </div>

      {/* MODAL */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50 && activeIndex < exhibits.length - 1) { const next = activeIndex + 1; setActiveIndex(next); setSelectedExhibit(exhibits[next]); }
            if (diff < -50 && activeIndex > 0) { const prev = activeIndex - 1; setActiveIndex(prev); setSelectedExhibit(exhibits[prev]); }
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(3,2,2,0.97)', backdropFilter: 'blur(28px)' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '600px', height: '380px', pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(255,244,200,0.055) 0%, transparent 70%)' }} />

          {activeIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); const prev = activeIndex - 1; setActiveIndex(prev); setSelectedExhibit(exhibits[prev]); }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >←</button>
          )}
          {activeIndex < exhibits.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); const next = activeIndex + 1; setActiveIndex(next); setSelectedExhibit(exhibits[next]); }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >→</button>
          )}

          <div
            className="modal-anim relative w-full max-w-5xl flex flex-col md:flex-row z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full md:w-[52%] shrink-0" style={{ backgroundColor: '#090707', padding: '18px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3d3020 0%, #2a1e14 40%, #3d3020 60%, #1e1508 100%)', padding: '7px', boxShadow: '0 24px 70px rgba(0,0,0,0.85)' }}>
                <div style={{ background: '#eee8de', padding: '8px 8px 22px 8px' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                    <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter: 'saturate(0.82) contrast(1.05)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,244,200,0.07) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[48%] flex flex-col justify-between p-6 md:p-10" style={{ backgroundColor: '#090707', borderLeft: '1px solid rgba(255,255,255,0.04)', minHeight: '300px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#222', fontWeight: 700 }}>{activeIndex + 1} / {exhibits.length}</span>
                  <button onClick={() => setSelectedExhibit(null)}
                    style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#333', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
                  >Close ×</button>
                </div>

                <div className="fu1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#282828', fontWeight: 700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width: '14px', height: '1px', background: '#1e1e1e' }} />
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#282828', fontWeight: 700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.88)', lineHeight: 1.2 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="fu1" style={{ width: '24px', height: '1px', background: '#181818' }} />

                <div className="fu2" style={{ position: 'relative' }}>
                  <div ref={storyRef} className="scrollbar-hide" style={{ maxHeight: '220px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1';
                    }}>
                    <p className="cg" style={{ fontSize: '15px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, #090707, transparent)', pointerEvents: 'none', transition: 'opacity 0.3s' }} />
                </div>
              </div>

              <div className="fu3" style={{ paddingTop: '18px', marginTop: '18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedExhibit.submitter_name && (
                  <p className="cg" style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#282828', fontStyle: 'italic' }}>— {selectedExhibit.submitter_name}</p>
                )}
                <button onClick={() => handleShare(selectedExhibit)}
                  style={{ width: '100%', padding: '12px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.45em', textTransform: 'uppercase', fontWeight: 700, color: '#3a3a3a', border: '1px solid rgba(255,255,255,0.06)', background: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#3a3a3a'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >Share this object</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', animation: 'pulse 2.5s infinite' }} />
          <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.18)' }}>
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a href="/submit"
          style={{ padding: '10px 28px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.22)', textDecoration: 'none', transition: 'all 0.3s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
        >Apply</a>
      </div>
    </main>
  );
}
