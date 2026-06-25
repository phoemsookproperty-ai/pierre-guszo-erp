'use client';

import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Cpu, ShieldAlert, CheckCircle2, Key, Info, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AISettingsPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Input states for form editing
  const [modelNames, setModelNames] = useState<Record<string, string>>({});
  const [endpoints, setEndpoints] = useState<Record<string, string>>({});
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [enabledStatus, setEnabledStatus] = useState<Record<string, boolean>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/ai');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch AI settings');
      
      setProviders(data.settings || []);

      // Initialize form fields
      const newModelNames: Record<string, string> = {};
      const newEndpoints: Record<string, string> = {};
      const newCosts: Record<string, number> = {};
      const newApiKeys: Record<string, string> = {};
      const newEnabledStatus: Record<string, boolean> = {};

      data.settings.forEach((s: any) => {
        newModelNames[s.provider] = s.model_name || '';
        newEndpoints[s.provider] = s.endpoint_url || '';
        newCosts[s.provider] = Number(s.cost_per_generation) || 0;
        newApiKeys[s.provider] = s.configuration?.api_key || '';
        newEnabledStatus[s.provider] = s.is_enabled;
      });

      setModelNames(newModelNames);
      setEndpoints(newEndpoints);
      setCosts(newCosts);
      setApiKeys(newApiKeys);
      setEnabledStatus(newEnabledStatus);
    } catch (e: any) {
      setErrorMessage(e.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลตั้งค่า AI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const localSettings = localStorage.getItem('sb-demo-ai-settings');
      if (localSettings && !document.cookie.includes('sb-demo-ai-settings')) {
        document.cookie = `sb-demo-ai-settings=${encodeURIComponent(localSettings)}; path=/; max-age=315360000`;
      }
    } catch (_) {}
    fetchSettings();
  }, []);

  const handleSaveProvider = async (provider: string) => {
    setSavingMap((prev) => ({ ...prev, [provider]: true }));
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        provider,
        model_name: modelNames[provider],
        endpoint_url: endpoints[provider],
        cost_per_generation: costs[provider],
        is_enabled: enabledStatus[provider],
        api_key: apiKeys[provider],
      };

      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      // Save to localStorage too!
      try {
        const localSettingsStr = localStorage.getItem('sb-demo-ai-settings') || '[]';
        let currentSettings = JSON.parse(localSettingsStr);
        if (!Array.isArray(currentSettings)) currentSettings = [];
        
        const existingIdx = currentSettings.findIndex((s: any) => s.provider === provider);
        const newSetting = {
          provider,
          model_name: modelNames[provider],
          endpoint_url: endpoints[provider],
          cost_per_generation: costs[provider],
          is_enabled: enabledStatus[provider],
          configuration: {
            api_key: apiKeys[provider] && !apiKeys[provider].includes('...') ? apiKeys[provider] : (currentSettings[existingIdx]?.configuration?.api_key || ''),
            has_key: apiKeys[provider] ? true : false,
          }
        };
        
        if (existingIdx >= 0) {
          currentSettings[existingIdx] = newSetting;
        } else {
          currentSettings.push(newSetting);
        }
        localStorage.setItem('sb-demo-ai-settings', JSON.stringify(currentSettings));
        
        // Write cookie with 10-year expiration directly in the client too!
        document.cookie = `sb-demo-ai-settings=${encodeURIComponent(JSON.stringify(currentSettings))}; path=/; max-age=315360000`;
      } catch (_) {}

      setSuccessMessage(`บันทึกการตั้งค่าผู้ให้บริการ ${provider} สำเร็จเรียบร้อยแล้ว`);
      
      // Reload keys from API to show masked format
      await fetchSettings();
    } catch (e: any) {
      setErrorMessage(e.message || `เกิดข้อผิดพลาดในการบันทึกค่าของ ${provider}`);
    } finally {
      setSavingMap((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  if (loading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-royal-navy" />
          <h2 className="font-bold text-slate-800 text-sm">การตั้งค่าโมเดลปัญญาประดิษฐ์ (AI Providers Settings)</h2>
        </div>
      </section>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Info warning banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <Info className="w-4 h-4 text-blue-500" />
          <span>คำแนะนำความปลอดภัยในการจัดเก็บ API Key</span>
        </div>
        <p>1. API Key ทั้งหมดจะถูกเก็บรักษาอย่างปลอดภัยใน PostgreSQL Database หลังบ้านของร้าน และจะไม่ส่งออกไปยังหน้าเว็บบราวเซอร์ของพนักงานทั่วไป</p>
        <p>2. สำหรับการประมวลผลด้วยโมเดล AI จริง (เช่น Fal.ai หรือ Fashn.ai) คุณจะต้องสมัครใช้บริการโดยตรงกับผู้ให้บริการนั้นๆ เพื่อนำคีย์ลับมาบันทึกใช้งาน</p>
      </div>

      {/* List of providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map((p) => {
          const provider = p.provider;
          const isMock = provider === 'Mock';

          return (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs flex flex-col justify-between">
              <div className="space-y-4">
                {/* Provider Title & Active Status */}
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border flex items-center justify-center font-bold text-royal-navy">
                      {provider.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{provider} Try-On Engine</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">{isMock ? 'ระบบจำลองการประมวลผล' : 'ระบบ AI ประมวลผลจากรูปจริง'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">สถานะเปิดใช้งาน</span>
                    <input
                      type="checkbox"
                      checked={enabledStatus[provider] || false}
                      onChange={(e) => setEnabledStatus((prev) => ({ ...prev, [provider]: e.target.checked }))}
                      className="w-4 h-4 rounded text-royal-navy border-slate-300 focus:ring-royal-navy"
                    />
                  </div>
                </div>

                {/* Model Configuration Form */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Model Name / รหัสโมเดล</label>
                    {provider === 'OpenAI' ? (
                      <select
                        value={modelNames[provider] || 'dall-e-3'}
                        onChange={(e) => setModelNames((prev) => ({ ...prev, [provider]: e.target.value }))}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-navy font-semibold text-slate-700 bg-white"
                      >
                        <option value="dall-e-3">dall-e-3 (แนะนำ - ใช้งานได้ปกติ)</option>
                        <option value="dall-e-2">dall-e-2 (เฉพาะบัญชีเก่า / Legacy)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={modelNames[provider] || ''}
                        onChange={(e) => setModelNames((prev) => ({ ...prev, [provider]: e.target.value }))}
                        placeholder={provider === 'Fal' ? 'fal-ai/foduu/idm-vton' : 'e.g. model-identifier'}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-navy font-semibold text-slate-700"
                      />
                    )}
                  </div>

                  {!isMock && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">API Endpoint URL / ที่อยู่เซิร์ฟเวอร์</label>
                        <input
                          type="text"
                          value={endpoints[provider] || ''}
                          onChange={(e) => setEndpoints((prev) => ({ ...prev, [provider]: e.target.value }))}
                          placeholder="https://..."
                          className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-semibold text-slate-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Key className="w-3 h-3" /> API Key / คีย์ลับผู้ให้บริการ
                        </label>
                        <div className="relative">
                          <input
                            type={showKeys[provider] ? 'text' : 'password'}
                            value={apiKeys[provider] || ''}
                            onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))}
                            placeholder={p.configuration?.has_key ? '••••••••••••••••' : 'กรอก API Key ใหม่เพื่อตั้งค่า'}
                            className="w-full p-2 pr-10 border border-slate-200 rounded-lg focus:outline-none font-mono text-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(provider)}
                            className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Per Generation (USD)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={costs[provider] || 0}
                        onChange={(e) => setCosts((prev) => ({ ...prev, [provider]: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none font-bold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1 self-end pb-1.5 text-[10px] text-slate-400 font-semibold">
                      {isMock ? 'ไม่มีค่าบริการจริง' : `ประมาณ $${(costs[provider] || 0).toFixed(4)} ต่อภาพ`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
                <Button
                  onClick={() => handleSaveProvider(provider)}
                  disabled={savingMap[provider]}
                  className="bg-royal-navy hover:bg-navy font-bold text-xs py-1.5 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingMap[provider] ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
