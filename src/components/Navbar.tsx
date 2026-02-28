'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] p-6 md:p-10 bg-black/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-[11px] tracking-[0.5em] uppercase font-bold text-white transition-opacity hover:opacity-70">
          ARCHIVE OF ALMOST
        </Link>

        {/* Masaüstü ve Mobil Görünür Menü */}
        <div className="flex items-center gap-6 md:gap-12">
          {/* Sadece Archive Linki (Gallery kaldırıldı) */}
          <Link href="/archive" className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${pathname === '/archive' ? 'text-white' : 'text-white/70'}`}>
            Archive
          </Link>
          
          {/* Submit Linki (Mobil ve Masaüstünde Görünür) */}
          <Link href="/submit" className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${pathname === '/submit' ? 'text-white' : 'text-white/70'}`}>
            Archive Your Memory
          </Link>
        </div>
      </div>
    </nav>
  );
}