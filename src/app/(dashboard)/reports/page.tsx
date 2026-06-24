'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Scissors, Layers, Download, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts';

const staffSalesData = [
  { name: 'พี่ใหญ่ (Owner)', sales: 450000 },
  { name: 'เก่ง (Manager)', sales: 380000 },
  { name: 'ปุ๋ย (Sales)', sales: 455900 },
];

const fabricPopularity = [
  { name: 'Loro Piana Navy', value: 55, color: '#0B3D78' },
  { name: 'VBC Charcoal', value: 30, color: '#667085' },
  { name: 'PG White Cotton', value: 15, color: '#C7CED8' },
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('This Month');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">รายงานวิเคราะห์ยอดขายและประสิทธิภาพ (Business Analytics)</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="This Month">เดือนนี้ (พฤษภาคม 2569)</option>
            <option value="Last 3 Months">3 เดือนที่ผ่านมา</option>
            <option value="This Year">ปีนี้ (2569)</option>
          </select>
          <button className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </section>

      {/* Analytics KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ยอดขายเฉลี่ยต่อออเดอร์', val: '฿ 23,800', desc: 'สูงขึ้น 4% จากเป้าหมาย' },
          { label: 'ระยะเวลาผลิตเฉลี่ย', val: '14 วัน', desc: 'SLA เฉลี่ยปกติ 15 วัน' },
          { label: 'อัตราการลองชุดแก้', val: '1.2 ครั้ง/งาน', desc: 'เป้าหมายคุมต่ำกว่า 1.5 ครั้ง' },
          { label: 'สัดส่วนสั่งซ้ำ (Retention)', val: '42%', desc: 'สัดส่วนลูกค้าประจำกลับมาซื้อ' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
            <div className="text-xl font-bold text-slate-800 my-1">{card.val}</div>
            <span className="text-[10px] text-slate-400 font-semibold">{card.desc}</span>
          </div>
        ))}
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-royal-navy" /> ยอดขายแบ่งตามพนักงานขาย (Sales Performance)
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffSalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                <Tooltip formatter={(value) => [`฿ ${Number(value).toLocaleString()}`, 'ยอดขาย']} />
                <Bar dataKey="sales" fill="#0B3D78" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fabric Popularity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-royal-navy" /> อัตราส่วนความนิยมยี่ห้อผ้า (Top Fabrics Used)
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around h-64 gap-4">
            {/* Pie Chart */}
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fabricPopularity}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fabricPopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'สัดส่วนการเลือกใช้']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">100%</span>
                <span className="text-[9px] font-bold text-slate-400">ผ้านำเข้าอิตาลี</span>
              </div>
            </div>
            {/* Legends */}
            <div className="space-y-2 text-left text-xs font-semibold text-slate-700">
              {fabricPopularity.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
