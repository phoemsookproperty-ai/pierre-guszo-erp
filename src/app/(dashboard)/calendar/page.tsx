'use client';

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  CheckCircle,
} from 'lucide-react';

interface Event {
  id: string;
  time: string;
  client: string;
  type: 'ลองชุด' | 'วัดตัว' | 'รับซ่อม' | 'ส่งมอบ';
  phone: string;
  details: string;
  color: string;
}

const mockEvents: Record<number, Event[]> = {
  // Day of month mappings
  24: [
    { id: '1', time: '09:00', client: 'คุณสมชาย วงศ์รัตน์', type: 'ลองชุด', phone: '089-999-8888', details: 'ลองชุดรอบ 1 โครงสร้างเสื้อนอกสไตล์คลาสสิก', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: '2', time: '11:00', client: 'บริษัท สยามเทรดดิ้ง จำกัด', type: 'วัดตัว', phone: '02-222-3333', details: 'วัดตัวนอกสถานที่พนักงานบริหาร 5 ท่าน', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: '3', time: '13:30', client: 'คุณพัชราภรณ์ ศรีทอง', type: 'ลองชุด', phone: '088-777-6666', details: 'ลองชุดสูทผ้าวูลอิตาลีแต่งงานเข้ารูป', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ],
  25: [
    { id: '4', time: '10:00', client: 'คุณณัฐพล กิจเจริญ', type: 'รับซ่อม', phone: '087-666-5555', details: 'รับสูทซ่อมแขนและปกสูทตัวนอก', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ],
  27: [
    { id: '5', time: '14:00', client: 'บริษัท ไทยพัฒนา กรุ๊ป จำกัด', type: 'วัดตัว', phone: '02-555-6666', details: 'เข้าวัดตัวพนักงานรอบเสริม 3 ท่าน', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ],
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 24)); // May 2026 for simulation
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>(mockEvents[24] || []);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(24);

  // Appointment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({
    client: '',
    phone: '',
    time: '10:00',
    type: 'ลองชุด' as any,
    details: '',
  });

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const handleDayClick = (dayNum: number) => {
    setSelectedDayNumber(dayNum);
    setSelectedDayEvents(mockEvents[dayNum] || []);
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToAdd: Event = {
      id: Date.now().toString(),
      time: newAppt.time,
      client: newAppt.client,
      type: newAppt.type,
      phone: newAppt.phone,
      details: newAppt.details,
      color:
        newAppt.type === 'ลองชุด'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : newAppt.type === 'วัดตัว'
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    // Update state
    const currentList = mockEvents[selectedDayNumber] || [];
    mockEvents[selectedDayNumber] = [...currentList, eventToAdd];

    setSelectedDayEvents([...currentList, eventToAdd]);
    setIsModalOpen(false);
    setNewAppt({ client: '', phone: '', time: '10:00', type: 'ลองชุด', details: '' });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">ปฏิทินนัดหมายวัดตัวและลองชุด (Shop Scheduler)</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-royal-navy hover:bg-navy px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างคิวนัดใหม่</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid Card (Left 2 cols) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543} (พ.ศ.)
            </h3>
            <div className="flex items-center gap-1">
              <button className="p-1 border border-slate-200 rounded hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-1 border border-slate-200 rounded hover:bg-slate-50">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Month Calendar Grid representation (May 2026 - starts on Friday) */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {/* Days of week */}
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, idx) => (
              <span key={idx} className="font-bold text-slate-400 py-1">
                {day}
              </span>
            ))}

            {/* Empty grid for leading days (May 2026 starts on Friday - 4 empty) */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={`empty-${idx}`} className="py-4 bg-slate-50/20" />
            ))}

            {/* Days of May (1 to 31) */}
            {Array.from({ length: 31 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasEvents = mockEvents[dayNum] && mockEvents[dayNum].length > 0;
              const isSelected = selectedDayNumber === dayNum;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`py-3.5 rounded-lg border flex flex-col items-center justify-between relative transition-all duration-150 ${
                    isSelected
                      ? 'border-royal-navy bg-royal-navy/5 text-royal-navy font-bold'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-[11px]">{dayNum}</span>
                  {hasEvents && (
                    <span className="w-1.5 h-1.5 bg-royal-navy rounded-full mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda View (Right 1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700">
              ตารางนัดวันที่ {selectedDayNumber} พฤษภาคม 2569
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {selectedDayEvents.length} รายการ
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 font-medium flex flex-col items-center gap-1">
                <span>ไม่มีนัดหมายในวันนี้</span>
                <span className="text-[10px] text-slate-300">คลิก "สร้างคิวนัดใหม่" เพื่อเพิ่มนัดหมาย</span>
              </div>
            ) : (
              selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-royal-navy/20 transition-colors text-left text-xs space-y-2 relative"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-royal-navy flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {evt.time} น.
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${evt.color}`}>
                      {evt.type}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {evt.client}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {evt.details}
                  </div>
                  <div className="flex justify-end pt-1 border-t border-slate-100">
                    <button className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-royal-navy">
                      <Phone className="w-3 h-3" /> โทรหา {evt.phone}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Appointment Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">สร้างคิวนัดหมายใหม่</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อลูกค้า *</label>
                <input
                  type="text"
                  required
                  value={newAppt.client}
                  onChange={(e) => setNewAppt({ ...newAppt, client: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">เบอร์โทรติดต่อ *</label>
                  <input
                    type="text"
                    required
                    value={newAppt.phone}
                    onChange={(e) => setNewAppt({ ...newAppt, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">เวลานัดหมาย *</label>
                  <input
                    type="time"
                    required
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">ประเภทนัดหมาย</label>
                <select
                  value={newAppt.type}
                  onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="ลองชุด">ลองชุด (Fitting try-on)</option>
                  <option value="วัดตัว">วัดตัว (Measurements)</option>
                  <option value="ส่งมอบ">ส่งมอบสินค้า (Pickup/Delivery)</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase">รายละเอียดข้อตกลงเพิ่มเติม</label>
                <textarea
                  rows={3}
                  value={newAppt.details}
                  onChange={(e) => setNewAppt({ ...newAppt, details: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow"
                >
                  สร้างนัดหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
