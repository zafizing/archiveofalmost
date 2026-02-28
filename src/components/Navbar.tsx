'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    // z-50'yi z-[1000] yaparak en üste aldık
    <nav className="fixed top-0 left-0 w-full z-[1000] p-6 md:p-10 flex justify-between items-center bg-black/90 backdrop-blur-sm border-b border-white/5">
      
      {/* Sol Üst Logo */}
      <Link href="/" className="text-[11px] tracking-[0.5em] uppercase font-bold text-white transition-opacity hover:opacity-70">
        ARCHIVE OF ALMOST
      </Link>

      {/* Sağ Üst Linkler */}
      {/* Mobilde gizle (hidden), tablet ve üstünde göster (md:flex) */}
      <div className="hidden md:flex gap-12 text-white/70">
        <Link
          href="/gallery"
          className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${
            pathname === '/gallery' ? 'text-white' : ''
          }`}
        >
          The Gallery
        </Link>
        <Link
          href="/submit"
          className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-300 hover:text-white ${
            pathname === '/submit' ? 'text-white' : ''
          }`}
        >
          Archive Your Memory
        </Link>
      </div>

      {/* Mobilde Görünecek Hamburger İkonu (Buraya modal menü fonksiyonu eklenebilir) */}
      <button className="md:hidden text-white text-xl">
        ☰
      </button>
    </nav>
  );
}