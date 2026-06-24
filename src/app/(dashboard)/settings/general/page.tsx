'use client';

import { useState } from 'react';
import { Settings, Save, AlertTriangle, Building, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function GeneralSettings() {
  const [shopName, setShopName] = useState('Pierre Guszo Hatyai (สำนักงานใหญ่)');
  const [shopPhone, setShopPhone] = useState('074-234567');
  const [shopAddress, setShopAddress] = useState(
    '123/45 ถนนธรรมนูญวิถี ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110'
  );
  const [taxId, setTaxId] = useState('0994000123456');
  const [vatRate, setVatRate] = useState(7);

  // Prefix formats
  const [orderPrefix, setOrderPrefix] = useState('ORD');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">การตั้งค่าระบบและร้านตัดสูททั่วไป (General Configurations)</h2>
        </div>
      </section>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>บันทึกการปรับปรุงค่าควบคุมทั่วไปของทางร้าน เรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Settings Grid Layout */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings Form (Left 2 cols) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" /> ข้อมูลธุรกิจประจำสาขา
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อสาขาร้าน *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-royal-navy"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">เบอร์โทรศัพท์ติดต่อสาขา *</label>
                <input
                  type="text"
                  required
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">เลขผู้เสียภาษี 13 หลัก</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">ที่อยู่จัดส่งและที่อยู่ออกใบกำกับภาษี *</label>
              <textarea
                rows={3}
                required
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow disabled:bg-slate-400"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
            </button>
          </div>
        </div>

        {/* VAT and Number prefix (Right 1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 self-start">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> ภาษี & ฟอร์แมตรันเลขเอกสาร
          </h3>

          <div className="space-y-4 text-xs">
            {/* VAT Rate */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">อัตราภาษีมูลค่าเพิ่ม (VAT %)</label>
              <div className="relative">
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* Document prefixes */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                คำขึ้นต้นเลขที่เอกสาร (Prefix)
              </span>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500">บิลสั่งซื้อ (Order Prefix)</label>
                  <input
                    type="text"
                    value={orderPrefix}
                    onChange={(e) => setOrderPrefix(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500">ใบแจ้งหนี้ (Invoice Prefix)</label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Note alert */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                เมื่อเปลี่ยนฟอร์แมตรันเลขเอกสารแล้ว ระบบจะทำการขึ้นลำดับ YYMM0001 สำหรับเดือนใหม่โดยอัตโนมัติ
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
