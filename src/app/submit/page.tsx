'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    const email = formData.get('email') as string;

    if (!file || file.size === 0) {
      alert('Please select a photograph.');
      setLoading(false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB.');
      setLoading(false);
      return;
    }

    // Katalog ID hesaplama
    const { data: lastItem } = await supabase
      .from('exhibits')
      .select('catalog_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastItem?.catalog_id) {
      const match = lastItem.catalog_id.match(/\d+/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }
    const newCatalogId = `ARC-${nextNumber.toString().padStart(3, '0')}`;

    // Görsel yükleme
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('exhibits')
      .upload(fileName, file);

    if (uploadError) {
      alert('Upload failed. Please try again.');
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('exhibits')
      .getPublicUrl(fileName);

    // Veritabanı kaydı — status: 'pending' (admin onayı bekliyor)
    const { error: dbError } = await supabase.from('exhibits').insert({
      title,
      description,
      year: parseInt(year),
      image_url: publicUrl,
      submitter_name: submitter,
      submitter_email: email,
      catalog_id: newCatalogId,
      status: 'pending',
    });

    if (dbError) {
      await supabase.storage.from('exhibits').remove([fileName]);
      alert('Submission failed. Please try again.');
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 font-serif">
        <div className="max-w-lg text-center space-y-10">
          <div className="space-y-2">
            <div className="text-[11px] tracking-[0.5em] text-neutral-600 uppercase font-bold mb-8">Application Received</div>
            <h2 className="text-3xl md:text-5xl font-light italic text-white/90 leading-tight">
              Your memory has been<br />submitted for consideration.
            </h2>
          </div>
          <div className="w-12 h-[1px] bg-neutral-800 mx-auto"></div>
          <p className="text-sm text-neutral-500 font-light leading-relaxed italic">
            We review each submission personally.<br />
            If accepted, you will receive an email within 48 hours<br />
            with instructions to complete your archival.
          </p>
          <p className="text-[11px] tracking-[0.3em] text-neutral-700 uppercase">
            Not all memories are accepted.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 md:px-6 pt-28 md:pt-36 pb-20 selection:bg-white selection:text-black font-serif">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-16 md:mb-20 space-y-6">
          <div className="text-[11px] tracking-[0.5em] text-neutral-600 uppercase font-bold">
            Request for Archival
          </div>
          <h2 className="text-3xl md:text-5xl font-light italic text-white/90 leading-tight">
            Apply to the Collection
          </h2>
          <div className="w-10 h-[1px] bg-neutral-800"></div>
          <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-md italic">
            We accept a limited number of objects. Each submission is reviewed personally. 
            If accepted, you will be contacted to complete your archival for <span className="text-white/60">$1,000</span>.
          </p>
          <p className="text-[11px] tracking-[0.3em] text-neutral-700 uppercase">
            148 slots remaining — No payment required to apply
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-12">

          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-[0.4em] text-neutral-600 font-bold">
              01 — The Photograph
            </label>
            <input
              name="image"
              type="file"
              accept="image/*"
              required
              className="bg-transparent border border-neutral-800 p-4 text-[10px] text-white/60 file:bg-white file:text-black file:border-none file:px-5 file:py-2 file:mr-5 file:font-bold file:uppercase file:text-[11px] file:cursor-pointer hover:file:bg-neutral-200 transition-all w-full"
            />
            <span className="text-[11px] text-neutral-700 italic">JPG, PNG or WEBP — max 10MB</span>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-[0.4em] text-neutral-600 font-bold">
              02 — Title of the Memory
            </label>
            <input
              name="title"
              placeholder="Give it a name..."
              required
              className="bg-transparent border-b border-neutral-800 py-3 focus:border-white/40 outline-none transition-colors text-white placeholder:text-neutral-700 text-xl md:text-2xl font-light italic"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-[0.4em] text-neutral-600 font-bold">
              03 — The Story
            </label>
            <textarea
              name="description"
              rows={5}
              placeholder="Why does this object still exist in your life..."
              required
              className="bg-transparent border-b border-neutral-800 py-3 focus:border-white/40 outline-none resize-none text-white placeholder:text-neutral-700 leading-relaxed text-sm font-light italic"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase tracking-[0.4em] text-neutral-600 font-bold">
                04 — Year
              </label>
              <input
                name="year"
                type="number"
                placeholder="20XX"
                required
                min="1900"
                max="2026"
                className="bg-transparent border-b border-neutral-800 py-3 focus:border-white/40 outline-none text-white placeholder:text-neutral-700 text-lg font-light"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[11px] uppercase tracking-[0.4em] text-neutral-600 font-bold">
                05 — Your Name
              </label>
              <input
                name="submitter"
                placeholder="Or remain anonymous"
                className="bg-transparent border-b border-neutral-800 py-3 focus:border-white/40 outline-none text-white placeholder:text-neutral-700 text-lg font-light"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-[0.4em] text-neutral-600 font-bold">
              06 — Your Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="For acceptance notification"
              required
              className="bg-transparent border-b border-neutral-800 py-3 focus:border-white/40 outline-none text-white placeholder:text-neutral-700 text-lg font-light"
            />
            <span className="text-[11px] text-neutral-700 italic">Only used to notify you if accepted. Never shared.</span>
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 border border-neutral-700 bg-transparent text-white hover:bg-white hover:text-black transition-all duration-700 uppercase tracking-[0.5em] text-[11px] font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit for Consideration'}
            </button>
            <p className="text-center text-[11px] tracking-[0.2em] text-neutral-700 uppercase">
              No payment required at this stage
            </p>
          </div>

        </form>
      </div>
    </main>
  );
}
