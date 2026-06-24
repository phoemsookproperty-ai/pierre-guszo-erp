'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  ArrowLeft,
  ShoppingBag,
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
} from 'lucide-react';

const phaseMap: Record<
  string,
  { name: string; phase: string; desc: string; icon: any }
> = {
  'orders/intake': {
    name: 'หน้าร้าน / รับออเดอร์',
    phase: 'Phase 4 — Sales System',
    desc: 'ระบบตะกร้าสินค้าสำหรับลูกค้าหน้าร้านและการรับออเดอร์สั่งตัดเย็บสูท',
    icon: ShoppingBag,
  },
  'measurements': {
    name: 'ใบวัดตัวลูกค้า',
    phase: 'Phase 5 — Measurement System',
    desc: 'ระบบเก็บบันทึกสัดส่วนร่างกาย คลังภาพรูปร่าง และประวัติการเปลี่ยนแปลงขนาดตัว',
    icon: Ruler,
  },
  'production': {
    name: 'งานดำเนินการผลิต',
    phase: 'Phase 6 — Workflow & Production',
    desc: 'หน้าจอ Kanban ติดตามสถานะงานช่างเย็บ คิวช่างชำนาญการ และประวัติจุดแก้ลองชุด',
    icon: Scissors,
  },
  'calendar': {
    name: 'ปฏิทินนัดหมาย',
    phase: 'Phase 7 — Calendar Module',
    desc: 'ปฏิทินรวมเพื่อบันทึกวันเวลานัดลองชุด นัดวัดตัว และนัดส่งมอบนอกสถานที่',
    icon: Calendar,
  },
  'inventory': {
    name: 'สินค้า / แพ็กเกจ / ผ้า',
    phase: 'Phase 8 — Inventory & Fabrics',
    desc: 'การจัดการคลังม้วนผ้าแยกยี่ห้อ/คอลเลกชัน คลังกระดุม และประวัติเบิกจ่าย',
    icon: Layers,
  },
  'finance': {
    name: 'บัญชี / การเงิน',
    phase: 'Phase 8 — Finance & Billing',
    desc: 'ระบบจัดการใบเสร็จรับเงิน ใบกำกับภาษี ใบเสนอราคา รายจ่าย และยอดค้างชำระ B2B',
    icon: Coins,
  },
  'reports': {
    name: 'รายงานวิเคราะห์',
    phase: 'Phase 10 — QA & Analytics',
    desc: 'สรุปรายงานวิเคราะห์ยอดขายประจำเดือน กำไรสะสม สถิติการเบิกม้วนผ้า และประสิทธิภาพช่าง',
    icon: BarChart3,
  },
  'media': {
    name: 'คลังรูปภาพ',
    phase: 'Phase 3 — Core CRM (Media)',
    desc: 'โฟลเดอร์รวบรวมรูปภาพสลิปใบโอนเงิน รูปภาพร่างลองสูท และเอกสารสัญญาร้าน',
    icon: Image,
  },
  'settings/users': {
    name: 'ผู้ใช้งาน / สิทธิ์ (RBAC)',
    phase: 'Phase 2 — Foundation & Settings',
    desc: 'หน้าจอกำหนดสิทธิ์พนักงานหน้าร้าน ฝ่ายบัญชี ช่างตัด ช่างเย็บ และการเข้าถึงระบบ',
    icon: UserCheck,
  },
  'settings/general': {
    name: 'ตั้งค่าระบบ',
    phase: 'Phase 2 — Foundation & Settings',
    desc: 'ข้อมูลส่วนตัวร้านตัดสูท อัตราภาษีมูลค่าเพิ่ม รหัสรันเลขที่บิลและเอกสารของสาขา',
    icon: Settings,
  },
  'settings/backup': {
    name: 'สำรองข้อมูล (Backup)',
    phase: 'Phase 9 — Backup & Integration',
    desc: 'สถิติประวัติการส่งออกแบ็กอัปข้อมูลอัตโนมัติไปยังบัญชี Google Sheets ของเจ้าของร้าน',
    icon: Database,
  },
};

export default function StubPage() {
  const pathname = usePathname();
  // Strip leading slash
  const slug = pathname.replace(/^\//, '');

  const info = phaseMap[slug] || {
    name: 'กำลังพัฒนาหน้าเพจ',
    phase: 'เฟสการพัตนาถัดไป',
    desc: 'ฟังก์ชันโมดูลนี้อยู่ในแผนงานและกำลังจะถูกสร้างขึ้นในเฟสถัดไป',
    icon: Clock,
  };

  const Icon = info.icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white max-w-lg p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-royal-navy shadow-inner animate-pulse">
          <Icon className="w-8 h-8" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-royal-navy bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {info.phase}
          </span>
          <h2 className="text-xl font-bold text-slate-800 pt-2">
            หน้าเพจ "{info.name}"
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {info.desc}
          </p>
        </div>

        {/* Development Roadmap Timeline representation */}
        <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-3">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            สถานะแผนงานพัฒนาล่าสุด (Roadmap Progress)
          </span>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-700">
              <span>กำลังเตรียมความพร้อมเฟสถัดไป</span>
              <span>35% Complete</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-royal-navy rounded-full w-[35%] transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-xs font-bold text-royal-navy hover:underline bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าหลัก Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
