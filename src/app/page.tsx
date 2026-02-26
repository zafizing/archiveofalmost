import Link from 'next/link';

export default function Home() {
  return (
    <main className="h-screen bg-black flex flex-col items-center justify-center text-center px-4 font-serif selection:bg-white selection:text-black overflow-hidden">
      <div className="space-y-16 md:space-y-24 max-w-6xl w-full">
        
        {/* Başlık: Mobilde text-4xl'e düşürüldü ki taşmasın */}
        <div className="cursor-default">
          <h1 className="text-4xl md:text-8xl tracking-tight text-white/95 italic font-light leading-tight">
            Archive of <span className="font-bold not-italic">Almost</span>
          </h1>
          
          {/* Keskin bir denge çizgisi */}
          <div className="w-16 md:w-20 h-[1px] bg-neutral-800 mx-auto mt-8 md:mt-12"></div>
        </div>

        {/* Manifesto: Mobilde daha dengeli font ve satır aralığı */}
        <div className="space-y-10 md:space-y-16">
          <p className="text-lg md:text-2xl text-white/90 italic font-light max-w-2xl mx-auto leading-relaxed px-4">
            "For the things we kept, when we couldn't keep each other."
          </p>

          {/* Buton: Mobilde padding ve tracking ayarlandı */}
          <div className="pt-2 md:pt-4">
            <Link 
              href="/archive" 
              className="group relative inline-flex items-center justify-center px-10 md:px-16 py-4 md:py-5 overflow-hidden border border-white/30 transition-all duration-700 hover:border-white"
            >
              <span className="relative text-white text-[9px] md:text-[10px] tracking-[0.5em] md:tracking-[0.7em] uppercase transition-colors duration-700 group-hover:text-black z-10">
                Enter the Gallery
              </span>
              
              {/* Beyaz dolgu efekti */}
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            </Link>
          </div>
        </div>

      </div>

      {/* Alt Köşe Detayı: Mobilde biraz daha yukarı çekildi */}
      <div className="fixed bottom-8 md:bottom-12 text-[8px] md:text-[9px] tracking-[0.4em] text-neutral-700 uppercase">
        © 2026 Archive Edition
      </div>
    </main>
  );
}