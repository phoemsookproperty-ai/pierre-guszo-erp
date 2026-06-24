'use client';

import { useState } from 'react';
import { Coins, Search, Printer, FileText, CheckCircle, Clock, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';

const mockInvoices = [
  { id: '1', no: 'INV-240524-05', customer: 'คุณสมชาย วงศ์รัตน์', date: '24 พ.ค. 67', total: 25900, paid: 25900, balance: 0, status: 'Paid' },
  { id: '2', no: 'INV-240524-04', customer: 'บริษัท สยามเทรดดิ้ง จำกัด', date: '24 พ.ค. 67', total: 89500, paid: 89500, balance: 0, status: 'Paid' },
  { id: '3', no: 'INV-240523-03', customer: 'คุณพัชราภรณ์ ศรีทอง', date: '23 พ.ค. 67', total: 45000, paid: 15000, balance: 30000, status: 'PartiallyPaid' },
  { id: '4', no: 'INV-240523-02', customer: 'บริษัท ไทยพัฒนา กรุ๊ป', date: '23 พ.ค. 67', total: 120000, paid: 0, balance: 120000, status: 'Unpaid' },
  { id: '5', no: 'INV-240522-01', customer: 'คุณณัฐพล กิจเจริญ', date: '22 พ.ค. 67', total: 18900, paid: 18900, balance: 0, status: 'Paid' },
];

export default function Finance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'PartiallyPaid') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const filteredInvoices = mockInvoices.filter(
    (inv) =>
      inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.no.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">การเงิน บัญชี และการออกเอกสาร (Billing Console)</h2>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'ยอดรับชำระสะสม', val: '฿ 134,300', desc: 'ชำระแล้วเรียบร้อย' },
          { label: 'ลูกหนี้ค้างชำระ (A/R)', val: '฿ 150,000', desc: 'ครบกำหนดเรียกเก็บ' },
          { label: 'ยอดธุรกรรมทั้งหมด', val: '299,300 บาท', desc: 'มูลค่าการรับงานรวม' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
            <div className="text-xl font-bold text-slate-800 my-1">{card.val}</div>
            <span className="text-[10px] text-slate-400 font-semibold">{card.desc}</span>
          </div>
        ))}
      </section>

      {/* Search and List Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาบิล, ชื่อลูกค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </section>

      {/* Invoices List Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">เลขที่บิล</th>
                <th className="py-3 px-4">ชื่อลูกค้า / หน่วยงาน</th>
                <th className="py-3 px-4">วันที่ออกบิล</th>
                <th className="py-3 px-4 text-right">ยอดรวมสุทธิ</th>
                <th className="py-3 px-4 text-right">มัดจำ/ชำระแล้ว</th>
                <th className="py-3 px-4 text-right">ยอดค้างชำระ</th>
                <th className="py-3 px-4">สถานะบิล</th>
                <th className="py-3 px-4 text-center">พิมพ์บิล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="py-4 px-4 font-semibold text-royal-navy">{inv.no}</td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{inv.customer}</td>
                  <td className="py-4 px-4 text-slate-500">{inv.date}</td>
                  <td className="py-4 px-4 text-right font-bold text-slate-700">฿ {inv.total.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right text-emerald-600 font-bold">฿ {inv.paid.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right text-rose-600 font-bold">฿ {inv.balance.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getStatusBadge(inv.status)}`}>
                      {inv.status === 'Paid' ? 'ชำระเงินแล้ว' : inv.status === 'PartiallyPaid' ? 'ค้างจ่ายบางส่วน' : 'ยังไม่ชำระเงิน'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1 bg-slate-50 border border-slate-200 rounded hover:bg-royal-navy/10 hover:text-royal-navy text-slate-500 transition-colors"
                      title="พิมพ์ใบรับมัดจำ"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoice Receipt Modal Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs font-mono text-slate-700">
            {/* Shop Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200">
              <span className="font-bold text-slate-900 text-sm">PIERRE GUSZO HATYAI</span>
              <div className="text-[10px] text-slate-500">123/45 ถนนธรรมนูญวิถี อ.หาดใหญ่ จ.สงขลา</div>
              <div className="text-[10px] text-slate-500">โทร. 074-234567 • เลขผู้เสียภาษี 0994000123456</div>
            </div>

            {/* Invoice Info */}
            <div className="space-y-1 text-left text-[11px]">
              <div>เลขที่เอกสาร: {selectedInvoice.no}</div>
              <div>วันที่ออกบิล: {selectedInvoice.date}</div>
              <div>ลูกค้า: {selectedInvoice.customer}</div>
            </div>

            {/* Items */}
            <div className="border-t border-b border-dashed border-slate-200 py-3 text-left space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>รายละเอียด</span>
                <span>จำนวนเงิน</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>เสื้อนอกสูทและกางเกงสั่งตัด (ผ้าอิตาลี)</span>
                <span>฿ {selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Accounting Breakdown */}
            <div className="space-y-1 text-right">
              <div className="flex justify-between">
                <span>ยอดเงินสุทธิ:</span>
                <span>฿ {selectedInvoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>ชำระมัดจำแล้ว:</span>
                <span>฿ {selectedInvoice.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold border-t border-slate-100 pt-1.5">
                <span>ยอดคงเหลือค้างจ่าย:</span>
                <span>฿ {selectedInvoice.balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex gap-2 justify-end border-t border-slate-100 font-sans">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3 py-1.5 bg-royal-navy hover:bg-navy text-white font-bold rounded flex items-center gap-1 shadow"
              >
                <Printer className="w-3.5 h-3.5" /> พิมพ์บิลจริง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
