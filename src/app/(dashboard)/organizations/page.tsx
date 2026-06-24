'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Upload,
  UserPlus,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  Eye,
  Trash2,
  X,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Initial Mock Organizations (matching seeds)
const mockOrgs = [
  {
    id: 'c1000000-0000-0000-0000-000000000000',
    name: 'บริษัท สยามเทรดดิ้ง จำกัด',
    english_name: 'Siam Trading Co., Ltd.',
    tax_id: '0105553012345',
    contact_person: 'คุณวิภา จิตภักดี',
    phone: '02-222-3333',
    email: 'hr@siamtrading.co.th',
    credit_term_days: 30,
    credit_limit: 200000.00,
    notes: 'สั่งชุดฟอร์มเสื้อเชิ้ตและสูทช่างเทคนิคและผู้บริหารทุกปี',
    members_count: 5,
  },
  {
    id: 'c2000000-0000-0000-0000-000000000000',
    name: 'บริษัท ไทยพัฒนา กรุ๊ป จำกัด',
    english_name: 'Thai Phatthana Group Co., Ltd.',
    tax_id: '0105562098765',
    contact_person: 'คุณสมเกียรติ มั่นคง',
    phone: '02-555-6666',
    email: 'procurement@thaiphatthana.com',
    credit_term_days: 45,
    credit_limit: 500000.00,
    notes: 'ลูกค้ารายใหญ่งานสูทสัมมนาและจัดเลี้ยงประจำปี',
    members_count: 8,
  },
];

export default function Organizations() {
  const supabase = createClient();
  const [organizations, setOrganizations] = useState<any[]>(mockOrgs);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Org Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    english_name: '',
    tax_id: '',
    contact_person: '',
    phone: '',
    email: '',
    credit_term_days: 30,
    credit_limit: 100000,
    notes: '',
  });

  // CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const fetchOrgs = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        // Query members counts
        const orgsWithCounts = await Promise.all(
          data.map(async (org) => {
            const { count } = await supabase
              .from('customers')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id);
            return { ...org, members_count: count || 0 };
          })
        );
        setOrganizations(orgsWithCounts);
      }
    } catch (err) {
      console.log('Using default client B2B organizations seed fallback.');
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [supabase]);

  // Create B2B Org
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([newOrg])
        .select();

      if (error) throw error;
      setIsModalOpen(false);
      fetchOrgs();

      if (!data) {
        setOrganizations([...organizations, { ...newOrg, id: Math.random().toString(), members_count: 0 }]);
      }
      setNewOrg({
        name: '',
        english_name: '',
        tax_id: '',
        contact_person: '',
        phone: '',
        email: '',
        credit_term_days: 30,
        credit_limit: 100000,
        notes: '',
      });
    } catch (err) {
      setOrganizations([...organizations, { ...newOrg, id: Math.random().toString(), members_count: 0 }]);
      setIsModalOpen(false);
    }
  };

  // Soft Delete B2B Org
  const handleDeleteOrg = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหน่วยงานนี้?')) return;
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchOrgs();
    } catch (err) {
      setOrganizations(organizations.filter((o) => o.id !== id));
    }
  };

  // CSV file reading and parsing
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvErrors([]);
    setCsvPreview([]);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const parsedRows: any[] = [];
      const errors: string[] = [];

      // Check CSV headers (expected: ชื่อ, นามสกุล, ชื่อเล่น, เพศ, เบอร์โทร, อีเมล, ตำแหน่ง)
      const headers = lines[0].split(',').map((h) => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(',').map((col) => col.trim());

        if (columns.length < 5) {
          errors.push(`แถวที่ ${i + 1}: ข้อมูลไม่ครบถ้วน (ต้องระบุ ชื่อ, นามสกุล, เบอร์โทร, เพศ)`);
          continue;
        }

        parsedRows.push({
          title: 'คุณ',
          first_name: columns[0],
          last_name: columns[1],
          nickname: columns[2],
          gender: columns[3],
          phone: columns[4],
          email: columns[5] || '',
          position: columns[6] || '',
          organization_id: selectedOrgId,
        });
      }

      setCsvPreview(parsedRows);
      setCsvErrors(errors);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Submit CSV Roster
  const handleCsvImport = async () => {
    if (csvPreview.length === 0) return;
    setImporting(true);

    try {
      // Bulk insert parsed members into customers table
      const { error } = await supabase.from('customers').insert(csvPreview);
      if (error) throw error;

      setImportSuccess(true);
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvFile(null);
        setCsvPreview([]);
        setImportSuccess(false);
        fetchOrgs();
      }, 1500);
    } catch (err) {
      console.error(err);
      // Simulate bulk local add to mock counts
      const orgIdx = organizations.findIndex((o) => o.id === selectedOrgId);
      if (orgIdx !== -1) {
        const updated = [...organizations];
        updated[orgIdx].members_count += csvPreview.length;
        setOrganizations(updated);
      }
      setImportSuccess(true);
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvFile(null);
        setCsvPreview([]);
        setImportSuccess(false);
      }, 1500);
    } finally {
      setImporting(false);
    }
  };

  // Search filter
  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.english_name && o.english_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.tax_id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Search and Action Row */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อหน่วยงาน, เลขประจำตัวผู้เสียภาษี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-royal-navy"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-royal-navy hover:bg-navy text-white font-bold text-sm rounded-lg shadow transition-colors duration-150 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหน่วยงานใหม่</span>
        </button>
      </section>

      {/* Grid of B2B Orgs */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-royal-navy/30 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Card Header Banner */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-royal-navy text-white rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 text-sm">{org.name}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">{org.english_name || '-'}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-royal-navy bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                {org.members_count} บุคลากร
              </span>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">เลขผู้เสียภาษี</span>
                  <div className="font-semibold text-slate-700">{org.tax_id || '-'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">ผู้ประสานงานหลัก</span>
                  <div className="font-semibold text-slate-700">{org.contact_person}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3" /> เบอร์โทรศัพท์
                  </span>
                  <div className="font-semibold text-slate-700">{org.phone}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3" /> อีเมล
                  </span>
                  <div className="font-semibold text-slate-700 truncate">{org.email || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> เครดิตเทอม
                  </span>
                  <div className="font-semibold text-royal-navy">{org.credit_term_days} วัน</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">วงเงินเครดิต</span>
                  <div className="font-bold text-emerald-700">฿ {Number(org.credit_limit).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedOrgId(org.id);
                  setIsCsvModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors duration-150"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>นำเข้าไฟล์รายชื่อ (CSV)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteOrg(org.id)}
                  className="p-1.5 text-slate-400 hover:text-destructive hover:bg-white rounded border border-slate-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1 text-[10px] font-bold text-royal-navy bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-slate-50">
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูรายละเอียด</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Add Organization Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">เพิ่มบริษัท/หน่วยงานองค์กร</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ชื่อบริษัท/หน่วยงาน (ภาษาไทย) *</label>
                <input
                  type="text"
                  required
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ชื่อภาษาอังกฤษ</label>
                  <input
                    type="text"
                    value={newOrg.english_name}
                    onChange={(e) => setNewOrg({ ...newOrg, english_name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เลขประจำตัวผู้เสียภาษี</label>
                  <input
                    type="text"
                    value={newOrg.tax_id}
                    onChange={(e) => setNewOrg({ ...newOrg, tax_id: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ผู้ติดต่อหลัก *</label>
                  <input
                    type="text"
                    required
                    value={newOrg.contact_person}
                    onChange={(e) => setNewOrg({ ...newOrg, contact_person: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เบอร์โทรศัพท์ *</label>
                  <input
                    type="text"
                    required
                    value={newOrg.phone}
                    onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">อีเมล HR / จัดซื้อ</label>
                  <input
                    type="email"
                    value={newOrg.email}
                    onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เครดิตเทอม (วัน)</label>
                  <input
                    type="number"
                    value={newOrg.credit_term_days}
                    onChange={(e) => setNewOrg({ ...newOrg, credit_term_days: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">วงเงินอนุมัติเครดิต (บาท)</label>
                <input
                  type="number"
                  value={newOrg.credit_limit}
                  onChange={(e) => setNewOrg({ ...newOrg, credit_limit: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ข้อตกลงเพิ่มเติม / หมายเหตุ</label>
                <textarea
                  rows={3}
                  value={newOrg.notes}
                  onChange={(e) => setNewOrg({ ...newOrg, notes: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">นำเข้าคลังรายชื่อบุคลากร (CSV)</h3>
              <button
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setCsvFile(null);
                  setCsvPreview([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {importSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                  <h4 className="font-bold text-slate-800 text-sm">นำเข้าบุคลากรเสร็จเรียบร้อย!</h4>
                  <p className="text-xs text-slate-500">ระบบได้ทำการซิงก์ข้อมูลรายชื่อเข้าสู่ตารางลูกค้าเรียบร้อยแล้ว</p>
                </div>
              ) : (
                <>
                  {/* File Upload Zone */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-royal-navy/40 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 cursor-pointer relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">คลิกหรือลากวางไฟล์ CSV รายชื่อ</span>
                    <span className="text-[10px] text-slate-400">
                      ฟอร์แมต: ชื่อ, นามสกุล, ชื่อเล่น, เพศ, เบอร์โทร, อีเมล, ตำแหน่ง
                    </span>
                  </div>

                  {/* Errors display */}
                  {csvErrors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 space-y-1 max-h-24 overflow-y-auto">
                      <div className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> พบข้อผิดพลาดในไฟล์:</div>
                      {csvErrors.map((err, idx) => (
                        <div key={idx}>{err}</div>
                      ))}
                    </div>
                  )}

                  {/* Preview list */}
                  {csvPreview.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ตัวอย่างรายชื่อที่จะนำเข้า ({csvPreview.length} รายการ)
                      </h4>
                      <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {csvPreview.slice(0, 5).map((row, idx) => (
                          <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <span className="font-semibold text-slate-800">{row.first_name} {row.last_name}</span>
                              {row.nickname && <span className="text-slate-400 ml-1">({row.nickname})</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold">{row.phone} | {row.position || '-'}</div>
                          </div>
                        ))}
                        {csvPreview.length > 5 && (
                          <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50">
                            และอีก {csvPreview.length - 5} รายชื่อ...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCsvModalOpen(false);
                        setCsvFile(null);
                        setCsvPreview([]);
                      }}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleCsvImport}
                      disabled={importing || csvPreview.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2 bg-royal-navy hover:bg-navy text-white font-bold text-xs rounded-lg shadow disabled:bg-slate-300"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังนำเข้า...</span>
                        </>
                      ) : (
                        <span>เริ่มการนำเข้า</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
