'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Users, Scissors, Calendar } from 'lucide-react';
import Sidebar from './sidebar';
import Topbar from './topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-soft-bg text-slate-800 flex flex-col">
      {/* Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Body */}
      <div className="lg:pl-64 min-h-screen flex flex-col flex-1 pb-16 lg:pb-0 min-w-0 w-full overflow-hidden">
        {/* Navigation Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Content Panel */}
        <main className="flex-1 pt-16 p-4 sm:p-6 overflow-x-hidden w-full min-w-0">
          <div className="max-w-[1600px] mx-auto space-y-6 w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on mobile/tablet < 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-deep-navy border-t border-navy/40 text-silver flex items-center justify-around z-30 shadow-2xl">
        {[
          { name: 'แดชบอร์ด', href: '/', icon: Home },
          { name: 'รับออเดอร์', href: '/orders/intake', icon: ShoppingBag },
          { name: 'ลูกค้า', href: '/customers', icon: Users },
          { name: 'คิวผลิต', href: '/production', icon: Scissors },
          { name: 'ปฏิทิน', href: '/calendar', icon: Calendar },
        ].map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-colors duration-150 ${
                isActive ? 'text-white font-bold' : 'text-silver/60 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
