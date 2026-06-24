'use client';

import { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet, Lock, Settings } from 'lucide-react';

interface BackupLog {
  id: string;
  type: string;
  status: 'Success' | 'Failed';
  synced_count: number;
  checksum: string;
  trigger: string;
  date: string;
}

const initialLogs: BackupLog[] = [
  { id: '1', type: 'GoogleSheets', status: 'Success', synced_count: 185, checksum: 'c3ab879201f8d48ef', trigger: 'System (Auto)', date: '24 พ.ค. 67 03:00' },
  { id: '2', type: 'GoogleSheets', status: 'Success', synced_count: 183, checksum: 'e92cf189ba71bc98a', trigger: 'System (Auto)', date: '23 พ.ค. 67 03:00' },
  { id: '3', type: 'GoogleSheets', status: 'Success', synced_count: 180, checksum: 'a10b4f8d99812ccfe', trigger: 'Wuttichai (Owner)', date: '22 พ.ค. 67 15:45' },
];

export default function BackupSettings() {
  const [logs, setLogs] = useState<BackupLog[]>(initialLogs);
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Settings state
  const [sheetId, setSheetId] = useState('1A2B3C4D5E6F7G8H9I0J_spreadsheet_id_hatyai');
  const [serviceAccount, setServiceAccount] = useState('pierre-guszo-backup@project.iam.gserviceaccount.com');

  const handleSyncNow = () => {
    setSyncing(true);
    setSuccessMsg(false);

    setTimeout(() => {
      setSyncing(false);
      setSuccessMsg(true);

      const newLog: BackupLog = {
        id: Date.now().toString(),
        type: 'GoogleSheets',
        status: 'Success',
        synced_count: 189,
        checksum: Math.random().toString(36).substring(2, 18),
        trigger: 'Admin (Manual)',
        date: new Date().toLocaleString('th-TH', { hour12: false }),
      };

      setLogs([newLog, ...logs]);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">ระบบสำรองข้อมูลและเชื่อมต่อหน่วยงาน (Backup Control Center)</h2>
        </div>
      </section>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>ซิงก์ข้อมูลฐานข้อมูลหลักไปยัง Google Sheets เรียบร้อยแล้ว (Worksheets: Customers, Orders, Payments)</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs Table (Left 2 cols) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ประวัติการซิงก์ข้อมูลสำรองย้อนหลัง</h3>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-royal-navy hover:bg-navy disabled:bg-slate-400 text-white font-bold text-xs rounded-lg shadow transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'กำลังซิงก์...' : 'สำรองข้อมูลทันที'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">วันและเวลาซิงก์</th>
                  <th className="py-2.5 px-3">ประเภท</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                  <th className="py-2.5 px-3 text-right">จำนวนคีย์ที่ซิงก์</th>
                  <th className="py-2.5 px-3">Checksum</th>
                  <th className="py-2.5 px-3">ผู้สั่งการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-700">{log.date}</td>
                    <td className="py-3 px-3 text-slate-500">{log.type}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        สำเร็จ
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-700">{log.synced_count} รายการ</td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">{log.checksum}</td>
                    <td className="py-3 px-3 text-slate-500">{log.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sync Settings Configuration Panel (Right 1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 self-start">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> ตั้งค่าความปลอดภัย Google API
          </h3>

          <div className="space-y-4 text-xs">
            {/* Spreadsheet ID */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> Spreadsheet ID (Google Sheets)
              </span>
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 font-mono text-[10px]"
              />
            </div>

            {/* Service Account Email */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Service Account Email
              </span>
              <input
                type="text"
                value={serviceAccount}
                onChange={(e) => setServiceAccount(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 font-mono text-[10px]"
              />
            </div>

            {/* Note box */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                ข้อมูลสำรองจัดเก็บเป็นความลับสุดยอดของทางร้าน โดยข้อมูลรูปสัดส่วนตัวลูกค้าจะจัดเก็บเฉพาะ Metadata และ Storage Path เท่านั้นเพื่อสอดคล้องกับพ.ร.บ. PDPA ของไทย
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
