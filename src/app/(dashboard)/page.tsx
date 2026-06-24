'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  ShoppingBag,
  Ruler,
  FileText,
  CalendarPlus,
  Camera,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Phone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';

// Recharts Dummy Sales Data
const salesData = [
  { day: '1', sales: 400000 },
  { day: '5', sales: 650000 },
  { day: '10', sales: 780000 },
  { day: '15', sales: 1100000 },
  { day: '20', sales: 1250000 },
  { day: '25', sales: 1200000 },
  { day: '30', sales: 1285900 },
];

export default function Dashboard() {
  const supabase = createClient();
  const [syncing, setSyncing] = useState(false);
  const [backupLogs, setBackupLogs] = useState<{ status: string; completed_at: string } | null>({
    status: 'Success',
    completed_at: '2026-05-24 03:00',
  });

  const handleSyncNow = async () => {
    setSyncing(true);
    // Simulate Deno / Edge Function trigger
    setTimeout(() => {
      setSyncing(false);
      setBackupLogs({
        status: 'Success',
        completed_at: new Date().toLocaleString('th-TH', { hour12: false }),
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Shortcuts (ทางลัด) */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">ทางลัดด่วน</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'เพิ่มลูกค้า', icon: UserPlus, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', href: '/customers?add=true' },
            { label: 'รับออเดอร์ใหม่', icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', href: '/orders/intake' },
            { label: 'บันทึกที่วัดตัว', icon: Ruler, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', href: '/measurements' },
            { label: 'สร้างใบเสนอราคา', icon: FileText, color: 'bg-violet-50 text-violet-600 hover:bg-violet-100', href: '/finance' },
            { label: 'นัดหมายลูกค้า', icon: CalendarPlus, color: 'bg-pink-50 text-pink-600 hover:bg-pink-100', href: '/calendar' },
            { label: 'ถ่ายภาพชุด', icon: Camera, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200', href: '/media' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors duration-150 gap-2 font-semibold text-xs border border-transparent shadow-sm ${action.color}`}
              >
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Primary KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'ออเดอร์ทั้งหมด', val: '128 รายการ', diff: '+18% จากเดือนที่แล้ว', isUp: true },
          { label: 'งานที่รอดำเนินการ', val: '47 รายการ', diff: '+12% จากเดือนที่แล้ว', isUp: true },
          { label: 'ค้างชำระรวม', val: '฿ 256,450', diff: '-8% จากเดือนที่แล้ว', isUp: false },
          { label: 'ลูกค้าใหม่เดือนนี้', val: '23 ราย', diff: '+28% จากเดือนที่แล้ว', isUp: true },
          { label: 'บัญชีหน่วยงานใช้งาน', val: '14 บัญชี', diff: '+7% จากเดือนที่แล้ว', isUp: true },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500">{stat.label}</span>
            <span className="text-xl font-bold text-slate-800 my-2">{stat.val}</span>
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              {stat.isUp ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span className={stat.isUp ? 'text-emerald-600' : 'text-rose-600'}>{stat.diff}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Production Stage Pipeline Summary */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">สถานะงานตามขั้นตอนการผลิต</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:flex lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {[
            { label: 'รับออเดอร์', count: 28 },
            { label: 'วัดตัว', count: 25 },
            { label: 'ตัดเย็บ', count: 18 },
            { label: 'ลองชุด', count: 22 },
            { label: 'แก้ไข', count: 9 },
            { label: 'ส่งมอบ', count: 26 },
          ].map((stage, index, arr) => (
            <div key={index} className="flex items-center flex-1 justify-between lg:justify-start gap-2">
              <div className="flex-1 text-center bg-slate-50 border border-slate-100 hover:border-royal-navy/30 rounded-lg p-2 transition-colors duration-150">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">{stage.label}</span>
                <div className="text-sm font-bold text-royal-navy mt-0.5">
                  {stage.count} <span className="text-[10px] font-normal text-slate-500">งาน</span>
                </div>
              </div>
              {index < arr.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Chart & Today's Appointments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ยอดขายประจำเดือนนี้</span>
              <div className="text-2xl font-bold text-slate-800 mt-1">฿ 1,285,900</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <TrendingUp className="w-4 h-4" />
              <span>+24% จากเดือนที่แล้ว</span>
            </div>
          </div>
          {/* Recharts LineChart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip formatter={(value) => [`฿ ${Number(value).toLocaleString()}`, 'ยอดขาย']} labelFormatter={(label) => `วันที่ ${label}`} />
                <Line type="monotone" dataKey="sales" stroke="#0B3D78" strokeWidth={3} dot={{ r: 4, stroke: '#0B3D78', strokeWidth: 2, fill: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Appointments (นัดหมายวันนี้) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700">นัดหมายวันนี้</h3>
            <button className="text-xs font-semibold text-royal-navy hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[260px] pr-1">
            {[
              { time: '09:00', client: 'คุณสมชาย วงศ์รัตน์', type: 'ลองชุด', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { time: '11:00', client: 'บริษัท สยามเทรดดิ้ง จำกัด', type: 'วัดตัว', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { time: '13:30', client: 'คุณพัชราภรณ์ ศรีทอง', type: 'ลองชุด', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { time: '15:00', client: 'คุณณัฐพล กิจเจริญ', type: 'รับซ่อม', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { time: '16:30', client: 'บริษัท ไทยพัฒนา กรุ๊ป จำกัด', type: 'วัดตัว', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            ].map((appt, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors duration-150">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-royal-navy bg-slate-100 px-2 py-1 rounded">
                    {appt.time}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{appt.client}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mt-0.5 w-max ${appt.color}`}>
                      {appt.type}
                    </span>
                  </div>
                </div>
                <button className="p-1.5 bg-slate-50 text-slate-500 hover:text-royal-navy hover:bg-slate-100 rounded-full">
                  <Phone className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Measurements Table & Recent Payments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Measurements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700">งานที่รอวัดตัว</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] w-40 focus:outline-none"
                />
              </div>
              <button className="p-1 bg-slate-50 border border-slate-200 rounded text-slate-500 hover:bg-slate-100">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">รหัสงาน</th>
                  <th className="py-2.5 px-3">ชื่อลูกค้า</th>
                  <th className="py-2.5 px-3">ประเภท</th>
                  <th className="py-2.5 px-3">นัดหมาย</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                  <th className="py-2.5 px-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {[
                  { id: 1, code: 'MEAS-240509', client: 'คุณณัฏฐวุฒิ ใจดี', item: 'สูท 2 ชิ้น', date: '25 พ.ค. 67', status: 'รอวัดตัว', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { id: 2, code: 'MEAS-240510', client: 'บริษัท ไทยพัฒนา กรุ๊ป จำกัด', item: 'ยูนิฟอร์ม', date: '27 พ.ค. 67', status: 'รอวัดตัว', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { id: 3, code: 'MEAS-240511', client: 'คุณกิตติพงษ์ แสงดี', item: 'สูท 3 ชิ้น', date: '28 พ.ค. 67', status: 'รอวัดตัว', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { id: 4, code: 'MEAS-240512', client: 'คุณวิภาวี รอดสุข', item: 'เดรส', date: '29 พ.ค. 67', status: 'รอวัดตัว', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { id: 5, code: 'MEAS-240513', client: 'บริษัท สยามเทรดดิ้ง จำกัด', item: 'ยูนิฟอร์ม', date: '31 พ.ค. 67', status: 'รอวัดตัว', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-3 px-3 text-slate-500 font-semibold">{row.id}</td>
                    <td className="py-3 px-3 font-semibold text-royal-navy">{row.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{row.client}</td>
                    <td className="py-3 px-3 text-slate-500">{row.item}</td>
                    <td className="py-3 px-3 text-slate-500">{row.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button className="text-[10px] font-bold text-royal-navy hover:underline bg-slate-50 hover:bg-royal-navy/10 px-2 py-1 rounded border border-slate-200">
                        วัดตัว
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments (การรับชำระล่าสุด) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700">การรับชำระล่าสุด</h3>
            <button className="text-xs font-semibold text-royal-navy hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-2.5 px-2">วันที่</th>
                  <th className="py-2.5 px-2">เลขที่บิล</th>
                  <th className="py-2.5 px-2">ลูกค้า</th>
                  <th className="py-2.5 px-2 text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {[
                  { date: '24 พ.ค. 67', bill: 'INV-240524-05', client: 'คุณสมชาย วงศ์รัตน์', amount: '฿ 25,900' },
                  { date: '24 พ.ค. 67', bill: 'INV-240524-04', client: 'บริษัท สยามเทรดดิ้ง จำกัด', amount: '฿ 89,500' },
                  { date: '23 พ.ค. 67', bill: 'INV-240523-03', client: 'คุณพัชราภรณ์ ศรีทอง', amount: '฿ 45,000' },
                  { date: '23 พ.ค. 67', bill: 'INV-240523-02', client: 'บริษัท ไทยพัฒนา กรุ๊ป', amount: '฿ 120,000' },
                  { date: '22 พ.ค. 67', bill: 'INV-240522-01', client: 'คุณณัฐพล กิจเจริญ', amount: '฿ 18,900' },
                ].map((payment, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 text-slate-500">{payment.date}</td>
                    <td className="py-3 px-2 font-semibold text-royal-navy">{payment.bill}</td>
                    <td className="py-3 px-2 font-medium text-slate-800 truncate max-w-[100px]">{payment.client}</td>
                    <td className="py-3 px-2 text-right font-bold text-slate-800">{payment.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Status & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700">กิจกรรมล่าสุดในระบบ</h3>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> อัปเดตล่าสุด
            </span>
          </div>
          <div className="space-y-4">
            {[
              { desc: 'เพิ่มออเดอร์ใหม่ #ORD-240524-08', author: 'แอดมิน', time: '10:24', color: 'bg-blue-500' },
              { desc: 'บันทึกที่วัดตัว #MEAS-240524-07', author: 'ช่างวัดตัว', time: '09:58', color: 'bg-amber-500' },
              { desc: 'อัปโหลดรูปภาพงาน #PHOTO-240524-06', author: 'ช่างตัดเย็บ', time: '09:37', color: 'bg-violet-500' },
              { desc: 'รับชำระเงิน #INV-240524-05', author: 'บัญชี', time: '09:15', color: 'bg-emerald-500' },
              { desc: 'แก้ไขออเดอร์ #ORD-240523-07', author: 'แอดมิน', time: '18:45', color: 'bg-slate-400' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${activity.color}`} />
                <div className="flex-1 flex items-center justify-between text-xs">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-800">{activity.desc}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">โดย {activity.author}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{activity.time} น.</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System & Google Sheets Sync Health Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700">สถานะระบบ & สำรองข้อมูล</h3>
          </div>
          <div className="flex-1 space-y-4">
            {/* Supabase Status */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800">Supabase DB (หลัก)</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">เชื่อมต่อเรียบร้อย ใช้งานปกติ</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                ออนไลน์
              </span>
            </div>

            {/* Google Sheets Sync Status */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800">Google Sheets (สำรอง)</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">ซิงก์สำเร็จ: {backupLogs?.completed_at}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                ซิงก์ล่าสุด
              </span>
            </div>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow transition-colors duration-150 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'กำลังสำรองข้อมูล...' : 'สำรองข้อมูลทันที'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
