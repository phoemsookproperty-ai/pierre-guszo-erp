'use client';

import { useState } from 'react';
import { Layers, Plus, Search, Tag, Eye, Trash2, ShieldAlert } from 'lucide-react';

const mockFabrics = [
  { id: '1', code: 'FB-001', brand: 'Loro Piana', country: 'Italy', name: 'Premium Wool Navy', composition: '100% Wool', stock: 150.0, min: 20.0, shelf: 'A-12', price: 3500 },
  { id: '2', code: 'FB-002', brand: 'VBC', country: 'Italy', name: 'Charcoal Grey Stripe', composition: '90% Wool, 10% Cashmere', stock: 15.0, min: 25.0, shelf: 'A-15', price: 2200 },
  { id: '3', code: 'FB-003', brand: 'Pierre Guszo Select', country: 'Thailand', name: 'White Twill Cotton', composition: '100% Cotton', stock: 320.0, min: 50.0, shelf: 'B-04', price: 850 },
];

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'Fabrics' | 'Packages'>('Fabrics');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFabrics = mockFabrics.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">การจัดการคลังสินค้า สต็อกผ้า และแพ็กเกจ (Inventory Console)</h2>
        </div>
      </section>

      {/* Controls Row */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="ค้นหาชื่อผ้า ยี่ห้อ รหัสสต็อก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => setActiveTab('Fabrics')}
              className={`px-3 py-1.5 transition-colors ${
                activeTab === 'Fabrics' ? 'bg-royal-navy text-white font-bold' : 'bg-slate-50 text-slate-600'
              }`}
            >
              คลังผ้าสั่งตัด
            </button>
            <button
              onClick={() => setActiveTab('Packages')}
              className={`px-3 py-1.5 transition-colors ${
                activeTab === 'Packages' ? 'bg-royal-navy text-white font-bold' : 'bg-slate-50 text-slate-600'
              }`}
            >
              แพ็กเกจสูท
            </button>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 py-1.5 px-3.5 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow whitespace-nowrap">
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มรหัสคลังผ้า</span>
        </button>
      </section>

      {activeTab === 'Fabrics' ? (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">รหัส</th>
                  <th className="py-3 px-4">ชื่อผ้าสั่งตัด</th>
                  <th className="py-3 px-4">ยี่ห้อ (แบรนด์)</th>
                  <th className="py-3 px-4">สัดส่วนวัสดุ</th>
                  <th className="py-3 px-4 text-right">จำนวนคงเหลือ (หลา)</th>
                  <th className="py-3 px-4">ตำแหน่งชั้น</th>
                  <th className="py-3 px-4 text-right">ราคาต่อหลา</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFabrics.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-4 px-4 font-semibold text-royal-navy">{f.code}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{f.name}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {f.brand} <span className="text-[10px] text-slate-400">({f.country})</span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{f.composition}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-bold">
                        <span>{f.stock.toFixed(1)}</span>
                        {f.stock <= f.min && (
                          <span
                            className="p-0.5 text-rose-600 bg-rose-50 rounded border border-rose-200 flex items-center gap-0.5 text-[9px] font-bold"
                            title="สต็อกต่ำกว่าเกณฑ์"
                          >
                            <ShieldAlert className="w-3 h-3" /> ต่ำ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600">{f.shelf}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-700">฿ {f.price.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-slate-400 hover:text-royal-navy">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Bespoke Groom Package', price: 45000, desc: 'ชุดสูทกึ่งสั่งตัด 2 ชิ้น (เสื้อสูท + กางเกง) + เชิ้ตและเนคไทผ้าไหม', items: '2 ชิ้นเสื้อนอกและกางเกง + เสื้อเชิ้ตวัดตัว' },
            { name: 'Corporate Executive Package', price: 35000, desc: 'เสื้อนอกสูทผ้าวูล Loro Piana แท้ 100% สไตล์เข้ารูปผู้บริหาร', items: 'เสื้อนอกสั่งตัดเกรดพรีเมียม' },
          ].map((pkg, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-xs space-y-4">
              <div className="text-left space-y-1">
                <span className="text-[10px] font-bold text-royal-navy bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  สูทเซ็ตแพ็กเกจ
                </span>
                <h3 className="text-sm font-bold text-slate-800 pt-1">{pkg.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{pkg.desc}</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="font-bold text-slate-500">ราคาเริ่มต้น</span>
                <span className="text-base font-bold text-emerald-700">฿ {pkg.price.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
