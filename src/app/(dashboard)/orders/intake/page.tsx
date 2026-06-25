'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Scissors,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Coins,
  Percent,
  Sparkles,
} from 'lucide-react';

const mockCustomers = [
  { id: '1', name: 'คุณสมชาย วงศ์รัตน์', phone: '089-999-8888' },
  { id: '2', name: 'คุณพัชราภรณ์ ศรีทอง', phone: '088-777-6666' },
  { id: '3', name: 'คุณณัฐพล กิจเจริญ', phone: '087-666-5555' },
];

const mockFabrics = [
  { id: 'f1', name: 'Loro Piana Tasmanian Navy Wool', price: 3500 },
  { id: 'f2', name: 'VBC Charcoal Grey Stripe Wool', price: 2200 },
  { id: 'f3', name: 'Pierre Guszo White Cotton', price: 850 },
];

const mockPackages = [
  { id: 'k1', name: 'Bespoke Groom Package', price: 45000 },
  { id: 'k2', name: 'Corporate Uniform Package', price: 8950 },
];

export default function OrderIntake() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('1');
  const [items, setItems] = useState<any[]>([
    { id: '1', type: 'CustomSuit', fabricId: 'f1', qty: 1, price: 25900, lining: 'Silk Navy', button: 'Horn Black' },
  ]);
  const [discount, setDiscount] = useState(0);
  const [deposit, setDeposit] = useState(15000);
  const [deliveryDate, setDeliveryDate] = useState('2026-07-24');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const vat = Math.round((subtotal - discount) * 0.07);
  const total = subtotal - discount + vat;
  const balance = total - deposit;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        type: 'CustomShirt',
        fabricId: 'f3',
        qty: 1,
        price: 3500,
        lining: 'Standard',
        button: 'Pearl White',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, val: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleConfirmOrder = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">รับออเดอร์ใหม่ (Order Wizard)</h2>
        </div>
        {/* Step indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {[
            { label: 'เลือกลูกค้า', num: 1 },
            { label: 'ปรับแต่งสินค้า', num: 2 },
            { label: 'มัดจำ & ยืนยัน', num: 3 },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.num
                    ? 'bg-royal-navy text-white'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.num}
              </span>
              <span className={step === s.num ? 'text-royal-navy font-bold' : 'text-slate-400'}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {success ? (
        <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-800">บันทึกออเดอร์สำเร็จ!</h3>
          <p className="text-xs text-slate-500">ระบบกำลังเปิดใบเสนอราคาและสั่งช่างดำเนินการตัดเย็บ...</p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Wizard Form Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> ขั้นตอนที่ 1: ค้นหาหรือเลือกลูกค้า
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เลือกลูกค้าหน้าร้าน</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    {mockCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="text-xs text-slate-500">ใช้ AI จำลองเสื้อผ้าลองสูทเสมือนจริงเพื่อเป็นตัวเลือกในการดีไซน์:</div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/tryon?customer_id=${selectedCustomerId}`)}
                      className="flex items-center gap-1.5 text-xs font-bold text-royal-navy bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-royal-navy animate-pulse" />
                      <span>ลองสูทด้วย AI</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
                      <Plus className="w-3.5 h-3.5" />
                      <span>ลงทะเบียนลูกค้าด่วน</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-slate-400" /> ขั้นตอนที่ 2: ปรับแต่งรายละเอียดเสื้อผ้าสั่งตัด
                  </h3>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มชิ้นงานในบิล
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4 relative">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute right-3 top-3 p-1 text-slate-400 hover:text-rose-600 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">ประเภทเสื้อผ้า</label>
                          <select
                            value={item.type}
                            onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="CustomSuit">สูทสั่งตัด (Bespoke Suit)</option>
                            <option value="CustomShirt">เสื้อเชิ้ตวัดตัว</option>
                            <option value="CustomPants">กางเกงสั่งตัด</option>
                            <option value="Vest">เสื้อกั๊ก</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">รหัสผ้าสั่งตัด</label>
                          <select
                            value={item.fabricId}
                            onChange={(e) => handleItemChange(item.id, 'fabricId', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            {mockFabrics.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">ราคาตั้งต้น (บาท)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">จำนวน (ชิ้น)</label>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">สีซับใน (Lining Code)</label>
                          <input
                            type="text"
                            value={item.lining}
                            onChange={(e) => handleItemChange(item.id, 'lining', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">รหัสกระดุม (Button Code)</label>
                          <input
                            type="text"
                            value={item.button}
                            onChange={(e) => handleItemChange(item.id, 'button', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" /> ขั้นตอนที่ 3: รับเงินมัดจำ & ยืนยันการสั่งผลิต
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">ยอดเงินรับมัดจำหน้างาน (บาท)</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-bold text-royal-navy focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">วันที่นัดหมายส่งมอบสินค้า</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">หมายเหตุออเดอร์ช่วยจำ</label>
                  <textarea
                    rows={3}
                    placeholder="ความต้องการพิเศษของลูกค้า เช่น เสื้อแขนขวายาวกว่าซ้าย 0.5 ซม."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <button
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ย้อนกลับ
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow"
                >
                  ถัดไป <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmOrder}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow"
                >
                  <CheckCircle className="w-4 h-4" /> ยืนยันคำสั่งซื้อ
                </button>
              )}
            </div>
          </div>

          {/* Invoice Net Total Panel on the right */}
          <div className="bg-slate-950 text-white p-6 rounded-xl border border-slate-800 shadow-xl space-y-6 self-start">
            <h3 className="text-xs font-bold text-silver uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> สรุปใบรายการบัญชีสั่งซื้อ
            </h3>

            <div className="space-y-3.5 text-xs text-silver">
              <div className="flex justify-between">
                <span>ราคาชิ้นงานรวม (Subtotal)</span>
                <span className="font-semibold text-white">฿ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-slate-400" /> ส่วนลด (Discount)
                </span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 p-1 bg-white/10 border border-white/10 rounded text-right text-white font-semibold focus:outline-none"
                />
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                <span>฿ {vat.toLocaleString()}</span>
              </div>

              <hr className="border-white/10 my-2" />

              <div className="flex justify-between text-sm">
                <span className="font-bold text-white">ยอดสุทธิ (Total Net)</span>
                <span className="font-bold text-emerald-400">฿ {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ชำระมัดจำแล้ว (Deposit)</span>
                <span className="text-blue-400">฿ {deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2.5">
                <span className="text-rose-400">คงเหลือจ่ายหน้างาน (Balance)</span>
                <span className="text-rose-400">฿ {balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
