'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('image') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const year = formData.get('year') as string;
    const submitter = formData.get('submitter') as string;

    if (!file) {
      alert('Lütfen bir fotoğraf seçin.');
      setLoading(false);
      return;
    }

    // 1. Katalog ID hesaplama
    const { data: lastItem } = await supabase
      .from('exhibits')
      .select('catalog_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastItem && lastItem.catalog_id) {
      const lastIdMatch = lastItem.catalog_id.match(/\d+/);
      if (lastIdMatch) {
        nextNumber = parseInt(lastIdMatch[0]) + 1;
      }
    }
    const newCatalogId = `#${nextNumber.toString().padStart(3, '0')}`;

    // 2. Görsel Yükleme
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exhibits')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      alert('Yükleme hatası!');
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('exhibits')
      .getPublicUrl(fileName);

    // 3. Veritabanı Kaydı ve Hata Yönetimi (Clean-up logic)
    const { error: dbError } = await supabase.from('exhibits').insert({
      title,
      description,
      year: parseInt(year),
      image_url: publicUrl,
      submitter_name: submitter,
      catalog_id: newCatalogId
    });

    if (dbError) {
      console.error(dbError);
      // Veritabanı hatası varsa yüklenen dosyayı siliyoruz (Çöp dosya kalmasın)
      await supabase.storage.from('exhibits').remove([fileName]);
      alert('Veri kaydedilemedi, yükleme iptal edildi!');
    } else {
      // 4. Senkronizasyon ve Yönlendirme
      router.refresh(); // Cache'i zorla temizle
      router.push('/archive');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-6 pt-24 md:pt-32 selection:bg-white selection:text-black font-serif overflow-x-hidden">
      <div className="max-w-xl mx-auto border border-neutral-900 p-6 md:p-12 bg-[#050505] shadow-[0_0_80px_rgba(255,255,255,0.02)]">
        
        <h2 className="text-2xl md:text-3xl font-light mb-8 md:mb-12 tracking-[0.3em] md:tracking-[0.4em] uppercase text-center text-white/90 border-b border-neutral-900 pb-8 md:pb-10 italic leading-snug">
          Archive Your Memory
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-10 md:space-y-12">
          {/* 01. THE PHOTOGRAPH */}
          <div className="flex flex-col gap-4">
            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold italic">
              01. THE PHOTOGRAPH
            </label>
            <input 
              name="image" 
              type="file" 
              accept="image/*" 
              required 
              className="bg-transparent border border-neutral-800 p-3 md:p-4 text-[10px] md:text-xs text-white file:bg-white file:text-black file:border-none file:px-4 md:file:px-6 file:py-2 file:mr-4 md:file:mr-6 file:font-bold file:uppercase file:text-[9px] md:file:text-[10px] file:cursor-pointer hover:file:bg-neutral-200 transition-all w-full" 
            />
          </div>

          {/* 02. TITLE */}
          <div className="flex flex-col gap-4">
            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold italic">
              02. TITLE OF THE MEMORY
            </label>
            <input 
              name="title" 
              placeholder="A name for what's left..." 
              required 
              className="bg-transparent border-b border-neutral-800 p-2 focus:border-white outline-none transition-colors text-white placeholder:text-neutral-600 text-lg md:text-xl font-light italic" 
            />
          </div>

          {/* 03. THE STORY */}
          <div className="flex flex-col gap-4">
            <label className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold italic">
              03. THE STORY
            </label>
            <textarea 
              name="description" 
              rows={4} 
              placeholder="Tell the archive why this matters..." 
              required 
              className="bg-transparent border-b border-neutral-800 p-2 focus:border-white outline-none resize-none text-white placeholder:text-neutral-600 leading-relaxed text-sm md:text-base font-light italic" 
            />
          </div>

          {/* 04 & 05: Mobilde alt alta, Desktop'ta yan yana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col gap-4">
              <label className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold italic">
                04. YEAR
              </label>
              <input 
                name="year" 
                type="number" 
                placeholder="20XX" 
                required 
                className="bg-transparent border-b border-neutral-800 p-2 focus:border-white outline-none text-white placeholder:text-neutral-600 text-base md:text-lg font-light" 
              />
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold italic">
                05. YOUR NAME
              </label>
              <input 
                name="submitter" 
                placeholder="Anonymous" 
                required 
                className="bg-transparent border-b border-neutral-800 p-2 focus:border-white outline-none text-white placeholder:text-neutral-600 text-base md:text-lg font-light" 
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 md:py-6 border border-neutral-700 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-[1s] uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-[10px] font-bold mt-4 md:mt-8"
          >
            {loading ? 'ARCHIVING...' : 'CONFIRM ARCHIVE ($24.99)'} {/* --- Fiyat Eklendi --- */}
          </button>
        </form>
      </div>
    </main>
  );
}