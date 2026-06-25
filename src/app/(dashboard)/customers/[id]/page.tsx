'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  Tag,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TryOnTab from '@/components/tryon/tryon-tab';
import { Button } from '@/components/ui/button';

export default function CustomerProfile() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;
  const supabase = createClient();

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('info');

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*, customer_addresses(*)')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      setCustomer(data);
    } catch (e) {
      console.error('Error fetching customer profile:', e);
      // Fallback for demo or offline sandbox using mock data
      setCustomer({
        id: customerId,
        title: 'คุณ',
        first_name: 'สมชาย',
        last_name: 'วงศ์รัตน์',
        nickname: 'ชาย',
        gender: 'ชาย',
        dob: '1985-05-12',
        phone: '089-999-8888',
        email: 'somchai.w@gmail.com',
        customer_tier: 'Regular',
        status: 'Active',
        notes: 'วิศวกรและผู้จัดการโครงการ พัทลุง-หาดใหญ่',
        occupation: 'วิศวกรโครงข่ายโยธา',
        pdpa_consent: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center animate-pulse text-xs text-slate-400 font-semibold">
        กำลังโหลดข้อมูลโปรไฟล์ลูกค้า...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-base font-bold text-slate-800">ไม่พบรายชื่อลูกค้านี้ในฐานข้อมูล</h2>
        <Link href="/customers" className="text-xs font-bold text-royal-navy hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ย้อนกลับไปหน้าลูกค้า</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <section className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              โปรไฟล์ลูกค้า / Customer Profile
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold">
              รหัสลูกค้า: {customer.id.substring(0, 8).toUpperCase()} • สถานะ: {customer.status}
            </p>
          </div>
        </div>

        <Link href={`/tryon?customer_id=${customer.id}`}>
          <Button className="bg-royal-navy hover:bg-navy text-xs font-bold flex items-center gap-1 shadow">
            <Sparkles className="w-4 h-4" />
            <span>ลองสูทด้วย AI</span>
          </Button>
        </Link>
      </section>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 h-fit">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-royal-navy font-bold text-2xl shadow-inner">
              {customer.first_name[0]}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {customer.title} {customer.first_name} {customer.last_name}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                ระดับสมาชิก: {customer.customer_tier}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{customer.occupation}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-400">
              <span>ความยินยอมประมวลผล AI:</span>
              <span className={`px-2 py-0.5 rounded ${
                customer.pdpa_consent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {customer.pdpa_consent ? 'ยินยอมแล้ว' : 'ยังไม่ได้รับ'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabs area */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          {/* Tab Navigation header */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex overflow-x-auto gap-2">
            {[
              { key: 'info', name: 'ข้อมูลทั่วไป', icon: User },
              { key: 'tryon', name: 'ประวัติภาพจำลอง (AI Try-On)', icon: Sparkles },
              { key: 'measurements', name: 'ประวัติวัดตัว', icon: Layers },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'bg-royal-navy text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content panels */}
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[400px]">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">รายละเอียดลูกค้า</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">ชื่อเล่น</span>
                      <span>{customer.nickname || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">เพศ</span>
                      <span>{customer.gender || 'ไม่ระบุ'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">วันเกิด</span>
                      <span>{customer.dob ? new Date(customer.dob).toLocaleDateString('th-TH') : '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Line ID</span>
                      <span>{customer.line_id || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">บันทึกเพิ่มเติม</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed">
                    {customer.notes || 'ไม่มีบันทึกเพิ่มเติมในลูกค้ารายนี้'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tryon' && (
              <TryOnTab customerId={customer.id} />
            )}

            {activeTab === 'measurements' && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-2">
                <Layers className="w-10 h-10 text-slate-300" />
                <span className="text-xs font-bold">ไม่มีข้อมูลการวัดตัวสัดส่วนปัจจุบัน</span>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">ข้อมูลสัดส่วนและการวัดตัวสูท/เสื้อเชิ้ตจะถูกดึงมาจากระบบแค็ตตาล็อกวัดตัวในเฟสถัดไป</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
