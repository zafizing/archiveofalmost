import { supabase } from '@/lib/supabase';

export default async function ArchivePage() {
  // Veritabanından verileri çekmeyi deniyoruz
  const { data: exhibits } = await supabase
    .from('exhibits')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black text-neutral-200 p-8 pt-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-light mb-16 tracking-[0.3em] uppercase text-center text-neutral-500">
          The Archive
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {exhibits?.map((item) => (
            <div key={item.id} className="group border border-neutral-900 p-8 hover:border-neutral-700 transition-all duration-700">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-[10px] tracking-widest text-neutral-600 uppercase">{item.catalog_id}</span>
                <span className="text-[10px] tracking-widest text-neutral-600">{item.year}</span>
              </div>
              <h3 className="text-xl mb-4 font-light italic text-neutral-300">"{item.title}"</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8 font-light">
                {item.description}
              </p>
              <div className="pt-4 border-t border-neutral-900 text-[10px] tracking-[0.2em] text-neutral-700 uppercase">
                Curated by {item.submitter_name}
              </div>
            </div>
          ))}
        </div>
        
        {(!exhibits || exhibits.length === 0) && (
          <div className="text-center py-20">
            <p className="text-neutral-600 italic font-light tracking-widest">
              The archive is currently being curated.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}