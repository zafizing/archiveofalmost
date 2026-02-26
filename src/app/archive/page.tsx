import { supabase } from '@/lib/supabase';

export default async function ArchivePage() {
  const { data: exhibits } = await supabase
    .from('exhibits')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extralight mb-20 tracking-[0.4em] uppercase text-center text-white">
          The Archive
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {exhibits?.map((item) => (
            <div key={item.id} className="group flex flex-col border border-neutral-800 overflow-hidden bg-[#0A0A0A] hover:border-neutral-400 transition-all duration-500">
              {/* Görsel */}
              <div className="w-full h-80 overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
              </div>
              
              {/* Metin İçeriği */}
              <div className="p-10 space-y-6">
                {/* Üst Bilgiler - Saf Beyaz ve Belirgin */}
                <div className="flex justify-between items-center border-b border-neutral-700 pb-4 text-white text-[11px] tracking-[0.2em] font-bold">
                  <span className="opacity-100">{item.catalog_id}</span>
                  <span className="opacity-100">{item.year}</span>
                </div>
                
                {/* Başlık - Saf Beyaz */}
                <h3 className="text-2xl font-light italic text-white tracking-tight">
                  "{item.title}"
                </h3>
                
                {/* Ana Açıklama - Okunabilir Beyaz */}
                <p className="text-[16px] text-white/90 leading-relaxed font-light italic">
                  {item.description}
                </p>
                
                {/* Küratör Bilgisi - Saf Beyaz ve Net */}
                <div className="pt-6 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-white"></div>
                  <span className="text-[10px] tracking-[0.3em] text-white uppercase font-bold">
                    Curated by {item.submitter_name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}