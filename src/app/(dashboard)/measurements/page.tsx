'use client';

import { useState } from 'react';
import { Ruler, User, Save, RefreshCw, AlertTriangle, Printer, Layers } from 'lucide-react';

const mockCustomers = [
  { id: '1', name: 'คุณสมชาย วงศ์รัตน์', phone: '089-999-8888', dob: '1985-05-12' },
  { id: '2', name: 'คุณพัชราภรณ์ ศรีทอง', phone: '088-777-6666', dob: '1990-11-22' },
  { id: '3', name: 'คุณณัฐพล กิจเจริญ', phone: '087-666-5555', dob: '1978-01-30' },
];

export default function Measurements() {
  const [selectedCustId, setSelectedCustId] = useState('1');
  const [activeTab, setActiveTab] = useState<'Suit' | 'Pants' | 'Shirt'>('Suit');

  // Sizing State (in centimeters)
  const [suitSizes, setSuitSizes] = useState({
    neck: 42.5,
    shoulder: 48.0,
    chest: 104.0,
    waist: 92.0,
    hip: 106.0,
    sleeve: 64.0,
    armhole: 50.0,
    front_length: 77.0,
    back_length: 76.0,
  });

  const [pantsSizes, setPantsSizes] = useState({
    waist: 84.0,
    hip: 102.0,
    front_rise: 26.0,
    back_rise: 34.0,
    thigh: 58.0,
    knee: 42.0,
    leg_opening: 18.0,
    pants_length: 100.0,
  });

  const [bodyPosture, setBodyPosture] = useState({
    shoulder_type: 'normal', // normal, straight, sloped, low_left, low_right
    back_type: 'normal', // normal, hunched, straight
    posture_type: 'normal', // normal, erect, leaning_forward
    fit_preference: 'Classic Fit', // Slim, Classic, Comfort
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">ระบบบันทึกสัดส่วนการวัดตัว (Measurement Console)</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
            <Printer className="w-3.5 h-3.5" /> พิมพ์ใบวัดตัว
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-royal-navy hover:bg-navy border border-transparent px-3 py-1.5 rounded-lg shadow-sm disabled:bg-slate-400"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกขนาดตัว'}</span>
          </button>
        </div>
      </section>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg">
          บันทึกการวัดตัวเวอร์ชันล่าสุดสำเร็จเรียบร้อยและอัปเดตประวัติระบบแล้ว!
        </div>
      )}

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sizing Form Console (Left 2 cols) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          {/* Select Customer Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 flex-1">
              <User className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
              >
                {mockCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1 rounded">
              ลูกค้าทั่วไป • อายุ 41 ปี
            </div>
          </div>

          {/* Garment Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-semibold gap-1">
            {(['Suit', 'Pants', 'Shirt'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-royal-navy text-royal-navy font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'Suit' ? 'สูทและเสื้อนอก (Suit)' : tab === 'Pants' ? 'กางเกง (Pants)' : 'เสื้อเชิ้ต (Shirt)'}
              </button>
            ))}
          </div>

          {/* Sizing Grid based on Active Tab */}
          {activeTab === 'Suit' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {[
                { label: 'รอบคอ (Neck)', key: 'neck', min: 35 },
                { label: 'ไหล่กว้าง (Shoulder)', key: 'shoulder', min: 40 },
                { label: 'รอบอก (Chest)', key: 'chest', min: 85 },
                { label: 'รอบเอวเสื้อ (Waist)', key: 'waist', min: 75 },
                { label: 'รอบสะโพก (Hip)', key: 'hip', min: 85 },
                { label: 'ความยาวแขน (Sleeve)', key: 'sleeve', min: 55 },
                { label: 'รอบต้นแขน (Armhole)', key: 'armhole', min: 40 },
                { label: 'ความยาวเสื้อหน้า', key: 'front_length', min: 65 },
                { label: 'ความยาวเสื้อหลัง', key: 'back_length', min: 65 },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={suitSizes[field.key as keyof typeof suitSizes]}
                      onChange={(e) =>
                        setSuitSizes({ ...suitSizes, [field.key]: Number(e.target.value) })
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-1 focus:ring-royal-navy"
                    />
                    <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold">ซม.</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Pants' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'รอบเอวกางเกง', key: 'waist' },
                { label: 'รอบสะโพก', key: 'hip' },
                { label: 'เป้าหน้า (Rise F)', key: 'front_rise' },
                { label: 'เป้าหลัง (Rise B)', key: 'back_rise' },
                { label: 'รอบต้นขา (Thigh)', key: 'thigh' },
                { label: 'รอบเข่า (Knee)', key: 'knee' },
                { label: 'ปลายขา (Leg Op)', key: 'leg_opening' },
                { label: 'ความยาวกางเกง', key: 'pants_length' },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={pantsSizes[field.key as keyof typeof pantsSizes]}
                      onChange={(e) =>
                        setPantsSizes({ ...pantsSizes, [field.key]: Number(e.target.value) })
                      }
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-1 focus:ring-royal-navy"
                    />
                    <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold">ซม.</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Shirt' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {[
                { label: 'รอบคอ', val: 41 },
                { label: 'ไหล่กว้าง', val: 47 },
                { label: 'รอบอกเสื้อ', val: 102 },
                { label: 'รอบเอวเชิ้ต', val: 90 },
                { label: 'สะโพกเสื้อ', val: 104 },
                { label: 'ความยาวเชิ้ต', val: 75 },
              ].map((field, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                  <div className="relative">
                    <input
                      type="number"
                      defaultValue={field.val}
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-bold text-slate-700"
                    />
                    <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold">ซม.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Posture Characteristics Panel on the right */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 self-start">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> ลักษณะรูปร่าง & Fit Preference
          </h3>

          <div className="space-y-4 text-xs">
            {/* Fit Preference */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">ทรงและสไตล์เสื้อผ้า (Fit Preference)</label>
              <select
                value={bodyPosture.fit_preference}
                onChange={(e) => setBodyPosture({ ...bodyPosture, fit_preference: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="Slim Fit">เข้ารูปพอดีตัว (Slim Fit)</option>
                <option value="Classic Fit">สไตล์คลาสสิกปกติ (Classic Fit)</option>
                <option value="Comfort Fit">ทรงหลวมใส่สบาย (Comfort Fit)</option>
              </select>
            </div>

            {/* Shoulder Type */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">ทรงไหล่ลูกค้า (Shoulder Shape)</label>
              <select
                value={bodyPosture.shoulder_type}
                onChange={(e) => setBodyPosture({ ...bodyPosture, shoulder_type: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="normal">ไหล่สมส่วนปกติ</option>
                <option value="straight">ไหล่ตรงตั้งกว่าปกติ</option>
                <option value="sloped">ไหล่ลาด/เทลงผิดปกติ</option>
                <option value="low_left">ไหล่ซ้ายลาดต่ำลงกว่าขวา</option>
                <option value="low_right">ไหล่ขวาลาดต่ำลงกว่าซ้าย</option>
              </select>
            </div>

            {/* Back Shape */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">สรีระแผ่นหลัง (Back Posture)</label>
              <select
                value={bodyPosture.back_type}
                onChange={(e) => setBodyPosture({ ...bodyPosture, back_type: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="normal">หลังตรงสมส่วน</option>
                <option value="hunched">หลังค่อมเล็กน้อย</option>
                <option value="straight">แผ่นหลังตึงแบนราบ</option>
              </select>
            </div>

            {/* Warnings warning box */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                หากพบว่าความยาวแขนหรือสัดส่วนซ้ายขวาต่างกันเกิน 1 ซม. กรุณาระบุในรายละเอียดช่วยจำ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
