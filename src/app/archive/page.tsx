'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const TOTAL_SLOTS = 150;
const AUTO_INTERVAL = 7000;

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
  const router = useRouter();
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
        if (e.key === 'Escape') { setSelectedExhibit(null); setShowShareMenu(false); setShowFullImage(false); }
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

  // Her objenin kendi URL'i
  const getShareUrl = (item: any) =>
    `https://archiveofalmost.co/archive/${item.catalog_id.toLowerCase()}`;

  const shareTwitter = (item: any) => {
    const text = encodeURIComponent(`"${item.title}" — ${item.catalog_id}, ${item.year}\n\nArchived at Archive of Almost.\n`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(getShareUrl(item))}&via=archiveofalmost`, '_blank');
  };
  const shareFacebook = (item: any) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(item))}`, '_blank');
  };
  const shareWhatsApp = (item: any) => {
    const text = encodeURIComponent(`"${item.title}" — ${item.catalog_id}, ${item.year}.\n\nArchived at Archive of Almost:\n${getShareUrl(item)}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  const copyLink = (item: any) => {
    navigator.clipboard.writeText(getShareUrl(item));
  };

  // Story card — foto üst yarı, hikaye alt yarı
  const downloadCard = async (item: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, 1080, 1920);

    // Vignette
    const vignette = ctx.createRadialGradient(540, 960, 200, 540, 960, 960);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1080, 1920);

    // Load image
    const img = document.createElement('img') as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); img.src = item.image_url; });

    // Photo — top 40% only
    const photoX = 0, photoY = 0, photoW = 1080, photoH = 680;
    if (img.width > 0) {
      ctx.save();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      const sc = Math.max(photoW / img.width, photoH / img.height);
      const dw = img.width * sc, dh = img.height * sc;
      ctx.drawImage(img, photoX + (photoW - dw) / 2, photoY + (photoH - dh) / 2, dw, dh);
      ctx.restore();
      // Strong bottom fade on photo
      const fadeGrad = ctx.createLinearGradient(0, photoY + photoH * 0.45, 0, photoY + photoH);
      fadeGrad.addColorStop(0, 'rgba(12,10,9,0)');
      fadeGrad.addColorStop(1, 'rgba(12,10,9,1)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 720); ctx.lineTo(1020, 720); ctx.stroke();

    // Catalog + year
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '700 22px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.catalog_id}  —  ${item.year}`, 60, 775);

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.font = 'italic 300 52px Georgia';
    const titleWords = `"${item.title}"`.split(' ');
    let tLine = '', tLines: string[] = [];
    for (const w of titleWords) {
      const t = tLine + w + ' ';
      if (ctx.measureText(t).width > 960 && tLine) { tLines.push(tLine.trim()); tLine = w + ' '; }
      else tLine = t;
    }
    if (tLine) tLines.push(tLine.trim());
    tLines.forEach((l, i) => ctx.fillText(l, 60, 850 + i * 66));

    // Thin divider under title
    const afterTitle = 850 + tLines.length * 66 + 20;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, afterTitle); ctx.lineTo(120, afterTitle); ctx.stroke();

    // Description — dynamic font size to fit available space
    const descStartY = afterTitle + 44;
    const submitterHeight = item.submitter_name ? 80 : 0;
    const bottomReserve = 120; // space for submitter + bottom URL
    const availableHeight = 1920 - descStartY - submitterHeight - bottomReserve;

    // Try font sizes from 28 down to 18 until it fits
    let descFontSize = 28;
    let descLineHeight = 46;
    let dLines: string[] = [];

    for (let fontSize = 28; fontSize >= 18; fontSize -= 2) {
      descLineHeight = Math.round(fontSize * 1.65);
      ctx.font = `italic 300 ${fontSize}px Georgia`;
      const descWords = item.description.split(' ');
      let dLine = '', lines: string[] = [];
      for (const w of descWords) {
        const t = dLine + w + ' ';
        if (ctx.measureText(t).width > 960 && dLine) { lines.push(dLine.trim()); dLine = w + ' '; }
        else dLine = t;
      }
      if (dLine) lines.push(dLine.trim());
      const totalHeight = lines.length * descLineHeight;
      dLines = lines;
      descFontSize = fontSize;
      if (totalHeight <= availableHeight) break;
    }

    // If still doesn't fit at 18px, truncate with ellipsis
    const maxLines = Math.floor(availableHeight / descLineHeight);
    if (dLines.length > maxLines) {
      dLines = dLines.slice(0, maxLines);
      dLines[dLines.length - 1] = dLines[dLines.length - 1].replace(/\s+\S+$/, '') + '…';
    }

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = `italic 300 ${descFontSize}px Georgia`;
    dLines.forEach((l, i) => ctx.fillText(l, 60, descStartY + i * descLineHeight));

    // Submitter
    if (item.submitter_name) {
      const subY = descStartY + dLines.length * descLineHeight + 52;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(60, subY - 10); ctx.lineTo(90, subY - 10); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'italic 300 24px Georgia';
      ctx.textAlign = 'left';
      ctx.fillText(item.submitter_name, 102, subY);
    }

    // Bottom
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(390, 1840); ctx.lineTo(690, 1840); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '700 19px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('ARCHIVEOFALMOST.CO', 540, 1882);

    const link = document.createElement('a');
    link.download = `archive-of-almost-${item.catalog_id?.toLowerCase() || 'object'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const shareOptions = (item: any) => [
    { label: '𝕏  Post on X / Twitter', fn: () => shareTwitter(item) },
    { label: 'f  Share on Facebook',   fn: () => shareFacebook(item) },
    { label: '◎  Send on WhatsApp',    fn: () => shareWhatsApp(item) },
    { label: '⎘  Copy link',           fn: () => copyLink(item) },
    { label: '↓  Download Story Card', fn: () => downloadCard(item) },
  ];

  return (
    <main className="text-white select-none" style={{ height:'100dvh', overflow:'hidden', backgroundColor:'#0c0a09', fontFamily:'Georgia, serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes progressFill { from{transform:scaleX(0);}to{transform:scaleX(1);} }
        @keyframes swipeAnim { 0%,100%{transform:translateX(-4px);opacity:0.4;}50%{transform:translateX(4px);opacity:0.9;} }
        @keyframes blink { 0%,100%{opacity:0.35;}50%{opacity:1;} }
        .modal-anim { animation: modalIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fu1 { animation: fadeUp 0.5s ease-out 0.05s forwards; opacity:0; }
        .fu2 { animation: fadeUp 0.5s ease-out 0.18s forwards; opacity:0; }
        .fu3 { animation: fadeUp 0.5s ease-out 0.30s forwards; opacity:0; }
        .navbtn { transition: all 0.25s; }
        .navbtn:hover { color:white !important; border-color:rgba(255,255,255,0.5) !important; background:rgba(255,255,255,0.07) !important; }
        .side-frame { transition: opacity 0.65s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94); cursor:pointer; }
        .side-frame:hover > div { opacity:0.65 !important; }
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
        onTouchStart={(e) => { touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const dx=touchStartX.current-e.changedTouches[0].clientX;
          const dy=Math.abs(touchStartY.current-e.changedTouches[0].clientY);
          if(Math.abs(dx)>45&&Math.abs(dx)>dy*1.2) dx>0?next():prev();
        }}
      >
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.004) 59px, rgba(255,255,255,0.004) 60px)', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'absolute', top:'95px', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.07) 80%, transparent)', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'absolute', bottom:'66px', left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.04) 80%, transparent)', pointerEvents:'none', zIndex:1 }} />

        {exhibits.length > 0 && (<>
          {/* LEFT SIDE */}
          <div className="hidden md:flex items-center justify-center" onClick={prev}
            style={{ position:'absolute', left:'20px', top:0, bottom:0, width:'calc(50% - 280px)', zIndex:10, cursor:'pointer' }}>
            <div style={{ width:'min(230px, 90%)', opacity:0.5, filter:'brightness(0.5) saturate(0.55)', transition:'opacity 0.3s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity='0.72')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity='0.5')}>
              <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111' }}>
                <Image src={exhibits[getIdx(-1)].image_url} alt="" fill unoptimized className="object-cover" />
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="relative z-10 flex flex-col items-center" style={{ width:'min(480px, 90vw)', flexShrink:0 }}>
            <div onClick={() => { setSelectedExhibit(exhibits[activeIndex]); router.push(`/archive/${exhibits[activeIndex].catalog_id.toLowerCase()}`, { scroll: false }); }}
              style={{ width:'100%', position:'relative', cursor:'pointer', transition:'transform 0.45s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}>
              <div className="hidden md:block" style={{ position:'absolute', inset:'-50px', background:'radial-gradient(ellipse 110% 100% at 50% 50%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.28) 35%, transparent 62%)', pointerEvents:'none', zIndex:-1, filter:'blur(15px)' }} />
              <div style={{ position:'absolute', top:'98%', left:'8%', right:'8%', height:'50px', background:'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(0,0,0,0.85) 0%, transparent 80%)', pointerEvents:'none', zIndex:-1 }} />
              <div style={{ position:'relative', width:'100%', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111', boxShadow:'0 0 0 1px rgba(255,255,255,0.06)' }}>
                <Image key={activeIndex} src={exhibits[activeIndex].image_url} alt={exhibits[activeIndex].title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.88) contrast(1.05)' }} />
                <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 40px rgba(0,0,0,0.45)' }} />
              </div>
            </div>
            <div style={{ marginTop:'18px', width:'100%' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'7px' }}>
                <span style={{ fontSize:'9px', letterSpacing:'0.55em', color:'white', textTransform:'uppercase', fontWeight:700 }}>{exhibits[activeIndex].catalog_id}</span>
                <div style={{ width:'14px', height:'1px', background:'rgba(255,255,255,0.3)' }} />
                <span style={{ fontSize:'9px', letterSpacing:'0.45em', color:'white', textTransform:'uppercase', fontWeight:700 }}>{exhibits[activeIndex].year}</span>
              </div>
              <p className="cg" onClick={() => { setSelectedExhibit(exhibits[activeIndex]); router.push(`/archive/${exhibits[activeIndex].catalog_id.toLowerCase()}`, { scroll: false }); }}
                style={{ fontSize:'clamp(16px, 2.2vw, 22px)', fontStyle:'italic', fontWeight:300, color:'white', lineHeight:1.3, marginBottom:'8px', cursor:'pointer' }}>
                "{exhibits[activeIndex].title}"
              </p>
              <span onClick={() => { setSelectedExhibit(exhibits[activeIndex]); router.push(`/archive/${exhibits[activeIndex].catalog_id.toLowerCase()}`, { scroll: false }); }}
                style={{ fontSize:'9px', letterSpacing:'0.45em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', cursor:'pointer', transition:'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.9)')}
                onMouseLeave={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.5)')}
              >View object →</span>
              <div style={{ marginTop:'14px', height:'1.5px', background:'rgba(255,255,255,0.07)', overflow:'hidden', borderRadius:'1px' }}>
                {!isPaused && !selectedExhibit && (
                  <div key={progressKey} style={{ height:'100%', background:'rgba(255,255,255,0.4)', transformOrigin:'left', borderRadius:'1px', animation:`progressFill ${AUTO_INTERVAL}ms linear forwards` }} />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center justify-center" onClick={next}
            style={{ position:'absolute', right:'20px', top:0, bottom:0, width:'calc(50% - 280px)', zIndex:10, cursor:'pointer' }}>
            <div style={{ width:'min(230px, 90%)', opacity:0.5, filter:'brightness(0.5) saturate(0.55)', transition:'opacity 0.3s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity='0.72')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity='0.5')}>
              <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden', backgroundColor:'#111' }}>
                <Image src={exhibits[getIdx(1)].image_url} alt="" fill unoptimized className="object-cover" />
              </div>
            </div>
          </div>
        </>)}

        <button className="navbtn hidden md:flex absolute z-20 items-center justify-center" onClick={prev}
          style={{ left:'12px', top:'50%', transform:'translateY(-50%)', width:'40px', height:'40px', border:'1px solid rgba(255,255,255,0.45)', background:'rgba(0,0,0,0.6)', color:'white', cursor:'pointer', backdropFilter:'blur(8px)', fontSize:'16px' }}>←</button>
        <button className="navbtn hidden md:flex absolute z-20 items-center justify-center" onClick={next}
          style={{ right:'12px', top:'50%', transform:'translateY(-50%)', width:'40px', height:'40px', border:'1px solid rgba(255,255,255,0.45)', background:'rgba(0,0,0,0.6)', color:'white', cursor:'pointer', backdropFilter:'blur(8px)', fontSize:'16px' }}>→</button>

        {exhibits.length > 1 && (
          <div style={{ position:'absolute', bottom:'80px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'6px', alignItems:'center', zIndex:10 }}>
            {exhibits.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ width:i===activeIndex?'20px':'5px', height:'4px', borderRadius:'2px', background:i===activeIndex?'rgba(255,255,255,0.55)':'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', padding:0, transition:'all 0.4s ease' }} />
            ))}
          </div>
        )}

        <div className="md:hidden" style={{ position:'absolute', bottom:'56px', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'6px', zIndex:10, opacity:showSwipeHint?1:0, transition:'opacity 1.2s ease', pointerEvents:'none', whiteSpace:'nowrap' }}>
          <span style={{ fontSize:'8px', letterSpacing:'0.4em', color:'rgba(255,255,255,0.45)', textTransform:'uppercase' }}>Swipe to navigate</span>
          <div style={{ animation:'swipeAnim 1.4s ease-in-out infinite', color:'rgba(255,255,255,0.45)', fontSize:'11px' }}>→</div>
        </div>
      </div>

      {/* MODAL */}
      {selectedExhibit && (
        <div
          className="fixed inset-0 z-[200] flex items-start md:items-center justify-center"
          style={{ padding:'0', paddingTop:'57px' }}
          onClick={() => { setSelectedExhibit(null); setShowShareMenu(false); setShowFullImage(false); }}
          onTouchStart={(e) => { touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            const dx=touchStartX.current-e.changedTouches[0].clientX;
            const dy=Math.abs(touchStartY.current-e.changedTouches[0].clientY);
            if(Math.abs(dx)>50&&Math.abs(dx)>dy*1.5){
              const n=dx>0?(activeIndex+1)%exhibits.length:((activeIndex-1)+exhibits.length)%exhibits.length;
              setActiveIndex(n); setSelectedExhibit(exhibits[n]);
            }
          }}
        >
          <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(4,3,2,0.97)', backdropFilter:'blur(30px)' }} />

          <button className="navbtn hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n=((activeIndex-1)+exhibits.length)%exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.85)', cursor:'pointer', fontSize:'17px' }}>←</button>
          <button className="navbtn hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center"
            onClick={(e) => { e.stopPropagation(); const n=(activeIndex+1)%exhibits.length; setActiveIndex(n); setSelectedExhibit(exhibits[n]); }}
            style={{ border:'1px solid rgba(255,255,255,0.2)', background:'rgba(0,0,0,0.7)', color:'rgba(255,255,255,0.85)', cursor:'pointer', fontSize:'17px' }}>→</button>

          {/* MOBILE modal */}
          <div className="md:hidden modal-anim relative w-full z-10 flex flex-col"
            style={{ height:'calc(100dvh - 57px)', overflowY:'hidden', borderTop:'1px solid rgba(255,255,255,0.12)' }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setSelectedExhibit(null); setShowShareMenu(false); }}
              style={{ position:'absolute', top:'8px', right:'8px', zIndex:20, width:'36px', height:'36px', background:'rgba(0,0,0,0.75)', border:'1px solid rgba(255,255,255,0.3)', color:'white', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' }}>×</button>
            <div style={{ position:'relative', width:'100%', height:'38vw', maxHeight:'220px', overflow:'hidden', cursor:'zoom-in', flexShrink:0 }}
              onClick={() => setShowFullImage(true)}>
              <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.88) contrast(1.05)', objectPosition:'center' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.4) 100%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'8px', right:'8px', background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.2)', padding:'3px 7px', backdropFilter:'blur(4px)' }}>
                <span style={{ fontSize:'7px', letterSpacing:'0.3em', color:'rgba(255,255,255,0.7)', textTransform:'uppercase' }}>⊕ Tap</span>
              </div>
            </div>
            <div className="scrollbar-hide" style={{ flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'8px', letterSpacing:'0.5em', textTransform:'uppercase', color:'white', fontWeight:700 }}>{selectedExhibit.catalog_id}</span>
                <div style={{ width:'10px', height:'1px', background:'rgba(255,255,255,0.25)' }} />
                <span style={{ fontSize:'8px', letterSpacing:'0.4em', textTransform:'uppercase', color:'white', fontWeight:700 }}>{selectedExhibit.year}</span>
              </div>
              <h2 className="cg" style={{ fontSize:'19px', fontWeight:300, fontStyle:'italic', color:'white', lineHeight:1.25 }}>"{selectedExhibit.title}"</h2>
              <div style={{ width:'20px', height:'1px', background:'rgba(255,255,255,0.18)' }} />
              <p className="cg" style={{ fontSize:'14px', fontWeight:300, fontStyle:'italic', lineHeight:1.8, color:'rgba(255,255,255,0.85)' }}>{selectedExhibit.description}</p>
              {selectedExhibit.submitter_name && (
                <div style={{ display:'flex', alignItems:'center', gap:'10px', paddingTop:'2px' }}>
                  <div style={{ width:'16px', height:'1px', background:'rgba(255,255,255,0.3)' }} />
                  <p className="cg" style={{ fontSize:'13px', letterSpacing:'0.18em', textTransform:'uppercase', color:'white', fontStyle:'italic' }}>{selectedExhibit.submitter_name}</p>
                </div>
              )}
              <div style={{ paddingTop:'8px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => setShowShareMenu(s => !s)}
                  style={{ width:'100%', padding:'10px', fontSize:'9px', letterSpacing:'0.45em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.2)', background:'none', cursor:'pointer', fontFamily:'Georgia' }}
                >{showShareMenu ? 'Close ↑' : 'Share this object'}</button>
                {showShareMenu && (
                  <div style={{ marginTop:'4px', display:'flex', flexDirection:'column', gap:'3px' }}>
                    {shareOptions(selectedExhibit).map((opt) => (
                      <button key={opt.label} onClick={opt.fn}
                        style={{ width:'100%', padding:'9px 14px', fontSize:'9px', letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.02)', cursor:'pointer', fontFamily:'Georgia', textAlign:'left' }}
                      >{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP modal */}
          <div className="hidden md:flex modal-anim relative w-full z-10 flex-row"
            style={{ maxWidth:'900px', maxHeight:'88dvh', border:'1px solid rgba(255,255,255,0.22)', overflow:'hidden' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-[50%] shrink-0" style={{ position:'relative', minHeight:'420px' }}>
              <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.85) contrast(1.05)' }} />
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,244,200,0.06) 0%, transparent 60%)' }} />
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', boxShadow:'inset 0 0 60px rgba(0,0,0,0.5)' }} />
            </div>
            <div className="w-[50%] flex flex-col justify-between p-10"
              style={{ backgroundColor:'#090706', borderLeft:'1px solid rgba(255,255,255,0.08)', overflowY:'auto' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)', fontWeight:700 }}>
                    {String(activeIndex+1).padStart(2,'0')} / {String(exhibits.length).padStart(2,'0')}
                  </span>
                  <button onClick={() => { setSelectedExhibit(null); setShowShareMenu(false); }}
                    style={{ fontSize:'10px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, cursor:'pointer', background:'none', border:'none', transition:'color 0.2s', fontFamily:'Georgia' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color='white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color='rgba(255,255,255,0.85)')}
                  >Close ×</button>
                </div>
                <div className="fu1">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)', fontWeight:700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width:'12px', height:'1px', background:'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize:'9px', letterSpacing:'0.45em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)', fontWeight:700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize:'clamp(20px, 2.8vw, 34px)', fontWeight:300, fontStyle:'italic', color:'rgba(255,255,255,0.96)', lineHeight:1.25 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>
                <div className="fu1" style={{ width:'24px', height:'1px', background:'rgba(255,255,255,0.15)' }} />
                <div className="fu2" style={{ position:'relative' }}>
                  <div ref={storyRef} className="scrollbar-hide"
                    style={{ maxHeight:'clamp(160px, 30vh, 260px)', overflowY:'auto', WebkitOverflowScrolling:'touch' as any }}
                    onScroll={(e) => { const el=e.currentTarget; if(fadeRef.current) fadeRef.current.style.opacity=el.scrollHeight-el.scrollTop<=el.clientHeight+5?'0':'1'; }}>
                    <p className="cg" style={{ fontSize:'clamp(15px, 1.6vw, 18px)', fontWeight:300, fontStyle:'italic', lineHeight:1.85, color:'rgba(255,255,255,0.88)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position:'absolute', bottom:0, left:0, right:0, height:'36px', background:'linear-gradient(to top, #090706, transparent)', pointerEvents:'none', transition:'opacity 0.3s' }} />
                </div>
              </div>
              <div className="fu3" style={{ paddingTop:'16px', marginTop:'16px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', gap:'10px' }}>
                {selectedExhibit.submitter_name && (
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'18px', height:'1px', background:'rgba(255,255,255,0.35)' }} />
                    <p className="cg" style={{ fontSize:'16px', letterSpacing:'0.2em', textTransform:'uppercase', color:'white', fontStyle:'italic', fontWeight:400, textDecoration:'underline', textUnderlineOffset:'4px', textDecorationColor:'rgba(255,255,255,0.25)', textDecorationThickness:'1px' }}>
                      {selectedExhibit.submitter_name}
                    </p>
                  </div>
                )}
                <div>
                  <button onClick={() => setShowShareMenu(s => !s)}
                    style={{ width:'100%', padding:'12px', fontSize:'9px', letterSpacing:'0.45em', textTransform:'uppercase', fontWeight:700, color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.2)', background:'none', cursor:'pointer', transition:'all 0.3s', fontFamily:'Georgia' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color='rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.background='none'; }}
                  >{showShareMenu ? 'Close ↑' : 'Share this object'}</button>
                  {showShareMenu && (
                    <div style={{ marginTop:'5px', display:'flex', flexDirection:'column', gap:'4px' }}>
                      {shareOptions(selectedExhibit).map((opt) => (
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

      {/* FULL IMAGE — mobile */}
      {showFullImage && selectedExhibit && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ backgroundColor:'rgba(0,0,0,0.97)', backdropFilter:'blur(20px)' }}
          onClick={() => setShowFullImage(false)}>
          <div style={{ position:'relative', width:'96vw', maxWidth:'520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position:'relative', aspectRatio:'1/1', overflow:'hidden' }}>
              <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" style={{ filter:'saturate(0.85) contrast(1.05)' }} />
            </div>
            <button onClick={() => setShowFullImage(false)}
              style={{ position:'absolute', top:'10px', right:'10px', width:'34px', height:'34px', background:'rgba(0,0,0,0.75)', border:'1px solid rgba(255,255,255,0.35)', color:'white', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>×</button>
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
