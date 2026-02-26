import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-white bg-black">
      <div className="max-w-3xl space-y-8 text-center">
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.2em] uppercase opacity-90">
          Archive of Almost
        </h1>
        
        <div className="w-12 h-[1px] bg-neutral-700 mx-auto my-12"></div>
        
        <p className="text-xl md:text-2xl font-light italic text-neutral-400 leading-relaxed">
          "For the things we kept, when we couldn't keep each other."
        </p>

        <div className="pt-12 flex flex-col md:flex-row gap-6 justify-center items-center">
          {/* Burası butonu linke çevirdiğimiz yer */}
          <Link 
            href="/archive" 
            className="px-10 py-4 border border-neutral-800 hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest text-sm text-center"
          >
            Enter the Archive
          </Link>
        </div>
      </div>
    </main>
  );
}