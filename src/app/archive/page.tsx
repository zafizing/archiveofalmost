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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
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

  const getShareUrl = () => `https://archiveofalmost.co/archive`;

  const shareTwitter = (item: any) => {
    const text = encodeURIComponent(`"${item.title}" — ${item.catalog_id}, ${item.year}\n\nArchived at Archive of Almost.\n`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&via=archiveofalmost`, '_blank');
  };

  const shareFacebook = (item: any) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, '_blank');
  };

  const shareWhatsApp = (item: any) => {
    const text = encodeURIComponent(`"${item.title}" — ${item.catalog_id}, ${item.year}.\n\nArchived at Archive of Almost:\n${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const downloadCard = async (item: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0c0a09'; ctx.fillRect(0, 0, 1080, 1920);
    const vignette = ctx.createRadialGradient(540, 960, 200, 540, 960, 900);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, 1080, 1920);
    const img = document.createElement('img') as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); img.src = item.image_url; });
    const frameX = 120, frameY = 320, frameW = 840, frameH = 840;
    ctx.fillStyle = '#4a3220'; ctx.fillRect(frameX-18, frameY-18, frameW+36, frameH+36);
    ctx.strokeStyle = 'rgba(200,162,88,0.6)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(frameX-18, frameY-18, frameW+36, frameH+36);
    ctx.fillStyle = '#ede7db'; ctx.fillRect(frameX, frameY, frameW, frameH+60);
    if (img.width > 0) {
      ctx.save(); ctx.rect(frameX+14, frameY+14, frameW-28, frameH-28); ctx.clip();
      const scale = Math.max((frameW-28)/img.width, (frameH-28)/img.height);
      const dw = img.width*scale, dh = img.height*scale;
      ctx.drawImage(img, frameX+14+((frameW-28)-dw)/2, frameY+14+((frameH-28)-dh)/2, dw, dh);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '700 22px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(`${item.catalog_id}  —  ${item.year}`, 540, frameY+frameH+110);
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = 'italic 300 52px Georgia';
    const words = `"${item.title}"`.split(' ');
    let line = '', lines: string[] = [];
    for (const w of words) { const t = line+w+' '; if (ctx.measureText(t).width > 820 && line) { lines.push(line.trim()); line = w+' '; } else line = t; }
    if (line) lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, 540, frameY+frameH+185+i*68));
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(420, 1750); ctx.lineTo(660, 1750); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '700 20px Georgia';
    ctx.fillText('ARCHIVEOFALMOST.CO', 540, 1800);
    const link = document.createElement('a');
    link.download = `archive-of-almost-${item.catalog_id?.toLowerCase() || 'object'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95); link.click();
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
        @keyframes swipeAnim { 0%,100%{transform:translateX(-4px);opacity:0.4;} 50%{transform:translateX(4px);opacity:0.9;} }
        @keyframes blink { 0%,100%{opacity:0.35;} 50%{opacity:1;} }
        .modal-anim { animation: modalIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fu1 { animation: fadeUp 0.5s ease-out 0.05s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.5s ease-out 0.18s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.5s ease-out 0.30s forwards; opacity:0; }
        .navbtn { transition: all 0.25s; }
        .navbtn:hover { color:white !important; border-color:rgba(255,255,255,0.5) !important; background:rgba(255,255,255,0.07) !important; }
        .side-frame { transition: all 0.65s cubic-bezier(0.25,0.46,0.45,0.94); cursor:pointer; }
        .side-frame:hover { opacity:0.85 !important; }
        .museum-frame { position: relative; }
        .museum-frame::before, .museum-frame::after {
          content: ''; position: absolute; width: 24px; height: 24px;
          border-color: rgba(200,162,88,0.65); border-style: solid; z-index: 2; pointer-events: none;
        }
        .museum-frame::before { top: 7px; left: 7px; border-width: 1px 0 0 1px; }
        .museum-frame::after  { top: 7px; right: 7px; border-width: 1px 1px 0 0; }
        .museum-frame-b { position: relative; }
        .museum-frame-b::before, .museum-frame-b::after {
          content: ''; position: absolute; width: 24px; height: 24px;
          border-color: rgba(200,162,88,0.65); border-style: solid; z-index: 2; pointer-events: none;
        }
        .museum-frame-b::before { bottom: 7px; left: 7px; border-width: 0 0 1px 1px; }
        .museum-frame-b::after  { bottom: 7px; right: 7px; border-width: 0 1px 1px 0; }
      `}</style>

      {/* TOP BAR */}
      <div className="fixed top-[57px] md:top-[61px] left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-3"
        style={{ backgroundColor:'rgba(12,10,9,0.96)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <span className="cg tracking-[0.4em] uppercase italic" style={{ fontSize:'10px', color:'rgba(255,255,255,0.88)' }}>Permanent Collection</span>
        <div className="flex items-center gap-4">
          {exhibits.length > 0 && (
            <span style={{ fontSize:'10px', letterSpacing:'0.5em', color:'rgba(255,255,255,0.85)', textTransform:'uppercase', fontWeight:700 }}>
              {String(activeIndex+1).padStart(2,'0')} <span style={{ color:'rgba(255,255,255,0.2)' }}>/ {String(exhibits.length).padStart(2,'0')}</span>
            </span>
          )}
          <span className="hidden md:block" style={{ fontSize:'9px', letterSpacing:'0.35em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>← → Navigate</span>
        </div>
      </div>

      {/* STAGE */}
      <div
        style={{ height:'100dvh', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const dx = touchStartX.current - e.changedTouches[0].clientX;
          const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
          if (Math.abs(dx) > 45 && Math.abs(dx) > dy * 1.2) dx > 0 ? next() : prev();
        }}
      >
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.004) 59px, rgba(255,255,255,0.004) 60px)', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'absolute', top:'95px', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.07) 80%, transparent)', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'absolute', bottom:'66px', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)', pointerEvents:'none', zIndex:1 }} />

        {exhibits.length > 0 && (<>

          {/* LEFT SLIVER — desktop only */}
          <div className="side-frame hidden md:flex items-center justify-end" onClick={prev}
            style={{ position:'absolute', left:0, top:0, bottom:0, width:'clamp(60px, 8vw, 180px)', zIndex:10, overflow:'hidden' }}>
            <div style={{ width:'260px', opacity:0.6, filter:'brightness(0.6) saturate(0.7)', transform:'scale(0.88) translateX(60px)', transformOrigin:'right center', flexShrink:0 }}>
              <div style={{ background:'linear-gradient(135deg,#3a2e20 0%,#251a0e 50%,#3a2e20 100%)', padding:'5px', boxShadow:'0 20px 50px rgba(0,0,0,0.9)' }}>
                <div style={{ background:'#e5dfd3', padding:'5px 5px 18px 5px' }}>
                  <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111' }}>
                    <Image src={exhibits[getIdx(-1)].image_url} alt="" fill unoptimized className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER FRAME */}
          <div className="relative z-10 flex flex-col items-center" style={{ padding:'0 56px', width:'100%', maxWidth:'min(92vw, 520px)' }}>
            <div style={{ width:'1px', height:'36px', background:'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15))' }} />
            <div
              onClick={() => setSelectedExhibit(exhibits[activeIndex])}
              style={{
                width:'100%',
                position:'relative',
                cursor:'pointer',
                transition:'transform 0.4s ease',
                filter:'drop-shadow(0 30px 60px rgba(0,0,0,0.95)) drop-shadow(0 6px 16px rgba(0,0,0,0.7))',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Spotlight glow on wall */}
              <div style={{ position:'absolute', inset:'-40px', background:'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,244,200,0.10) 0%, transparent 65%)', pointerEvents:'none', zIndex:-1 }} />

              {/* IMAGE behind frame — padded to sit inside frame opening */}
              <div style={{ position:'relative', width:'100%', aspectRatio:'1/1', backgroundColor:'#0c0a09' }}>
                <div style={{ position:'absolute', inset:'13.5%', overflow:'hidden' }}>
                  <Image key={activeIndex} src={exhibits[activeIndex].image_url} alt={exhibits[activeIndex].title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.88) contrast(1.05)' }} />
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 30px rgba(0,0,0,0.4)' }} />
                </div>
                {/* Frame PNG overlay — sits on top of photo */}
                <img
                  src="https://kfsllwsvqzshggvyuqvm.supabase.co/storage/v1/object/public/assets/frame.png"
                  alt=""
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:2 }}
                />
              </div>
            </div>

            {/* Label */}
            <div style={{ marginTop:'16px', width:'100%' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'7px' }}>
                <span style={{ fontSize:'9px', letterSpacing:'0.55em', color:'white', textTransform:'uppercase', fontWeight:700 }}>{exhibits[activeIndex].catalog_id}</span>
                <div style={{ width:'14px', height:'1px', background:'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize:'9px', letterSpacing:'0.45em', color:'white', textTransform:'uppercase', fontWeight:700 }}>{exhibits[activeIndex].year}</span>
              </div>
              <p className="cg" onClick={() => setSelectedExhibit(exhibits[activeIndex])}
                style={{ fontSize:'clamp(16px, 2.2vw, 22px)', fontStyle:'italic', fontWeight:300, color:'rgba(255,255,255,0.95)', lineHeight:1.3, marginBottom:'8px', cursor:'pointer' }}>
                "{exhibits[activeIndex].title}"
              </p>
              <span onClick={() => setSelectedExhibit(exhibits[activeIndex])}
                style={{ fontSize:'9px', letterSpacing:'0.45em', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.85)')}
                onMouseLeave={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.55)')}
              >View object →</span>
              <div style={{ marginTop:'14px', height:'1.5px', background:'rgba(255,255,255,0.07)', overflow:'hidden', borderRadius:'1px' }}>
                {!isPaused && !selectedExhibit && (
                  <div key={progressKey} style={{ height:'100%', background:'rgba(255,255,255,0.42)', transformOrigin:'left', borderRadius:'1px', animation:`progressFill ${AUTO_INTERVAL}ms linear forwards` }} />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SLIVER — desktop only */}
          <div className="side-frame hidden md:flex items-center justify-start" onClick={next}
            style={{ position:'absolute', right:0, top:0, bottom:0, width:'clamp(60px, 8vw, 180px)', zIndex:10, overflow:'hidden' }}>
            <div style={{ width:'260px', opacity:0.6, filter:'brightness(0.6) saturate(0.7)', transform:'scale(0.88) translateX(-60px)', transformOrigin:'left center', flexShrink:0 }}>
              <div style={{ background:'linear-gradient(135deg,#3a2e20 0%,#251a0e 50%,#3a2e20 100%)', padding:'5px', boxShadow:'0 20px 50px rgba(0,0,0,0.9)' }}>
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
        <button className="navbtn absolute z-20 flex items-center justify-center" onClick={prev}
          style={{ left:'12px', top:'50%', transform:'translateY(-50%)', width:'40px', height:'40px', border:'1px solid rgba(255,255,255,0.5)', background:'rgba(0,0,0,0.65)', color:'white', cursor:'pointer', backdropFilter:'blur(8px)', fontSize:'16px' }}>←</button>
        <button className="navbtn absolute z-20 flex items-center justify-center" onClick={next}
          style={{ right:'12px', top:'50%', transform:'translateY(-50%)', width:'40px', height:'40px', border:'1px solid rgba(255,255,255,0.5)', background:'rgba(0,0,0,0.65)', color:'white', cursor:'pointer', backdropFilter:'blur(8px)', fontSize:'16px' }}>→</button>

        {/* DOT NAV */}
        {exhibits.length > 1 && (
          <div style={{ position:'absolute', bottom:'80px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'6px', alignItems:'center', zIndex:10 }}>
            {exhibits.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ width: i===activeIndex ? '20px' : '5px', height:'4px', borderRadius:'2px', background: i===activeIndex ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', padding:0, transition:'all 0.4s ease' }} />
            ))}
          </div>
        )}

        {/* SWIPE HINT */}
        <div className="md:hidden" style={{ position:'absolute', bottom:'56px', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'6px', zIndex:10, opacity: showSwipeHint ? 1 : 0, transition:'opacity 1.2s ease', pointerEvents:'none', whiteSpace:'nowrap' }}>
          <span style={{ fontSize:'8px', letterSpacing:'0.4em', color:'rgba(255,255,255,0.45)', textTransform:'uppercase' }}>Swipe to navigate</span>
          <div style={{ animation:'swipeAnim 1.4s ease-in-out infinite', color:'rgba(255,255,255,0.45)', fontSize:'11px' }}>→</div>
        </div>
      </div>

      {/* ══════════════ MODAL ══════════════ */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center md:items-center"
          style={{ padding:'0', paddingTop:'57px' }}
          onClick={() => { setSelectedExhibit(null); setShowShareMenu(false); setShowFullImage(false); }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            const dx = touchStartX.current - e.changedTouches[0].clientX;
            const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
            if (Math.abs(dx) > 50 && Math.abs(dx) > dy * 1.5) {
              const n = dx > 0 ? (activeIndex+1)%exhibits.length : ((activeIndex-1)+exhibits.length)%exhibits.length;
              setActiveIndex(n); setSelectedExhibit(exhibits[n]);
            }
          }}
        >
          <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(4,3,2,0.97)', backdropFilter:'blur(30px)' }} />

          {/* Desktop nav */}
          <button className="navbtn hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n=((activeIndex-1)+exhibits.length)%exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.85)', cursor:'pointer', fontSize:'17px' }}>←</button>
          <button className="navbtn hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n=(activeIndex+1)%exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.85)', cursor:'pointer', fontSize:'17px' }}>→</button>

          {/* Modal card */}
          <div
            className="modal-anim relative w-full z-10 flex flex-col md:flex-row"
            style={{
              maxWidth:'900px',
              height:'calc(100dvh - 57px)',
              overflowY:'hidden',
              border:'none',
              borderTop:'1px solid rgba(255,255,255,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── MOBILE: küçük fotoğraf üstte yatay ── */}
            <div className="md:hidden w-full flex flex-row" style={{ backgroundColor:'#0a0807', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width:'110px', flexShrink:0, padding:'10px 6px 10px 10px', cursor:'zoom-in' }}
                onClick={() => setShowFullImage(true)}>
                <div style={{ background:'linear-gradient(145deg,#52402a 0%,#301e0c 35%,#52402a 65%,#1e0e05 100%)', padding:'5px', boxShadow:'0 8px 24px rgba(0,0,0,0.8)' }}>
                  <div style={{ background:'#ede7db', padding:'4px 4px 10px 4px' }}>
                    <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden' }}>
                      <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.85) contrast(1.05)' }} />
                      {/* Zoom hint */}
                      <div style={{ position:'absolute', bottom:'4px', right:'4px', background:'rgba(0,0,0,0.5)', borderRadius:'2px', padding:'2px 4px' }}>
                        <span style={{ fontSize:'8px', color:'rgba(255,255,255,0.7)' }}>⊕</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex:1, padding:'14px 12px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'5px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontSize:'8px', letterSpacing:'0.4em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', fontWeight:700 }}>{selectedExhibit.catalog_id}</span>
                  <div style={{ width:'8px', height:'1px', background:'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontSize:'8px', letterSpacing:'0.35em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', fontWeight:700 }}>{selectedExhibit.year}</span>
                </div>
                <h2 className="cg" style={{ fontSize:'17px', fontWeight:300, fontStyle:'italic', color:'rgba(255,255,255,0.95)', lineHeight:1.25 }}>"{selectedExhibit.title}"</h2>
                {selectedExhibit.submitter_name && <p className="cg" style={{ fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', fontStyle:'italic' }}>— {selectedExhibit.submitter_name}</p>}
              </div>
              <button onClick={() => setSelectedExhibit(null)} style={{ alignSelf:'flex-start', margin:'10px 10px 0 0', fontSize:'10px', letterSpacing:'0.4em', color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer', fontFamily:'Georgia', flexShrink:0 }}>×</button>
            </div>

            {/* ── DESKTOP: full framed image ── */}
            <div className="hidden md:block w-full md:w-[50%] shrink-0" style={{ backgroundColor:'#0a0807', padding:'12px' }}>
              <div style={{ background:'linear-gradient(145deg,#52402a 0%,#301e0c 35%,#52402a 65%,#1e0e05 100%)', padding:'7px', boxShadow:'0 24px 70px rgba(0,0,0,0.9)' }}>
                <div style={{ background:'#ede7db', padding:'7px 7px 20px 7px' }}>
                  <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden' }}>
                    <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.85) contrast(1.05)' }} />
                    <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,244,200,0.1) 0%, transparent 60%)' }} />
                    <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 50px rgba(0,0,0,0.4)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── INFO SIDE ── */}
            <div className="w-full md:w-[50%] flex flex-col justify-between p-4 md:p-10"
              style={{ backgroundColor:'#090706', flex:1, overflow:'hidden' }}>
              <div className="hidden md:block" style={{ position:'absolute', top:0, bottom:0, left:'50%', width:'1px', background:'rgba(255,255,255,0.08)' }} />

              <div style={{ display:'flex', flexDirection:'column', gap:'12px', flex:1, overflow:'hidden' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', fontWeight:700 }}>
                    {String(activeIndex+1).padStart(2,'0')} / {String(exhibits.length).padStart(2,'0')}
                  </span>
                  <button onClick={() => setSelectedExhibit(null)}
                    className="hidden md:block"
                    style={{ fontSize:'10px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, cursor:'pointer', background:'none', border:'none', fontFamily:'Georgia' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color='white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.85)')}
                  >Close ×</button>
                </div>

                <div className="fu1">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                    <span style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)', fontWeight:700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width:'12px', height:'1px', background:'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize:'9px', letterSpacing:'0.45em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)', fontWeight:700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize:'clamp(18px, 2.8vw, 32px)', fontWeight:300, fontStyle:'italic', color:'rgba(255,255,255,0.96)', lineHeight:1.25 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="fu1" style={{ width:'24px', height:'1px', background:'rgba(255,255,255,0.15)', flexShrink:0 }} />

                <div className="fu2 scrollbar-hide" style={{ position:'relative', flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' as any }}
                    onScroll={(e) => { const el = e.currentTarget; if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1'; }}>
                  <div ref={storyRef}>
                    <p className="cg" style={{ fontSize:'clamp(14px, 1.8vw, 17px)', fontWeight:300, fontStyle:'italic', lineHeight:1.8, color:'rgba(255,255,255,0.88)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position:'sticky', bottom:0, left:0, right:0, height:'36px', background:'linear-gradient(to top, #090706, transparent)', pointerEvents:'none', transition:'opacity 0.3s' }} />
                </div>
              </div>

              <div className="fu3" style={{ paddingTop:'12px', marginTop:'12px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', gap:'8px' }}>
                {selectedExhibit.submitter_name && (
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'18px', height:'1px', background:'rgba(255,255,255,0.35)' }} />
                    <p className="cg" style={{ fontSize:'15px', letterSpacing:'0.2em', textTransform:'uppercase', color:'white', fontStyle:'italic', fontWeight:400, textDecoration:'underline', textUnderlineOffset:'4px', textDecorationColor:'rgba(255,255,255,0.25)', textDecorationThickness:'1px' }}>
                      {selectedExhibit.submitter_name}
                    </p>
                  </div>
                )}
                <div style={{ position:'relative' }}>
                  <button onClick={() => setShowShareMenu(s => !s)}
                    style={{ width:'100%', padding:'11px', fontSize:'9px', letterSpacing:'0.45em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.2)', background:'none', cursor:'pointer', transition:'all 0.3s', fontFamily:'Georgia' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color='rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.background='none'; }}
                  >{showShareMenu ? 'Close ↑' : 'Share this object'}</button>

                  {showShareMenu && (
                    <div style={{ marginTop:'5px', display:'flex', flexDirection:'column', gap:'4px' }}>
                      {[
                        { label: '𝕏  Post on X / Twitter', fn: () => shareTwitter(selectedExhibit) },
                        { label: 'f  Share on Facebook',   fn: () => shareFacebook(selectedExhibit) },
                        { label: '◎  Send on WhatsApp',    fn: () => shareWhatsApp(selectedExhibit) },
                        { label: '↓  Download Story Card', fn: () => downloadCard(selectedExhibit) },
                      ].map((opt) => (
                        <button key={opt.label} onClick={opt.fn}
                          style={{ width:'100%', padding:'9px 14px', fontSize:'9px', letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.02)', cursor:'pointer', transition:'all 0.25s', fontFamily:'Georgia', textAlign:'left' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(255,255,255,0.35)'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
                        >{opt.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL IMAGE OVERLAY — mobile only, tap to close */}
      {showFullImage && selectedExhibit && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ backgroundColor:'rgba(0,0,0,0.97)', backdropFilter:'blur(20px)' }}
          onClick={() => setShowFullImage(false)}
        >
          <div style={{ position:'relative', width:'92vw', maxWidth:'500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background:'linear-gradient(145deg,#52402a 0%,#301e0c 35%,#52402a 65%,#1e0e05 100%)', padding:'8px', boxShadow:'0 30px 80px rgba(0,0,0,0.9)' }}>
              <div style={{ background:'#ede7db', padding:'6px 6px 20px 6px' }}>
                <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden' }}>
                  <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.85) contrast(1.05)' }} />
                  {/* X on image corner */}
                  <button
                    onClick={() => setShowFullImage(false)}
                    style={{ position:'absolute', top:'8px', right:'8px', width:'28px', height:'28px', background:'rgba(0,0,0,0.65)', border:'none', color:'white', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
                  >×</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor:'rgba(12,10,9,0.97)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'rgba(255,255,255,0.35)', animation:'blink 2.5s infinite', flexShrink:0 }} />
          <span style={{ fontSize:'9px', letterSpacing:'0.35em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>
            <span className="hidden md:inline">{totalCount} of {TOTAL_SLOTS} objects archived</span>
            <span className="md:hidden">{totalCount} / {TOTAL_SLOTS} archived</span>
          </span>
        </div>
        <a href="/submit"
          style={{ padding:'9px 22px', fontSize:'9px', letterSpacing:'0.4em', textTransform:'uppercase', fontWeight:700, color:'white', border:'1px solid rgba(255,255,255,0.35)', textDecoration:'none', transition:'all 0.3s', fontFamily:'Georgia', flexShrink:0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background='white'; (e.currentTarget as HTMLElement).style.color='black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='white'; }}
        >Apply</a>
      </div>
    </main>
  );
}
