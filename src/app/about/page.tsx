import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white font-serif selection:bg-white selection:text-black">
      
      {/* Hero */}
      <div className="min-h-screen flex flex-col justify-center px-6 md:px-20 pt-32 pb-20 max-w-5xl mx-auto">
        
        <div className="space-y-6 mb-20">
          <div className="text-[8px] tracking-[0.6em] text-neutral-600 uppercase font-bold">
            About the Archive
          </div>
          <h1 className="text-4xl md:text-7xl font-light italic text-white leading-[1.1]">
            Some things outlive<br />
            <span className="font-bold not-italic">the people who owned them.</span>
          </h1>
        </div>

        <div className="w-12 h-[1px] bg-neutral-800 mb-20"></div>

        {/* Manifesto text */}
        <div className="space-y-10 max-w-2xl">
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
            Somewhere in your home, there is an object that belongs to someone else. 
            A book with their handwriting in the margins. A sweater that still holds their shape. 
            A photograph you developed but never sent.
          </p>
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
            You kept it. Not because you planned to. But because throwing it away felt like 
            erasing something that happened. And it did happen. Even if it's over.
          </p>
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
            The Archive of Almost exists for these objects. Not to celebrate loss. 
            Not to wallow in it. But to acknowledge that some things deserve to be 
            preserved — exactly as they are, exactly as unfinished as they are.
          </p>
          <p className="text-base md:text-lg text-white/50 font-light leading-relaxed italic">
            We accept 150 objects. No more. Each one is reviewed personally before being 
            admitted to the collection. Because not every memory belongs here. But some do. 
            You'll know if yours does.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.05] mx-6 md:mx-20"></div>

      {/* What this is */}
      <div className="px-6 md:px-20 py-20 md:py-28 max-w-5xl mx-auto grid md:grid-cols-3 gap-12 md:gap-16">
        
        <div className="space-y-4">
          <div className="text-[8px] tracking-[0.5em] text-neutral-600 uppercase font-bold">The Collection</div>
          <p className="text-sm text-white/55 font-light leading-relaxed italic">
            150 objects, permanently archived. Each with a photograph, a story, a year, and a name — 
            or the absence of one. The collection never changes. Once archived, always archived.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-[8px] tracking-[0.5em] text-neutral-600 uppercase font-bold">The Process</div>
          <p className="text-sm text-white/55 font-light leading-relaxed italic">
            Submit your object and story. We review every application personally. 
            If accepted, you'll receive an invitation to complete your archival. 
            Not all submissions are accepted.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-[8px] tracking-[0.5em] text-neutral-600 uppercase font-bold">The Permanence</div>
          <p className="text-sm text-white/55 font-light leading-relaxed italic">
            Your object's entry in the archive is permanent. It will not be deleted, 
            altered, or moved. It will exist here as long as the archive exists. 
            Which is to say: a very long time.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.05] mx-6 md:mx-20"></div>

      {/* CTA */}
      <div className="px-6 md:px-20 py-20 md:py-28 max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div className="space-y-4 max-w-lg">
          <p className="text-2xl md:text-3xl font-light italic text-white/80 leading-snug">
            "For the things we kept,<br /> when we couldn't keep each other."
          </p>
          <p className="text-[8px] tracking-[0.4em] text-neutral-700 uppercase font-bold">
            Archive of Almost — Est. 2026
          </p>
        </div>
        <div className="flex gap-6">
          <Link
            href="/archive"
            className="text-[8px] tracking-[0.4em] text-neutral-500 uppercase font-bold hover:text-white transition-colors border border-white/10 hover:border-white/30 px-6 py-3"
          >
            View Collection
          </Link>
          <Link
            href="/submit"
            className="text-[8px] tracking-[0.4em] text-white uppercase font-bold hover:bg-white hover:text-black transition-all duration-500 border border-white/30 hover:border-white px-6 py-3"
          >
            Apply
          </Link>
        </div>
      </div>

    </main>
  );
}
