'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const PAGE_SIZE = 6; // Her seferinde kaç foto yüklenecek

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [page, setPage] = useState(0); // Kaçıncı sayfadayız
  const [hasMore, setHasMore] = useState(true); // Yüklenecek başka foto var mı?
  const observer = useRef<IntersectionObserver | null>(null);

  // --- REVİZE: Supabase'den Range Fetch ile Veri Çekme ---
  const fetchExhibits = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('exhibits')
      .select('*')
      .order('catalog_id', { ascending: false }) // Yeniye göre sırala
      .range(from, to); // --- VERİMLİ VERİ ÇEKME ---
    
    if (!error && data) {
      setExhibits((prev) => [...prev, ...data]);
      if (data.length < PAGE_SIZE) setHasMore(false);
    }
  }, []);

  useEffect(() => {
    fetchExhibits(page);
  }, [page, fetchExhibits]);
  // ------------------------------------------------------

  // --- Infinite Scroll (Görünür alanı takip et) ---
  const lastExhibitElementRef = useCallback((node: any) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);
  // -------------------------------------------------

  // Share Fonksiyonu
  const handleShare = async (item: any) => {
    try {
      const response = await fetch(item.image_url);
      const blob = await response.blob();
      const file = new File([blob], `${item.title}.jpg`, { type: 'image/jpeg' });
      const filesArray = [file];

      if (navigator.share && navigator.canShare && navigator.canShare({ files: filesArray })) {
        await navigator.share({
          files: filesArray,
          title: item.title,
          text: `Almost Archive: "${item.title}"`,
          url: `https://archiveofalmost.vercel.app/archive/${item.id}`,
        });
      } else {
        navigator.clipboard.writeText(`https://archiveofalmost.vercel.app/archive/${item.id}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(`https://archiveofalmost.vercel.app/archive/${item.id}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-20 px-4 md:px-6 font-serif selection:bg-white selection:text-black">
      <style jsx global>{`
        @keyframes spotlightFocus {
          0% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes textReveal {
          0% { transform: translateY(15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-spotlight { animation: spotlightFocus 1.2s ease-out forwards; }
        .animate-text-1 { animation: textReveal 0.8s ease-out 0.3s forwards; opacity: 0; }
        .animate-text-2 { animation: textReveal 0.8s ease-out 0.6s forwards; opacity: 0; }
        .animate-glow { animation: slowPulse 5s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto mb-12 md:mb-20 text-center">
        <h1 className="text-4xl md:text-8xl tracking-[0.2em] md:tracking-[0.3em] uppercase font-light italic opacity-80">The Archive</h1>
        <div className="w-16 md:w-24 h-[1px] bg-neutral-900 mx-auto mt-6 md:mt-8"></div>
      </div>

      {/* --- REVİZE: Mobilde 2'li Grid, Masaüstünde 3'lü Grid --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-16">
        {exhibits.map((item, index) => {
          const isLastElement = exhibits.length === index + 1;
          
          return (
            <div 
              ref={isLastElement ? lastExhibitElementRef : null} 
              key={item.id} 
              className="group space-y-4 md:space-y-8 p-2 md:p-6 bg-neutral-950/20 border border-white/5 hover:border-white/20 transition-all duration-1000"
            >
              <div onClick={() => setSelectedExhibit(item)} className="aspect-square relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 cursor-pointer">
                <Image src={item.image_url} alt={item.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              
              <div className="flex justify-between text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-neutral-600 font-bold uppercase italic">
                <span>{item.catalog_id}</span>
                <span>{item.year}</span>
              </div>
              <h3 className="text-xs md:text-xl font-light italic opacity-70 group-hover:opacity-100 transition-opacity truncate">"{item.title}"</h3>
              
              <button 
                onClick={() => handleShare(item)}
                className="w-full text-center text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-white/50 uppercase font-bold p-1 md:p-2 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
              >
                Share
              </button>
            </div>
          );
        })}
      </div>
      {/* ------------------------------------------------------- */}

      {/* Modal Kısmı */}
      {selectedExhibit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 transition-all duration-500" onClick={() => setSelectedExhibit(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl transition-opacity duration-1000"></div>
          
          <div className="relative w-full max-w-7xl flex flex-col md:flex-row gap-8 md:gap-16 items-center z-10 overflow-y-auto md:overflow-visible max-h-[90vh] md:max-h-none scrollbar-hide overflow-x-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedExhibit(null)} className="absolute top-4 right-4 md:top-0 md:right-0 text-white hover:scale-110 transition-all duration-500 flex items-center group z-[2000]">
              <span className="hidden md:inline text-[10px] tracking-[0.4em] uppercase mr-4 opacity-0 group-hover:opacity-100 transition-opacity font-bold">Close</span>
              <span className="text-5xl font-extralight leading-none">×</span>
            </button>

            <div className="relative w-full md:w-1/2 aspect-square md:aspect-square shrink-0">
              <div className="absolute -inset-8 md:-inset-16 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06)_0%,_transparent_65%)] blur-[40px] md:blur-[80px] -z-10 animate-glow"></div>
              <div className="relative w-full h-full border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.5)_55%,_rgba(0,0,0,0.95)_100%)] animate-spotlight"></div>
                <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover" />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-6 md:space-y-10 text-left relative">
              <div className="space-y-3 md:space-y-4 animate-text-1">
                <div className="flex items-center gap-4 md:gap-6 text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] text-white/70 uppercase font-black">
                  <span>{selectedExhibit.catalog_id}</span>
                  <div className="w-8 md:w-12 h-[1px] bg-white/30"></div>
                  <span>{selectedExhibit.year}</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-light italic leading-tight md:leading-none text-white tracking-tighter drop-shadow-2xl">
                  "{selectedExhibit.title}"
                </h2>
              </div>
              
              <div className="max-h-[250px] md:max-h-[350px] overflow-y-auto pr-4 md:pr-8 custom-scrollbar animate-text-2">
                <p className="text-lg md:text-2xl text-white font-light leading-relaxed italic opacity-95">
                  {selectedExhibit.description}
                </p>
              </div>

              <button 
                onClick={() => handleShare(selectedExhibit)}
                className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full hover:bg-white/20 transition-colors text-sm animate-text-2"
              >
                🔗 <span>Share Memory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}