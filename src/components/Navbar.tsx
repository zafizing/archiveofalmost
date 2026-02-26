'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-10 flex justify-between items-center mix-blend-difference font-serif">
      {/* Sol Üst Logo: Tam Opaklık */}
      <Link href="/" className="text-[11px] tracking-[0.5em] uppercase font-bold text-white hover:opacity-50 transition-opacity">
        ARCHIVE OF ALMOST
      </Link>
      
      {/* Sağ Üst Linkler: Logo ile aynı opaklık seviyesi (text-white) */}
      <div className="flex gap-12 text-white">
        <Link 
          href="/archive" 
          className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-500 ${pathname === '/archive' ? 'border-b border-white pb-1' : 'hover:opacity-50'}`}
        >
          The Gallery
        </Link>
        <Link 
          href="/submit" 
          className={`text-[10px] tracking-[0.4em] uppercase transition-all duration-500 ${pathname === '/submit' ? 'border-b border-white pb-1' : 'hover:opacity-50'}`}
        >
          Archive Your Memory
        </Link>
      </div>
    </nav>
  );
}