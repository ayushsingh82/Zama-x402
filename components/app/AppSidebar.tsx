'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/history', label: 'History' },
  { href: '/app/playground', label: 'Playground' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r-2 border-black bg-white flex flex-col h-full">
      <div className="p-5 border-b-2 border-black">
        <Link href="/" className="focus:outline-none">
          <div className="bg-red-300 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg inline-block">
            <p className="text-lg font-black text-black">Zama-X402</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-3 rounded-lg text-sm font-bold border-2 border-black transition-all duration-200 ${
                active
                  ? 'bg-red-500 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
