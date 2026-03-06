'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const TOTAL_SLOTS = 150;
const AUTO_INTERVAL = 10000;

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const touchStartX = useRef<number>(0);
  const storyRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  const fetchTotalCount = useCallback(async () => {
    const { count } = await supabase.from('exhibits').select('*', { count: 'exact', head: true }).eq('is_approved', true);
    if (count !== null) setTotalCount(count);
  }, []);
  useEffect(() => { fetchTotalCount(); }, [fetchTotalCount]);

  const fetchExhibits = useCallback(async () => {
    const { data, error } = await supabase.from('exhibits').select('*').eq('is_approved', true).order('created_at', { ascending: false });
    if (!error && data) setExhibits(data);
  }, []);
  useEffect(() => { fetchExhibits(); }, [fetchExhibits]);

  useEffect(() => {
    if (exhibits.length === 0 || isPaused || selectedExhibit) return;
    const t = setInterval(() => { setActiveIndex(i => (i + 1) % exhibits.length); setProgressKey(k => k + 1); }, AUTO_INTERVAL);
    return () => clearInterval(t);
  }, [exhibits.length, isPaused, selectedExhibit]);

  useEffect(() => { const t = setTimeout(() => setShowSwipeHint(false), 5000); return () => clearTimeout(t); }, []);

  const goTo = (i: number) => {
    setActiveIndex(((i % exhibits.length) + exhibits.length) % exhibits.length);
    setProgressKey(k => k + 1);
    setIsPaused(true);
    setShowSwipeHint(false);
    setTimeout(() => setIsPaused(false), 12000);
  };
  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);
  const getIdx = (offset: number) => ((activeIndex + offset) % exhibits.length + exhibits.length) % exhibits.length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (selectedExhibit) {
        if (e.key === 'Escape') setSelectedExhibit(null);
        if (e.key === 'ArrowRight') { const n = (activeIndex + 1) % exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }
        if (e.key === 'ArrowLeft') { const n = ((activeIndex - 1) + exhibits.length) % exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }
      } else {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedExhibit, activeIndex, exhibits]);

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
    <main className="text-white select-none" style={{ height: '100dvh', overflow: 'hidden', backgroundColor: '#0c0a09', fontFamily: 'Georgia, serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes progressFill { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        @keyframes swipeAnim { 0%,100%{transform:translateX(-5px);opacity:0.4;} 50%{transform:translateX(5px);opacity:1;} }
        @keyframes blink { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
        .modal-anim { animation: modalIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fu1 { animation: fadeUp 0.5s ease-out 0.05s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.5s ease-out 0.18s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.5s ease-out 0.30s forwards; opacity:0; }
        .navbtn { transition: all 0.25s; }
        .navbtn:hover { color:white !important; border-color:rgba(255,255,255,0.5) !important; background:rgba(255,255,255,0.07) !important; }
        .side-frame { transition: all 0.65s cubic-bezier(0.25,0.46,0.45,0.94); cursor:pointer; }

        /* Ornate frame corners */
        .museum-frame { position: relative; }
        .museum-frame::before,
        .museum-frame::after {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: rgba(200,162,88,0.7);
          border-style: solid;
          z-index: 2;
          pointer-events: none;
        }
        .museum-frame::before { top: 6px; left: 6px; border-width: 1px 0 0 1px; }
        .museum-frame::after  { top: 6px; right: 6px; border-width: 1px 1px 0 0; }
        .museum-frame-b::before,
        .museum-frame-b::after {
          content: '';
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: rgba(200,162,88,0.7);
          border-style: solid;
          z-index: 2;
          pointer-events: none;
        }
        .museum-frame-b::before { bottom: 6px; left: 6px; border-width: 0 0 1px 1px; }
        .museum-frame-b::after  { bottom: 6px; right: 6px; border-width: 0 1px 1px 0; }
        .side-frame:hover { opacity:0.85 !important; filter: brightness(0.85) !important; }
      `}</style>

      {/* TOP BAR */}
      <div className="fixed top-[57px] md:top-[61px] left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3"
        style={{ backgroundColor:'rgba(12,10,9,0.96)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <span className="cg tracking-[0.5em] uppercase italic" style={{ fontSize:'11px', color:'rgba(255,255,255,0.88)' }}>Permanent Collection</span>
        <div className="flex items-center gap-5">
          {exhibits.length > 0 && (
            <span style={{ fontSize:'10px', letterSpacing:'0.5em', color:'rgba(255,255,255,0.85)', textTransform:'uppercase', fontWeight:700 }}>
              {String(activeIndex+1).padStart(2,'0')} <span style={{ color:'rgba(255,255,255,0.2)' }}>/ {String(exhibits.length).padStart(2,'0')}</span>
            </span>
          )}
          <span className="hidden md:block" style={{ fontSize:'9px', letterSpacing:'0.35em', color:'rgba(255,255,255,0.75)', textTransform:'uppercase' }}>← → Navigate</span>
        </div>
      </div>

      {/* FULL-HEIGHT STAGE */}
      <div
        className="relative"
        style={{ height:'100dvh', display:'grid', gridTemplateColumns:'minmax(0,1fr) auto minmax(0,1fr)', gridTemplateRows:'1fr', alignItems:'center', overflow:'hidden' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const d = touchStartX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 40) d > 0 ? next() : prev(); }}
      >
        {/* Wall texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.005) 59px, rgba(255,255,255,0.005) 60px)', pointerEvents:'none', zIndex:0 }} />
        {/* Ceiling line */}
        <div style={{ position:'absolute', top:'95px', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.08) 85%, transparent)', pointerEvents:'none', zIndex:1 }} />
        {/* Floor line */}
        <div style={{ position:'absolute', bottom:'66px', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, transparent)', pointerEvents:'none', zIndex:1 }} />

        {exhibits.length > 0 && (<>

          {/* LEFT SIDE CARD — vertically centered in left column */}
          <div className="side-frame hidden md:flex items-center justify-end pr-8 relative z-10" style={{ height:'100%' }} onClick={prev}>
            <div style={{ width:'240px', opacity:0.72, filter:'brightness(0.72) saturate(0.75)', transform:'scale(0.92)', transformOrigin:'center center' }}>
              <div style={{ display:'flex', justifyContent:'center', height:'14px' }}>
                <div style={{ width:'1px', height:'100%', background:'rgba(255,255,255,0.08)' }} />
              </div>
              <div style={{ background:'linear-gradient(135deg,#3a2e20 0%,#251a0e 50%,#3a2e20 100%)', padding:'5px', boxShadow:'0 20px 50px rgba(0,0,0,0.95)' }}>
                <div style={{ background:'#e5dfd3', padding:'5px 5px 18px 5px' }}>
                  <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111' }}>
                    <Image src={exhibits[getIdx(-1)].image_url} alt="" fill unoptimized className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER CARD */}
          <div className="relative z-10 flex flex-col items-center" style={{ padding:'0 clamp(8px, 2vw, 16px)', maxWidth:'100vw' }}>
            {/* Wire from ceiling */}
            <div style={{ width:'1px', height:'40px', background:'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18))' }} />

            {/* Frame */}
            <div className="museum-frame museum-frame-b"
              onClick={() => setSelectedExhibit(exhibits[activeIndex])}
              style={{
                background:'linear-gradient(160deg, #7a5c3a 0%, #4a2c12 20%, #6a4c2e 40%, #3e2010 60%, #6a4c2e 80%, #7a5c3a 100%)',
                padding:'16px',
                boxShadow:'0 0 0 1px rgba(200,162,88,0.55), 0 0 0 3px rgba(20,14,8,0.9), 0 0 0 4px rgba(200,162,88,0.3), 0 0 80px rgba(255,248,220,0.38), 0 0 160px rgba(255,248,220,0.18), 0 50px 120px rgba(0,0,0,0.95)',
                cursor:'pointer',
                transition:'transform 0.4s ease, box-shadow 0.4s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(200,162,88,0.55), 0 0 0 3px rgba(20,14,8,0.9), 0 0 0 4px rgba(200,162,88,0.3), 0 0 80px rgba(255,248,220,0.38), 0 0 160px rgba(255,248,220,0.18), 0 50px 120px rgba(0,0,0,0.95)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(200,162,88,0.55), 0 0 0 3px rgba(20,14,8,0.9), 0 0 0 4px rgba(200,162,88,0.3), 0 0 80px rgba(255,248,220,0.38), 0 0 160px rgba(255,248,220,0.18), 0 50px 120px rgba(0,0,0,0.95)';
              }}
            >
              <div style={{ background:'#ede7db', padding:'12px 12px 36px 12px' }}>
                <div style={{ position:'relative', width:'clamp(240px, min(34vw, 80vw), 460px)', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111' }}>
                  <Image
                    key={activeIndex}
                    src={exhibits[activeIndex].image_url}
                    alt={exhibits[activeIndex].title}
                    fill unoptimized className="object-cover"
                    style={{ filter:'saturate(0.88) contrast(1.05)' }}
                  />
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,248,210,0.14) 0%, transparent 55%)' }} />
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 55px rgba(0,0,0,0.45)' }} />
                </div>
              </div>
            </div>

            {/* Label */}
            <div style={{ marginTop:'18px', width:'clamp(240px, min(34vw, 80vw), 460px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                <span style={{ fontSize:'9px', letterSpacing:'0.55em', color:'white', textTransform:'uppercase', fontWeight:700 }}>
                  {exhibits[activeIndex].catalog_id}
                </span>
                <div style={{ width:'16px', height:'1px', background:'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize:'9px', letterSpacing:'0.45em', color:'white', textTransform:'uppercase', fontWeight:700 }}>
                  {exhibits[activeIndex].year}
                </span>
              </div>
              <p
                className="cg"
                onClick={() => setSelectedExhibit(exhibits[activeIndex])}
                style={{ fontSize:'clamp(17px, 2vw, 23px)', fontStyle:'italic', fontWeight:300, color:'white', lineHeight:1.3, marginBottom:'10px', cursor:'pointer' }}
              >
                "{exhibits[activeIndex].title}"
              </p>
              <span
                onClick={() => setSelectedExhibit(exhibits[activeIndex])}
                style={{ fontSize:'9px', letterSpacing:'0.45em', color:'rgba(255,255,255,0.82)', textTransform:'uppercase', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.85)')}
                onMouseLeave={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.45)')}
              >View object →</span>

              {/* Progress bar */}
              <div style={{ marginTop:'16px', height:'2px', background:'rgba(255,255,255,0.08)', overflow:'hidden', borderRadius:'1px' }}>
                {!isPaused && !selectedExhibit && (
                  <div key={progressKey} style={{
                    height:'100%', background:'rgba(255,255,255,0.45)',
                    transformOrigin:'left', borderRadius:'1px',
                    animation:`progressFill ${AUTO_INTERVAL}ms linear forwards`,
                  }} />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE CARD — vertically centered in right column */}
          <div className="side-frame hidden md:flex items-center justify-start pl-8 relative z-10" style={{ height:'100%' }} onClick={next}>
            <div style={{ width:'240px', opacity:0.72, filter:'brightness(0.72) saturate(0.75)', transform:'scale(0.92)', transformOrigin:'center center' }}>
              <div style={{ display:'flex', justifyContent:'center', height:'14px' }}>
                <div style={{ width:'1px', height:'100%', background:'rgba(255,255,255,0.08)' }} />
              </div>
              <div style={{ background:'linear-gradient(135deg,#3a2e20 0%,#251a0e 50%,#3a2e20 100%)', padding:'5px', boxShadow:'0 20px 50px rgba(0,0,0,0.95)' }}>
                <div style={{ background:'#e5dfd3', padding:'5px 5px 18px 5px' }}>
                  <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111' }}>
                    <Image src={exhibits[getIdx(1)].image_url} alt="" fill unoptimized className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>)}

        {/* NAV ARROWS */}
        <button className="navbtn absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-20" onClick={prev}
          style={{ width:'44px', height:'44px', border:'1px solid rgba(255,255,255,0.55)', background:'rgba(0,0,0,0.6)', color:'white', cursor:'pointer', backdropFilter:'blur(8px)', fontSize:'18px' }}>←</button>
        <button className="navbtn absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-20" onClick={next}
          style={{ width:'44px', height:'44px', border:'1px solid rgba(255,255,255,0.55)', background:'rgba(0,0,0,0.6)', color:'white', cursor:'pointer', backdropFilter:'blur(8px)', fontSize:'18px' }}>→</button>

        {/* DOT NAV */}
        {exhibits.length > 1 && (
          <div style={{ position:'absolute', bottom:'82px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'7px', alignItems:'center', zIndex:10 }}>
            {exhibits.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === activeIndex ? '22px' : '5px', height:'4px', borderRadius:'2px',
                background: i === activeIndex ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                border:'none', cursor:'pointer', padding:0, transition:'all 0.4s ease',
              }} />
            ))}
          </div>
        )}

        {/* SWIPE HINT */}
        <div className="md:hidden" style={{
          position:'absolute', bottom:'108px', left:'50%', transform:'translateX(-50%)',
          display:'flex', alignItems:'center', gap:'8px', zIndex:10,
          opacity: showSwipeHint ? 1 : 0, transition:'opacity 1.2s ease', pointerEvents:'none',
        }}>
          <span style={{ fontSize:'9px', letterSpacing:'0.45em', color:'rgba(255,255,255,0.82)', textTransform:'uppercase' }}>Swipe</span>
          <div style={{ animation:'swipeAnim 1.4s ease-in-out infinite', color:'rgba(255,255,255,0.82)', fontSize:'13px' }}>→</div>
        </div>
      </div>

      {/* MODAL */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const d = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(d) > 50) {
              const n = d > 0 ? (activeIndex+1)%exhibits.length : ((activeIndex-1)+exhibits.length)%exhibits.length;
              setActiveIndex(n); setSelectedExhibit(exhibits[n]);
            }
          }}
        >
          <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(4,3,2,0.97)', backdropFilter:'blur(30px)' }} />
          {/* Mobile swipe hints in modal */}
          <div className="md:hidden" style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'space-between', pointerEvents:'none', padding:'0 16px', zIndex:5 }}>
            <div style={{ fontSize:'11px', letterSpacing:'0.3em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>← Swipe</div>
            <div style={{ fontSize:'11px', letterSpacing:'0.3em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>Swipe →</div>
          </div>
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'500px', height:'350px', pointerEvents:'none',
            background:'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(255,244,200,0.08) 0%, transparent 70%)' }} />

          <button className="navbtn hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n=((activeIndex-1)+exhibits.length)%exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border:'1px solid rgba(255,255,255,0.18)', background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.82)', cursor:'pointer', fontSize:'17px' }}>←</button>
          <button className="navbtn hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n=(activeIndex+1)%exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border:'1px solid rgba(255,255,255,0.18)', background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.82)', cursor:'pointer', fontSize:'17px' }}>→</button>

          <div
            className="modal-anim relative w-full max-w-5xl flex flex-col md:flex-row z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border:'1px solid rgba(255,255,255,0.35)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="w-full md:w-[52%] shrink-0" style={{ backgroundColor:'#0a0807', padding:'20px' }}>
              <div style={{ background:'linear-gradient(145deg,#52402a 0%,#301e0c 35%,#52402a 65%,#1e0e05 100%)', padding:'9px', boxShadow:'0 24px 70px rgba(0,0,0,0.9)' }}>
                <div style={{ background:'#ede7db', padding:'10px 10px 30px 10px' }}>
                  <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden' }}>
                    <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.85) contrast(1.05)' }} />
                    <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,244,200,0.1) 0%, transparent 60%)' }} />
                    <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 50px rgba(0,0,0,0.4)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="w-full md:w-[48%] flex flex-col justify-between p-6 md:p-10"
              style={{ backgroundColor:'#090706', borderLeft:'1px solid rgba(255,255,255,0.08)', minHeight:'300px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.82)', fontWeight:700 }}>
                    {String(activeIndex+1).padStart(2,'0')} / {String(exhibits.length).padStart(2,'0')}
                  </span>
                  <button onClick={() => setSelectedExhibit(null)}
                    style={{ fontSize:'11px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.88)', fontWeight:700, cursor:'pointer', background:'none', border:'none', transition:'color 0.2s', fontFamily:'Georgia' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color='white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.6)')}
                  >Close ×</button>
                </div>

                <div className="fu1">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.88)', fontWeight:700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width:'14px', height:'1px', background:'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize:'9px', letterSpacing:'0.45em', textTransform:'uppercase', color:'rgba(255,255,255,0.88)', fontWeight:700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize:'clamp(20px, 3vw, 34px)', fontWeight:300, fontStyle:'italic', color:'rgba(255,255,255,0.95)', lineHeight:1.2 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="fu1" style={{ width:'28px', height:'1px', background:'rgba(255,255,255,0.15)' }} />

                <div className="fu2" style={{ position:'relative' }}>
                  <div ref={storyRef} className="scrollbar-hide" style={{ maxHeight:'220px', overflowY:'auto' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1';
                    }}>
                    <p className="cg" style={{ fontSize:'19px', fontWeight:300, fontStyle:'italic', lineHeight:1.85, color:'rgba(255,255,255,0.88)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position:'absolute', bottom:0, left:0, right:0, height:'40px', background:'linear-gradient(to top, #090706, transparent)', pointerEvents:'none', transition:'opacity 0.3s' }} />
                </div>
              </div>

              <div className="fu3" style={{ paddingTop:'20px', marginTop:'20px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', gap:'12px' }}>
                {selectedExhibit.submitter_name && (
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'20px', height:'1px', background:'rgba(255,255,255,0.4)' }} />
                    <p className="cg" style={{ fontSize:'17px', letterSpacing:'0.25em', textTransform:'uppercase', color:'white', fontStyle:'italic', fontWeight:400, textDecoration:'underline', textUnderlineOffset:'4px', textDecorationColor:'rgba(255,255,255,0.3)', textDecorationThickness:'1px' }}>
                      {selectedExhibit.submitter_name}
                    </p>
                  </div>
                )}
                <button onClick={() => handleShare(selectedExhibit)}
                  style={{ width:'100%', padding:'13px', fontSize:'10px', letterSpacing:'0.45em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.82)', border:'1px solid rgba(255,255,255,0.22)', background:'none', cursor:'pointer', transition:'all 0.3s', fontFamily:'Georgia' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(255,255,255,0.6)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color='rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.22)'; e.currentTarget.style.background='none'; }}
                >Share this object</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor:'rgba(12,10,9,0.97)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'rgba(255,255,255,0.4)', animation:'blink 2.5s infinite' }} />
          <span style={{ fontSize:'10px', letterSpacing:'0.4em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.82)' }}>
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a href="/submit"
          style={{ padding:'10px 28px', fontSize:'10px', letterSpacing:'0.4em', textTransform:'uppercase', fontWeight:700, color:'white', border:'1px solid rgba(255,255,255,0.35)', textDecoration:'none', transition:'all 0.3s', fontFamily:'Georgia' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background='white'; (e.currentTarget as HTMLElement).style.color='black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='white'; }}
        >Apply</a>
      </div>
    </main>
  );
}
