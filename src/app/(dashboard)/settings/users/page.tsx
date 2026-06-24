'use client';

import { useState } from 'react';
import { UserCheck, Shield, Plus, Mail, Phone, Trash2, Key, Check } from 'lucide-react';

const mockStaff = [
  { id: '1', name: 'คุณวุฒิชัย เลิศพัฒนา', nick: 'พี่ใหญ่', role: 'Owner', email: 'owner@pierreguszo.com', phone: '081-123-4567', status: 'Active' },
  { id: '2', name: 'คุณณัฐวุฒิ ทองดี', nick: 'เก่ง', role: 'Manager', email: 'admin@pierreguszo.com', phone: '082-234-5678', status: 'Active' },
  { id: '3', name: 'คุณศิริพร งามดี', nick: 'ปุ๋ย', role: 'Sales', email: 'sales@pierreguszo.com', phone: '083-345-6789', status: 'Active' },
  { id: '4', name: 'คุณสมยศ รักความดี', nick: 'ช่างยศ', role: 'Tailor', email: 'tailor@pierreguszo.com', phone: '084-456-7890', status: 'Active' },
];

const mockPermissions = [
  { key: 'dashboard:view_financial', label: 'ดูรายงานบัญชีและการเงินร้าน' },
  { key: 'customers:manage', label: 'เพิ่ม แก้ไข และลบประวัติลูกค้า' },
  { key: 'measurements:write', label: 'บันทึกสัดส่วนสลักไหล่/การวัดตัว' },
  { key: 'orders:create', label: 'รับคำสั่งซื้อ/เปิดบิลออเดอร์' },
  { key: 'production:update_status', label: 'ย้ายบอร์ดคัมบังและอัปเดตงานช่าง' },
  { key: 'system:backup', label: 'อนุมัติการสำรองกู้ข้อมูลระบบ' },
];

export default function UsersSettings() {
  const [staff, setStaff] = useState(mockStaff);
  const [selectedRole, setSelectedRole] = useState('Sales');
  
  // Local role permissions checkbox mappings simulation
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>({
    Owner: ['dashboard:view_financial', 'customers:manage', 'measurements:write', 'orders:create', 'production:update_status', 'system:backup'],
    Manager: ['dashboard:view_financial', 'customers:manage', 'measurements:write', 'orders:create', 'production:update_status'],
    Sales: ['customers:manage', 'measurements:write', 'orders:create'],
    Tailor: ['production:update_status'],
  });

  const handleTogglePerm = (role: string, permKey: string) => {
    const activePerms = rolePerms[role] || [];
    const updated = activePerms.includes(permKey)
      ? activePerms.filter((p) => p !== permKey)
      : [...activePerms, permKey];
    
    setRolePerms({
      ...rolePerms,
      [role]: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">การกำหนดสิทธิ์พนักงานและบทบาทผู้ใช้ (Staff Roles & Permissions)</h2>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff list panel (Left 2 cols) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายชื่อพนักงานในระบบ</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow">
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มรายชื่อช่าง/พนักงาน</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">ชื่อพนักงาน (ชื่อเล่น)</th>
                  <th className="py-2.5 px-3">บทบาทระบบ</th>
                  <th className="py-2.5 px-3">เบอร์ติดต่อ</th>
                  <th className="py-2.5 px-3">อีเมลเข้าระบบ</th>
                  <th className="py-2.5 px-3">สถานะบัญชี</th>
                  <th className="py-2.5 px-3 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {s.name} {s.nick && <span className="text-slate-400 font-bold ml-1">({s.nick})</span>}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-royal-navy">{s.role}</td>
                    <td className="py-3.5 px-3 text-slate-500">{s.phone}</td>
                    <td className="py-3.5 px-3 text-slate-500">{s.email}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Role Matrix configuration (Right 1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 self-start">
          <div className="border-b border-slate-100 pb-2 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-royal-navy" /> แก้ไขการจับคู่สิทธิ์ใช้งานระบบ
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">เลือกตำแหน่งที่จะตั้งค่า</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              >
                <option value="Owner">Owner (เจ้าของร้าน)</option>
                <option value="Manager">Manager (ผู้จัดการ)</option>
                <option value="Sales">Sales (พนักงานหน้าร้าน)</option>
                <option value="Tailor">Tailor (ช่างเย็บสูท)</option>
              </select>
            </div>

            {/* Checkboxes List */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                สิทธิ์อนุญาตเข้าถึงหน้าที่อนุญาต (Permissions Matrix)
              </span>
              <div className="space-y-2.5">
                {mockPermissions.map((perm) => {
                  const isChecked = (rolePerms[selectedRole] || []).includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="flex items-center gap-3.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePerm(selectedRole, perm.key)}
                        className="rounded border-slate-300 text-royal-navy focus:ring-royal-navy"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-slate-800 text-[11px]">{perm.label}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{perm.key}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
