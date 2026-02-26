import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-black">
      <div className="max-w-3xl space-y-8 text-center">
        <h1 className="text-5xl md:text-7xl font-extralight tracking-[0.3em] uppercase text-white/90 drop-shadow-2xl">
          Archive of Almost
        </h1>
        
        <div className="w-16 h-[1px] bg-neutral-600 mx-auto my-12"></div>
        
        <p className="text-xl md:text-2xl font-light italic text-neutral-300 leading-relaxed max-w-xl mx-auto">
          "For the things we kept, when we couldn't keep each other."
        </p>

        <div className="pt-16 flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link 
            href="/archive" 
            className="px-12 py-4 border border-neutral-600 text-neutral-200 hover:bg-white hover:text-black hover:border-white transition-all duration-700 uppercase tracking-[0.4em] text-xs font-medium"
          >
            Enter the Archive
          </Link>
        </div>
      </div>
    </main>
  );
}