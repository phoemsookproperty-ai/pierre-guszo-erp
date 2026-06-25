'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Eye, Heart, Check, Trash2, Calendar, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface TryOnTabProps {
  customerId: string;
}

export default function TryOnTab({ customerId }: TryOnTabProps) {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Fetch past Try-on Sessions for this customer
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_tryon_sessions')
        .select('*, suit_styles(name_th), suit_color_patterns(name_th)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);

      if (data && data.length > 0) {
        setSelectedSession(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch results when active session changes
  const fetchResults = async (sessId: string) => {
    setResultsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_tryon_results')
        .select('*')
        .eq('session_id', sessId)
        .is('deleted_at', null);

      if (error) throw error;
      setResults(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [customerId]);

  useEffect(() => {
    if (selectedSession) {
      fetchResults(selectedSession.id);
    } else {
      setResults([]);
    }
  }, [selectedSession]);

  const toggleFavorite = async (id: string) => {
    const updated = results.map((r) => {
      if (r.id === id) {
        return { ...r, is_favorite: !r.is_favorite };
      }
      return r;
    });
    setResults(updated);

    try {
      const target = results.find((r) => r.id === id);
      await supabase
        .from('ai_tryon_results')
        .update({ is_favorite: !target.is_favorite })
        .eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const selectMainResult = async (id: string) => {
    const updated = results.map((r) => ({
      ...r,
      is_selected: r.id === id,
    }));
    setResults(updated);

    try {
      await supabase
        .from('ai_tryon_results')
        .update({ is_selected: false })
        .eq('session_id', selectedSession.id);

      await supabase
        .from('ai_tryon_results')
        .update({ is_selected: true })
        .eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Sessions list */}
      <div className="md:col-span-1 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col max-h-[500px]">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          ประวัติการจำลองสวมสูท ({sessions.length})
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
              กำลังโหลดประวัติ...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              ไม่พบประวัติการลองสูทด้วย AI ของลูกค้ารายนี้
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => setSelectedSession(sess)}
                className={`p-3 cursor-pointer transition-colors duration-150 text-xs text-slate-700 hover:bg-slate-50/70 ${
                  selectedSession?.id === sess.id ? 'bg-blue-50/50 border-l-[3px] border-royal-navy font-semibold' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 text-[11px] truncate">
                    {sess.suit_styles?.name_th || 'ไม่ได้ระบุทรง'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    sess.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sess.status}
                  </span>
                </div>
                <div className="text-[10px] text-yellow-600 font-medium mt-1 truncate">
                  ผ้า: {sess.suit_color_patterns?.name_th || 'ไม่ได้ระบุผ้า'}
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(sess.created_at).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="md:col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px]">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>ภาพผลลัพธ์จำลองสวมสูท</span>
          {selectedSession && (
            <span className="text-[10px] text-slate-400 font-normal">
              โมเดล: {selectedSession.model_name} • ค่าใช้จ่าย: {selectedSession.actual_cost} USD
            </span>
          )}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {resultsLoading ? (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 font-medium animate-pulse">
              กำลังโหลดภาพผลลัพธ์...
            </div>
          ) : !selectedSession ? (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 font-medium">
              เลือกประวัติการลองสูทด้านซ้าย เพื่อดูภาพผลลัพธ์
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-xs text-slate-400 font-medium">
              ไม่มีภาพผลลัพธ์การประมวลผลสำหรับเซสชันนี้
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((res) => (
                <div
                  key={res.id}
                  className={`border rounded-xl overflow-hidden relative transition-all ${
                    res.is_selected ? 'border-royal-navy shadow-md ring-1 ring-royal-navy' : 'border-slate-200'
                  }`}
                >
                  <img src={res.output_image_path} alt="Suit Mockup" className="w-full aspect-[3/4] object-cover" />
                  
                  {/* Actions buttons overlay */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleFavorite(res.id)}
                      className={`p-2 rounded-full border shadow transition-all ${
                        res.is_favorite
                          ? 'bg-rose-500 border-rose-400 text-white'
                          : 'bg-white/85 border-slate-200 text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${res.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {res.is_selected && (
                    <span className="absolute top-2 left-2 bg-royal-navy text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>บันทึกเข้าระบบ</span>
                    </span>
                  )}

                  {/* Card actions footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-2">
                    <Button
                      onClick={() => selectMainResult(res.id)}
                      disabled={res.is_selected}
                      className={`flex-1 text-[10px] font-bold py-1 px-2.5 rounded transition-all ${
                        res.is_selected ? 'bg-slate-300 text-slate-500 cursor-default' : 'bg-royal-navy hover:bg-navy text-white'
                      }`}
                    >
                      {res.is_selected ? 'ใช้เป็นหลักแล้ว' : 'ตั้งเป็นภาพหลัก'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
