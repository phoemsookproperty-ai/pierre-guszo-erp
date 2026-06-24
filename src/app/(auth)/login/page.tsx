'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/layout/brand-logo';

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Fallback for demonstration / local offline mode
        if (
          (email === '1234' || email === 'owner@pierreguszo.com' || email === 'admin@pierreguszo.com') &&
          (password === '1234' || password === 'password')
        ) {
          // Simulate sign-in and bypass locally
          document.cookie = "sb-mock-token=true; path=/; max-age=86400;";
          console.log('Local bypass simulation activated');
          router.refresh();
          router.push('/');
          return;
        }
        throw new Error(authError.message || 'รหัสผ่านไม่ถูกต้อง');
      }

      router.refresh();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center p-4">
      {/* Container Card */}
      <div className="w-full max-w-md bg-navy/35 backdrop-blur-md p-8 rounded-2xl border border-royal-navy/40 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <BrandLogo className="w-64 h-24 text-white" />
          <p className="text-[11px] text-silver/50">
            Bespoke Tailoring ERP & CX Platform
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 bg-destructive/15 border border-destructive/40 text-destructive text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-silver uppercase tracking-wider block">
              รหัสเข้าแอดมิน / อีเมล
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-4 h-4 text-silver/60" />
              </span>
              <input
                type="text"
                required
                placeholder="พิมพ์ 1234 หรืออีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black-brand/30 border border-royal-navy/40 rounded-lg text-sm text-white placeholder-silver/40 focus:outline-none focus:ring-1 focus:ring-silver/80 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-silver uppercase tracking-wider block">
              รหัสผ่าน
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4 h-4 text-silver/60" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black-brand/30 border border-royal-navy/40 rounded-lg text-sm text-white placeholder-silver/40 focus:outline-none focus:ring-1 focus:ring-silver/80 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-royal-navy hover:bg-royal-navy/90 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-royal-navy/20 transition-all duration-150 active:scale-[0.98] disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังเข้าระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ</span>
            )}
          </button>
        </form>

        {/* Hints */}
        <div className="pt-2 text-center border-t border-royal-navy/20">
          <p className="text-[10px] text-silver/40">
            ระบบความปลอดภัยจำกัดสิทธิ์ระดับองค์กร RLS
          </p>
        </div>
      </div>
    </div>
  );
}
