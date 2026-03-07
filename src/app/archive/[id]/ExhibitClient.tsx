'use client';
// src/app/archive/[id]/ExhibitClient.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ExhibitClient({ exhibit }: { exhibit: any }) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = `https://archiveofalmost.co/archive/${exhibit.catalog_id.toLowerCase()}`;

  const shareTwitter = () => {
    const text = encodeURIComponent(`"${exhibit.title}" — ${exhibit.catalog_id}, ${exhibit.year}\n\nArchived at Archive of Almost.\n`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}&via=archiveofalmost`, '_blank');
  };
  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  const shareWhatsApp = () => {
    const text = encodeURIComponent(`"${exhibit.title}" — ${exhibit.catalog_id}, ${exhibit.year}.\n\nArchived at Archive of Almost:\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const downloadCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle vignette
    const vignette = ctx.createRadialGradient(540, 960, 300, 540, 960, 960);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1080, 1920);

    // Load image
    const img = document.createElement('img') as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = exhibit.image_url;
    });

    // Photo — smaller, top portion (560px tall)
    const photoX = 60, photoY = 100, photoW = 960, photoH = 560;
    if (img.width > 0) {
      ctx.save();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      const sc = Math.max(photoW / img.width, photoH / img.height);
      const dw = img.width * sc, dh = img.height * sc;
      ctx.drawImage(img, photoX + (photoW - dw) / 2, photoY + (photoH - dh) / 2, dw, dh);
      ctx.restore();
      // Bottom fade on photo
      const fadeGrad = ctx.createLinearGradient(0, photoY + photoH * 0.6, 0, photoY + photoH);
      fadeGrad.addColorStop(0, 'rgba(12,10,9,0)');
      fadeGrad.addColorStop(1, 'rgba(12,10,9,0.95)');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 700);
    ctx.lineTo(1020, 700);
    ctx.stroke();

    // Catalog + year
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '700 22px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText(`${exhibit.catalog_id}  —  ${exhibit.year}`, 60, 755);

    // Title — wrap at 960px
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'italic 300 52px Georgia';
    const titleWords = `"${exhibit.title}"`.split(' ');
    let tLine = '', tLines: string[] = [];
    for (const w of titleWords) {
      const t = tLine + w + ' ';
      if (ctx.measureText(t).width > 960 && tLine) { tLines.push(tLine.trim()); tLine = w + ' '; }
      else tLine = t;
    }
    if (tLine) tLines.push(tLine.trim());
    tLines.forEach((l, i) => ctx.fillText(l, 60, 830 + i * 66));

    // Description — fit as many lines as possible up to y=1720
    const descStartY = 830 + tLines.length * 66 + 40;
    ctx.fillStyle = 'rgba(255,255,255,0.68)';
    ctx.font = 'italic 300 28px Georgia';
    const maxDescY = 1720;
    const lineH = 44;
    const descWords = exhibit.description.split(' ');
    let dLine = '', dLines: string[] = [];
    for (const w of descWords) {
      const t = dLine + w + ' ';
      if (ctx.measureText(t).width > 960 && dLine) {
        dLines.push(dLine.trim());
        dLine = w + ' ';
        // Stop if next line would overflow
        if (descStartY + (dLines.length + 1) * lineH > maxDescY - 80) break;
      } else {
        dLine = t;
      }
    }
    // Add last line — with ellipsis if truncated
    if (dLine.trim()) {
      const remaining = exhibit.description.replace(dLines.join(' '), '').trim();
      const isEnd = remaining.startsWith(dLine.trim());
      dLines.push(dLine.trim() + (isEnd && remaining === dLine.trim() ? '' : '…'));
    }
    dLines.forEach((l, i) => ctx.fillText(l, 60, descStartY + i * lineH));

    // Submitter
    if (exhibit.submitter_name) {
      const subY = descStartY + dLines.length * lineH + 44;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(60, subY - 8); ctx.lineTo(88, subY - 8); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'italic 300 26px Georgia';
      ctx.textAlign = 'left';
      ctx.fillText(exhibit.submitter_name, 98, subY);
    }

    // Bottom branding
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(400, 1840); ctx.lineTo(680, 1840); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '700 19px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('ARCHIVEOFALMOST.CO', 540, 1882);

    const link = document.createElement('a');
    link.download = `archive-of-almost-${exhibit.catalog_id.toLowerCase()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const shareOptions = [
    { label: '𝕏  Post on X / Twitter', fn: shareTwitter },
    { label: 'f  Share on Facebook',   fn: shareFacebook },
    { label: '◎  Send on WhatsApp',    fn: shareWhatsApp },
    { label: '⎘  Copy link',           fn: copyLink },
    { label: '↓  Download Story Card', fn: downloadCard },
  ];

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#0c0a09', fontFamily: 'Georgia, serif', color: 'white' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        .fu { animation: fadeUp 0.6s ease-out forwards; opacity: 0; }
        .fu1 { animation-delay: 0.1s; }
        .fu2 { animation-delay: 0.22s; }
        .fu3 { animation-delay: 0.36s; }
        .fu4 { animation-delay: 0.48s; }
        .sharebtn { transition: all 0.25s; }
        .sharebtn:hover { color: white !important; border-color: rgba(255,255,255,0.5) !important; background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* TOP NAV */}
      <div className="fixed top-[57px] md:top-[61px] left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-3"
        style={{ backgroundColor: 'rgba(12,10,9,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/archive"
          style={{ fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontWeight: 700, transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        >← Archive</Link>
        <span className="cg" style={{ fontSize: '10px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontStyle: 'italic' }}>Permanent Collection</span>
      </div>

      {/* CONTENT */}
      <div style={{ paddingTop: 'calc(57px + 44px + 24px)', paddingBottom: '100px', maxWidth: '900px', margin: '0 auto', padding: 'calc(57px + 44px + 24px) 0 100px' }}>
        <div className="flex flex-col md:flex-row" style={{ minHeight: '70vh' }}>

          {/* Photo */}
          <div className="w-full md:w-[50%] shrink-0">
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#111' }}>
              <Image src={exhibit.image_url} alt={exhibit.title} fill unoptimized className="object-cover"
                style={{ filter: 'saturate(0.88) contrast(1.05)' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)' }} />
            </div>
          </div>

          {/* Info */}
          <div className="w-full md:w-[50%] flex flex-col justify-between px-6 md:px-10 py-8"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div className="fu fu1" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '9px', letterSpacing: '0.55em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 700 }}>{exhibit.catalog_id}</span>
                <div style={{ width: '12px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '9px', letterSpacing: '0.45em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 700 }}>{exhibit.year}</span>
              </div>

              <h1 className="cg fu fu2" style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 300, fontStyle: 'italic', color: 'white', lineHeight: 1.2, margin: 0 }}>
                "{exhibit.title}"
              </h1>

              <div className="fu fu2" style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />

              <p className="cg fu fu3" style={{ fontSize: 'clamp(15px, 1.7vw, 18px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.85, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {exhibit.description}
              </p>

              {exhibit.submitter_name && (
                <div className="fu fu3" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
                  <div style={{ width: '18px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                  <p className="cg" style={{ fontSize: '15px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white', fontStyle: 'italic', fontWeight: 400, textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(255,255,255,0.2)', margin: 0 }}>
                    {exhibit.submitter_name}
                  </p>
                </div>
              )}
            </div>

            {/* Share */}
            <div className="fu fu4" style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="sharebtn" onClick={() => setShowShareMenu(s => !s)}
                style={{ width: '100%', padding: '12px', fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', background: 'none', cursor: 'pointer', fontFamily: 'Georgia' }}
              >{showShareMenu ? 'Close ↑' : 'Share this object'}</button>
              {showShareMenu && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {shareOptions.map((opt) => (
                    <button key={opt.label} className="sharebtn" onClick={opt.fn}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', fontFamily: 'Georgia', textAlign: 'left' }}
                    >{opt.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(12,10,9,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/archive"
          style={{ fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        >← Back to collection</Link>
        <a href="/submit"
          style={{ padding: '9px 22px', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'all 0.3s', fontFamily: 'Georgia' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
        >Apply</a>
      </div>
    </main>
  );
}
