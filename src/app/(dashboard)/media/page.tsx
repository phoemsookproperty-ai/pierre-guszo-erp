'use client';

import { useState } from 'react';
import { Image as ImageIcon, Upload, Search, Filter, Eye, Trash2, Tag, ChevronDown } from 'lucide-react';

const mockMedia = [
  { id: '1', name: 'SOMCHAI_FITTING_1.jpg', size: '1.2 MB', category: 'Customer Sizing', uploader: 'ช่างเจี๊ยบ', date: '24 พ.ค. 67', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60' },
  { id: '2', name: 'PAYMENT_SLIP_INV-05.png', size: '320 KB', category: 'Payment Slip', uploader: 'ก้อย (บัญชี)', date: '24 พ.ค. 67', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500&auto=format&fit=crop&q=60' },
  { id: '3', name: 'DOUBLE_BREASTED_GREY_REF.jpg', size: '2.1 MB', category: 'Reference Style', uploader: 'ปุ๋ย (Sales)', date: '23 พ.ค. 67', url: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=500&auto=format&fit=crop&q=60' },
  { id: '4', name: 'PATCHA_FABRIC_SELECT.png', size: '850 KB', category: 'Customer Sizing', uploader: 'ช่างเจี๊ยบ', date: '23 พ.ค. 67', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500&auto=format&fit=crop&q=60' },
];

export default function MediaLibrary() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredMedia = mockMedia.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'All' || m.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">คลังจัดเก็บไฟล์และรูปภาพอ้างอิง (Media Library Vault)</h2>
        </div>
      </section>

      {/* Upload and Control Row */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex gap-3 text-xs">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="ค้นหาชื่อไฟล์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
          >
            <option value="All">ทุกหมวดหมู่</option>
            <option value="Customer Sizing">รูปวัดตัว (Customer Sizing)</option>
            <option value="Payment Slip">สลิปโอนเงิน (Payment Slip)</option>
            <option value="Reference Style">แบบสูทอ้างอิง (Reference Style)</option>
          </select>
        </div>

        <button className="flex items-center justify-center gap-2 py-1.5 px-3.5 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow whitespace-nowrap">
          <Upload className="w-3.5 h-3.5" />
          <span>อัปโหลดภาพด่วน</span>
        </button>
      </section>

      {/* Grid of Files */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-royal-navy/35 transition-all duration-200"
          >
            {/* Image Thumbnail Container */}
            <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                src={m.url}
                alt={m.name}
                className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
              />
              <span className="absolute left-2.5 top-2.5 text-[8px] font-bold text-royal-navy bg-white border border-blue-100 px-1.5 py-0.5 rounded shadow">
                {m.category}
              </span>
            </div>

            {/* File info */}
            <div className="p-3 text-left space-y-1 border-t border-slate-50 text-xs">
              <div className="font-semibold text-slate-800 truncate" title={m.name}>
                {m.name}
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                <span>{m.size}</span>
                <span>อัปโหลด: {m.date} โดย {m.uploader}</span>
              </div>
            </div>

            {/* Actions overlay / footer */}
            <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-1.5">
              <button className="p-1 text-slate-400 hover:text-royal-navy hover:bg-white rounded border border-transparent hover:border-slate-200">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-slate-200">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
