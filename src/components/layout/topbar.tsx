'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const titleMap: Record<string, string> = {
  '/': 'ภาพรวมระบบ / Dashboard',
  '/orders/intake': 'หน้าร้าน / รับออเดอร์ใหม่',
  '/customers': 'ระบบจัดการลูกค้า / Customers',
  '/organizations': 'หน่วยงานและบริษัท / Organizations',
  '/measurements': 'บันทึกการวัดตัว / Measurements',
  '/production': 'งานดำเนินการผลิต / Production Kanban',
  '/calendar': 'ปฏิทินนัดหมาย / Scheduler',
  '/inventory': 'คลังสินค้าและคลังผ้า / Inventory',
  '/finance': 'บัญชีและการเงิน / Accounting',
  '/reports': 'รายงานวิเคราะห์ / Reports',
  '/media': 'คลังรูปภาพและไฟล์ / Media Library',
  '/settings/users': 'จัดการผู้ใช้งานและสิทธิ์ / Staff & RBAC',
  '/settings/general': 'ตั้งค่าระบบทั่วไป / General Settings',
  '/settings/ai': 'ตั้งค่าโมเดล AI / AI Settings',
  '/settings/backup': 'ระบบสำรองข้อมูล / Backup Settings',
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{ nickname: string; role: string } | null>(null);

  // Dynamic title based on pathname
  const getPageTitle = () => {
    if (titleMap[pathname]) return titleMap[pathname];
    if (pathname.startsWith('/customers/')) return 'ข้อมูลรายละเอียดลูกค้า / Customer Profile';
    if (pathname.startsWith('/organizations/')) return 'รายละเอียดบริษัท / Organization Details';
    if (pathname.startsWith('/orders/')) return 'รายละเอียดออเดอร์ / Order Details';
    return 'ระบบสารสนเทศ Pierre Guszo';
  };

  useEffect(() => {
    // Fetch profile and user roles
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile nickname
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();

        // Fetch user roles
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id)
          .single();

        setProfile({
          nickname: profileData?.nickname || 'พนักงาน',
          role: (roleData?.roles as any)?.name || 'Staff',
        });
      }
    };
    fetchUserData();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.cookie = 'sb-mock-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    router.refresh();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 lg:left-64 z-20">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-500 hover:text-royal-navy rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-[150px] sm:max-w-xs md:max-w-none">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Global Search Box */}
        <div className="relative w-48 hidden md:block lg:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาในระบบ... (Ctrl+K)"
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-royal-navy"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
              }
            }}
          />
        </div>

        {/* Notifications Center */}
        <button className="relative p-1.5 text-slate-500 hover:text-royal-navy hover:bg-slate-50 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-4 sm:pl-6">
          <div className="w-7 h-7 sm:w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-royal-navy border border-slate-200">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800">
              {profile?.nickname || 'แอดมิน (1234)'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {profile?.role || 'Owner'}
            </span>
          </div>

          {/* Sign Out Trigger */}
          <button
            onClick={handleSignOut}
            title="ออกจากระบบ"
            className="p-1.5 text-slate-400 hover:text-destructive hover:bg-slate-50 rounded-md"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
