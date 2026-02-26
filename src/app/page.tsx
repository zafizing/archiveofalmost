export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.2em] uppercase opacity-90 animate-pulse">
          Archive of Almost
        </h1>
        <div className="w-12 h-[1px] bg-neutral-700 mx-auto my-12"></div>
        <p className="text-xl md:text-2xl font-light italic text-neutral-400 leading-relaxed">
          "For the things we kept, when we couldn't keep each other."
        </p>
        <div className="pt-12 flex flex-col md:flex-row gap-6 justify-center items-center">
          <button className="px-10 py-4 border border-neutral-800 hover:bg-white hover:text-black transition-all duration-500 tracking-[0.3em] uppercase text-xs">
            Enter the Archive
          </button>
        </div>
      </div>
    </main>
  );
}