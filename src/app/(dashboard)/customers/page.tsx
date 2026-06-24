'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  Tag,
  Eye,
  Trash2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Initial Mock Customers (matching seeds)
const mockCustomers = [
  {
    id: 'a1000000-0000-0000-0000-000000000000',
    title: 'คุณ',
    first_name: 'สมชาย',
    last_name: 'วงศ์รัตน์',
    nickname: 'ชาย',
    gender: 'ชาย',
    phone: '089-999-8888',
    email: 'somchai.w@gmail.com',
    customer_tier: 'Regular',
    status: 'Active',
    notes: 'วิศวกรและผู้จัดการโครงการ',
  },
  {
    id: 'a2000000-0000-0000-0000-000000000000',
    title: 'คุณ',
    first_name: 'พัชราภรณ์',
    last_name: 'ศรีทอง',
    nickname: 'พัช',
    gender: 'หญิง',
    phone: '088-777-6666',
    email: 'patcha.s@hotmail.com',
    customer_tier: 'VIP',
    status: 'Active',
    notes: 'ผู้บริหารฝ่ายการตลาด',
  },
  {
    id: 'a3000000-0000-0000-0000-000000000000',
    title: 'คุณ',
    first_name: 'ณัฐพล',
    last_name: 'กิจเจริญ',
    nickname: 'พล',
    gender: 'ชาย',
    phone: '087-666-5555',
    email: 'nattapol.k@gmail.com',
    customer_tier: 'Regular',
    status: 'Active',
    notes: 'ธุรกิจส่วนตัว',
  },
  {
    id: 'a4000000-0000-0000-0000-000000000000',
    title: 'คุณ',
    first_name: 'ณัฐพงศ์',
    last_name: 'พลอยงาม',
    nickname: 'นัท',
    gender: 'ชาย',
    phone: '081-444-2222',
    email: 'nattaphong.p@siamtrading.co.th',
    customer_tier: 'Regular',
    status: 'Active',
    notes: 'หัวหน้าจัดซื้อ',
  },
  {
    id: 'a5000000-0000-0000-0000-000000000000',
    title: 'คุณ',
    first_name: 'วิญญู',
    last_name: 'ทองปาน',
    nickname: 'บอย',
    gender: 'ชาย',
    phone: '083-999-1111',
    email: 'winyoo.t@gmail.com',
    customer_tier: 'VIP',
    status: 'Active',
    notes: 'ทนายความ',
  },
];

export default function Customers() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    title: 'คุณ',
    first_name: '',
    last_name: '',
    nickname: '',
    gender: 'ชาย',
    phone: '',
    email: '',
    customer_tier: 'Regular',
    status: 'Active',
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('first_name', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setCustomers(data);
      }
    } catch (err) {
      console.log('Using default client customers seed fallback.');
    }
  };

  useEffect(() => {
    fetchCustomers();
    // Auto-open modal if URL contains ?add=true
    if (typeof window !== 'undefined' && window.location.search.includes('add=true')) {
      setIsModalOpen(true);
    }
  }, [supabase]);

  // Handle Create
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select();

      if (error) throw error;
      
      setIsModalOpen(false);
      fetchCustomers();
      // Add local state fallback if offline
      if (!data) {
        setCustomers([...customers, { ...newCustomer, id: Math.random().toString() }]);
      }
      setNewCustomer({
        title: 'คุณ',
        first_name: '',
        last_name: '',
        nickname: '',
        gender: 'ชาย',
        phone: '',
        email: '',
        customer_tier: 'Regular',
        status: 'Active',
        notes: '',
      });
    } catch (err: any) {
      console.error(err);
      // Offline fallback
      setCustomers([...customers, { ...newCustomer, id: Math.random().toString() }]);
      setIsModalOpen(false);
    }
  };

  // Handle Delete
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายชื่อลูกค้านี้?')) return;
    try {
      const { error } = await supabase
        .from('customers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchCustomers();
    } catch (err) {
      // Local filter fallback
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      `${c.first_name} ${c.last_name} ${c.nickname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTier = tierFilter === 'All' || c.customer_tier === tierFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="ค้นหาลูกค้าด้วย ชื่อ, ชื่อเล่น, เบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-royal-navy"
            />
          </div>

          {/* Tier Filters */}
          <div className="flex gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="All">ระดับทั้งหมด</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="All">สถานะทั้งหมด</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-royal-navy hover:bg-navy text-white font-bold text-sm rounded-lg shadow transition-colors duration-150 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มลูกค้าใหม่</span>
        </button>
      </section>

      {/* Customers List Card */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop View Table */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4 w-12">โปรไฟล์</th>
                <th className="py-3 px-4">ชื่อ - นามสกุล (ชื่อเล่น)</th>
                <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="py-3 px-4">อีเมล</th>
                <th className="py-3 px-4">ระดับ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">หมายเหตุ</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลรายชื่อลูกค้าตามเงื่อนไขที่กำหนด
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-4 px-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-royal-navy">
                        <User className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">
                        {c.title} {c.first_name} {c.last_name}
                      </div>
                      {c.nickname && (
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                          ชื่อเล่น: {c.nickname} ({c.gender})
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          c.customer_tier === 'VIP'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {c.customer_tier}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'Blacklisted'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 max-w-[180px] truncate" title={c.notes}>
                      {c.notes || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/customers/${c.id}`}
                          className="p-1 text-slate-500 hover:text-royal-navy hover:bg-slate-100 rounded border border-transparent hover:border-slate-200"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="p-1 text-slate-400 hover:text-destructive hover:bg-slate-100 rounded border border-transparent hover:border-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile View Card List */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-medium text-xs bg-slate-50/50">
                ไม่พบข้อมูลรายชื่อลูกค้าตามเงื่อนไขที่กำหนด
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div key={c.id} className="p-4 space-y-3 hover:bg-slate-50/30 transition-colors">
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-royal-navy font-bold text-sm">
                        {c.first_name ? c.first_name[0] : <User className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-slate-800 text-sm block">
                          {c.title} {c.first_name} {c.last_name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {c.nickname && (
                            <span className="text-[10px] text-royal-navy font-semibold bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100">
                              ชื่อเล่น: {c.nickname}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            เพศ: {c.gender || 'ไม่ระบุ'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        c.customer_tier === 'VIP'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {c.customer_tier}
                    </span>
                  </div>

                  {/* Body Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 text-left pl-1">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">เบอร์โทรศัพท์</span>
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 font-semibold text-royal-navy hover:underline">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">อีเมล</span>
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-slate-700 hover:underline truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </div>
                  </div>

                  {/* Notes & Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'Blacklisted'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {c.status}
                      </span>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/customers/${c.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-royal-navy hover:bg-slate-50 border border-slate-200 rounded-md text-[11px] font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูข้อมูล</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(c.id)}
                          className="p-1 text-slate-400 hover:text-destructive hover:bg-slate-50 border border-slate-200 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {c.notes && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] text-slate-500 text-left">
                        <span className="font-semibold text-slate-600 block mb-0.5">บันทึกเพิ่มเติม:</span>
                        <p className="leading-relaxed">{c.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add Customer Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">เพิ่มลูกค้าใหม่ / Add New Customer</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">คำนำหน้า</label>
                  <select
                    value={newCustomer.title}
                    onChange={(e) => setNewCustomer({ ...newCustomer, title: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  >
                    <option value="คุณ">คุณ</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="ดร.">ดร.</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ชื่อแรก *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ชื่อเล่น / เพศ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="ชื่อเล่น"
                      value={newCustomer.nickname}
                      onChange={(e) => setNewCustomer({ ...newCustomer, nickname: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                    />
                    <select
                      value={newCustomer.gender}
                      onChange={(e) => setNewCustomer({ ...newCustomer, gender: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="ไม่ระบุ">ไม่ระบุ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เบอร์โทรศัพท์ *</label>
                  <input
                    type="text"
                    required
                    placeholder="089-999-9999"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">อีเมล</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ระดับสมาชิก</label>
                  <select
                    value={newCustomer.customer_tier}
                    onChange={(e) => setNewCustomer({ ...newCustomer, customer_tier: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  >
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">สถานะ</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">บันทึกช่วยจำ (Notes)</label>
                <textarea
                  rows={3}
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-royal-navy focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold text-xs hover:bg-slate-50"
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
    </div>
  );
}
