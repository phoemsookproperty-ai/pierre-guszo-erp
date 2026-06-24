'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Building2,
  Ruler,
  Scissors,
  Calendar,
  Layers,
  Coins,
  BarChart3,
  Image,
  UserCheck,
  Settings,
  Database,
  ChevronsLeftRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from './brand-logo';

const menuItems = [
  {
    title: 'หลัก',
    items: [
      { name: 'แดชบอร์ด', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'การขาย / ลูกค้า',
    items: [
      { name: 'หน้าร้าน / รับออเดอร์', href: '/orders/intake', icon: ShoppingBag },
      { name: 'ลูกค้า', href: '/customers', icon: Users },
      { name: 'หน่วยงาน / บริษัท', href: '/organizations', icon: Building2 },
    ],
  },
  {
    title: 'งานวัดตัว / ผลิต',
    items: [
      { name: 'ใบวัดตัว', href: '/measurements', icon: Ruler },
      { name: 'งานดำเนินการ', href: '/production', icon: Scissors },
      { name: 'วันนัด / ปฏิทิน', href: '/calendar', icon: Calendar },
    ],
  },
  {
    title: 'สินค้า / สต็อก',
    items: [
      { name: 'สินค้า / แพ็กเกจ / ผ้า', href: '/inventory', icon: Layers },
    ],
  },
  {
    title: 'การเงิน / บัญชี',
    items: [
      { name: 'บัญชี / การเงิน', href: '/finance', icon: Coins },
      { name: 'รายงาน', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'คลังข้อมูล / ระบบ',
    items: [
      { name: 'คลังรูปภาพ', href: '/media', icon: Image },
      { name: 'ผู้ใช้งาน / สิทธิ์', href: '/settings/users', icon: UserCheck },
      { name: 'ตั้งค่า', href: '/settings/general', icon: Settings },
      { name: 'สำรองข้อมูล', href: '/settings/backup', icon: Database },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={cn(
          'w-64 bg-deep-navy text-white flex flex-col h-screen fixed left-0 top-0 border-r border-navy/40 z-50 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Logo Header */}
        <div className="p-2 border-b border-navy/40 flex flex-col items-center justify-center bg-black-brand/15 relative">
          <BrandLogo className="w-48 h-20 text-white" />
          
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-3 top-3 p-1.5 hover:bg-white/10 rounded-full text-silver hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-navy">
          {menuItems.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <span className="text-[10px] font-bold text-silver/50 tracking-wider px-3 uppercase">
                {group.title}
              </span>
              <nav className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-royal-navy text-white shadow-sm'
                          : 'text-silver hover:bg-navy hover:text-white'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-silver')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-navy/40 text-[10px] text-silver/60 flex flex-col gap-1 items-center bg-black-brand/30">
          <span>Pierre Guszo Hatyai</span>
          <span>Tailored with Excellence</span>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-silver/40">
            <ChevronsLeftRight className="w-2.5 h-2.5" />
            <span>เวอร์ชัน 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
