'use client';

import { useState } from 'react';
import {
  Scissors,
  User,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Filter,
  CheckCircle,
  AlertTriangle,
  Play,
  ClipboardList,
} from 'lucide-react';

interface Job {
  id: string;
  job_no: string;
  customer_name: string;
  item: string;
  fabric_code: string;
  due_date: string;
  assignee: string;
  urgency: 'Normal' | 'Urgent' | 'Express';
}

const initialJobs: Record<string, Job[]> = {
  waiting_fabric: [
    { id: '1', job_no: 'JB-240520', customer_name: 'คุณพัชราภรณ์ ศรีทอง', item: 'สูทกางเกงผ้าวูลลายทาง VBC', fabric_code: 'FB-002', due_date: '28 พ.ค. 67', assignee: 'ช่างยศ', urgency: 'Urgent' },
  ],
  cutting: [
    { id: '2', job_no: 'JB-240521', customer_name: 'บริษัท สยามเทรดดิ้ง จำกัด', item: 'เสื้อเชิ้ตฟอร์ม 5 ตัว', fabric_code: 'FB-003', due_date: '31 พ.ค. 67', assignee: 'ช่างยศ', urgency: 'Normal' },
  ],
  sewing: [
    { id: '3', job_no: 'JB-240522', customer_name: 'คุณสมชาย วงศ์รัตน์', item: 'Bespoke Groom Suit', fabric_code: 'FB-001', due_date: '25 พ.ค. 67', assignee: 'ช่างยศ', urgency: 'Express' },
  ],
  fitting: [
    { id: '4', job_no: 'JB-240523', customer_name: 'คุณณัฐพล กิจเจริญ', item: 'งานซ่อมแขนสูทปกนอก', fabric_code: 'FB-001', due_date: '26 พ.ค. 67', assignee: 'ช่างเจี๊ยบ', urgency: 'Normal' },
  ],
  qc: [
    { id: '5', job_no: 'JB-240524', customer_name: 'คุณวิญญู ทองปาน', item: 'สูทผ้าวูล Loro Piana Navy', fabric_code: 'FB-001', due_date: '24 พ.ค. 67', assignee: 'ช่างเจี๊ยบ', urgency: 'Express' },
  ],
  ready: [],
};

const columnTitles: Record<string, { title: string; color: string }> = {
  waiting_fabric: { title: 'รอวัตถุดิบ / ผ้า', color: 'border-t-slate-400 bg-slate-50' },
  cutting: { title: 'กำลังคัตติ้ง / ตัดผ้า', color: 'border-t-blue-500 bg-blue-50/20' },
  sewing: { title: 'กำลังเนา / เย็บชิ้นงาน', color: 'border-t-amber-500 bg-amber-50/20' },
  fitting: { title: 'รอฟิตติ้ง / ลองชุด', color: 'border-t-violet-500 bg-violet-50/20' },
  qc: { title: 'ตรวจสอบคุณภาพ QC', color: 'border-t-pink-500 bg-pink-50/20' },
  ready: { title: 'พร้อมส่งมอบงาน', color: 'border-t-emerald-500 bg-emerald-50/20' },
};

export default function ProductionKanban() {
  const [board, setBoard] = useState<Record<string, Job[]>>(initialJobs);
  const [activeTab, setActiveTab] = useState<string>('waiting_fabric');

  // Move function
  const moveJob = (jobId: string, fromCol: string, toCol: string) => {
    const fromList = board[fromCol];
    const toList = board[toCol];
    const jobToMove = fromList.find((j) => j.id === jobId);

    if (!jobToMove) return;

    setBoard({
      ...board,
      [fromCol]: fromList.filter((j) => j.id !== jobId),
      [toCol]: [...toList, jobToMove],
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'Express') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (urgency === 'Urgent') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Kanban Header Controls */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">บอร์ดควบคุมคิวเย็บสูทช่าง (Production Kanban)</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" /> กรองตามช่าง
          </button>
        </div>
      </section>

      {/* Mobile Columns Tab Selector */}
      <div className="lg:hidden grid grid-cols-3 gap-1.5 border-b border-slate-200 pb-2.5">
        {Object.keys(columnTitles).map((colKey) => {
          const colInfo = columnTitles[colKey];
          const jobsList = board[colKey] || [];
          const isActive = activeTab === colKey;

          // Short titles for mobile tabs to guarantee they all fit on screen
          const shortTitles: Record<string, string> = {
            waiting_fabric: 'รอวัตถุดิบ',
            cutting: 'คัตติ้ง',
            sewing: 'เย็บผ้า',
            fitting: 'ลองชุด',
            qc: 'ตรวจ QC',
            ready: 'พร้อมส่ง',
          };

          const displayTitle = shortTitles[colKey] || colInfo.title.split(' / ')[0];

          return (
            <button
              key={colKey}
              onClick={() => setActiveTab(colKey)}
              className={`py-2 px-1 rounded-lg text-[10px] font-bold text-center border transition-all duration-150 truncate ${
                isActive
                  ? 'bg-royal-navy text-white border-royal-navy shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="truncate">{displayTitle}</div>
              <div className={`mt-0.5 text-[9px] ${isActive ? 'text-blue-100' : 'text-slate-400 font-semibold'}`}>
                {jobsList.length} งาน
              </div>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Grid - Constrained wrapper to prevent global page stretch */}
      <div className="w-full overflow-x-hidden lg:overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth">
        <div className="flex flex-col lg:flex-row gap-3.5 lg:min-w-[1300px] xl:min-w-0 xl:w-full pb-2 pr-4">
          {Object.keys(columnTitles).map((colKey) => {
            const colInfo = columnTitles[colKey];
            const jobsList = board[colKey] || [];
            const isVisible = activeTab === colKey;

            return (
              <div
                key={colKey}
                className={`w-full lg:w-[210px] lg:shrink-0 xl:w-auto xl:flex-1 rounded-xl border border-slate-200 flex flex-col max-h-[75vh] ${colInfo.color} ${
                  isVisible ? 'flex' : 'hidden lg:flex'
                }`}
              >
                {/* Column Title */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{colInfo.title}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-full">
                    {jobsList.length}
                  </span>
                </div>

                {/* Cards List container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-none min-h-[300px]">
                  {jobsList.length === 0 ? (
                    <div className="py-12 text-center text-[10px] text-slate-400 font-medium">
                      ไม่มีใบงานในสถานะนี้
                    </div>
                  ) : (
                    jobsList.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow space-y-3 relative group"
                      >
                        {/* Job Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold text-royal-navy bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            {job.job_no}
                          </span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${getUrgencyBadge(job.urgency)}`}>
                            {job.urgency}
                          </span>
                        </div>

                        {/* Job Details */}
                        <div className="text-[11px] space-y-1 text-slate-600 text-left">
                          <div className="font-semibold text-slate-800 truncate">{job.customer_name}</div>
                          <div className="text-[10px] text-slate-500 font-medium truncate">{job.item}</div>
                          <div className="flex justify-between text-[9px] text-slate-400 pt-1.5 border-t border-slate-50">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> ช่าง: {job.assignee}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-slate-500">
                              <Clock className="w-3 h-3" /> กำหนด: {job.due_date}
                            </span>
                          </div>
                        </div>

                        {/* Quick Move Trigger Buttons */}
                        <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-50">
                          {colKey !== 'waiting_fabric' && (
                            <button
                              onClick={() => {
                                if (confirm('คุณต้องการย้ายงานนี้กลับไปยังขั้นตอนก่อนหน้าหรือไม่?')) {
                                  const columns = Object.keys(columnTitles);
                                  const currentIdx = columns.indexOf(colKey);
                                  moveJob(job.id, colKey, columns[currentIdx - 1]);
                                  // Move active tab to the previous column on mobile
                                  setActiveTab(columns[currentIdx - 1]);
                                }
                              }}
                              className="p-1 bg-slate-50 border border-slate-200 rounded hover:bg-royal-navy/10 hover:text-royal-navy hover:border-royal-navy/30 text-slate-400 transition-colors"
                              title="ย้อนกลับขั้นตอนก่อนหน้า"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {colKey !== 'ready' && (
                            <button
                              onClick={() => {
                                if (confirm('คุณต้องการย้ายงานนี้ไปยังขั้นตอนถัดไปหรือไม่?')) {
                                  const columns = Object.keys(columnTitles);
                                  const currentIdx = columns.indexOf(colKey);
                                  moveJob(job.id, colKey, columns[currentIdx + 1]);
                                  // Move active tab to the next column on mobile
                                  setActiveTab(columns[currentIdx + 1]);
                                }
                              }}
                              className="p-1 bg-slate-50 border border-slate-200 rounded hover:bg-royal-navy/10 hover:text-royal-navy hover:border-royal-navy/30 text-slate-400 transition-colors"
                              title="ย้ายไปขั้นตอนถัดไป"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
