import { TryOnGenerationInput, TryOnGenerationResult, TryOnJobStatus, VirtualTryOnProvider } from '../tryon';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const STOCK_GARMENTS: Record<string, string> = {
  'navy': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
  'grey': 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600&auto=format&fit=crop',
  'beige': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop',
  'black': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
};

function getGarmentImageUrl(colorHex: string): string {
  const hex = (colorHex || '#101B33').toLowerCase();
  if (hex === '#101b33' || hex === '#1d3155' || hex === '#254a84' || hex.includes('blue') || hex.includes('navy')) {
    return STOCK_GARMENTS.navy;
  }
  if (hex === '#3c3f45' || hex === '#686b70' || hex === '#a6a8ab' || hex.includes('grey') || hex.includes('gray')) {
    return STOCK_GARMENTS.grey;
  }
  if (hex === '#b49a78' || hex === '#d0bfa3' || hex.includes('beige') || hex.includes('cream') || hex.includes('sand')) {
    return STOCK_GARMENTS.beige;
  }
  return STOCK_GARMENTS.black;
}

export class FashnAdapter implements VirtualTryOnProvider {
  private async getApiKey(): Promise<string> {
    try {
      const cookieStore = await cookies();
      const demoSettingsStr = cookieStore.get('sb-demo-ai-settings')?.value;
      if (demoSettingsStr) {
        try {
          const settings = JSON.parse(demoSettingsStr);
          const providerSetting = settings.find((s: any) => s.provider === 'Fashn');
          if (providerSetting?.configuration?.api_key) {
            return providerSetting.configuration.api_key;
          }
        } catch (_) {}
      }

      const supabase = await createClient();
      const { data } = await supabase
        .from('ai_provider_settings')
        .select('configuration')
        .eq('provider', 'Fashn')
        .single();
      
      return data?.configuration?.api_key || process.env.FASHN_API_KEY || '';
    } catch (e) {
      return process.env.FASHN_API_KEY || '';
    }
  }

  async generate(input: TryOnGenerationInput): Promise<TryOnGenerationResult> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0500,
        error: 'API Key for Fashn.ai is not configured. Please check your AI Settings.',
      };
    }

    const garmentUrl = getGarmentImageUrl(input.colorHex);
    const category = input.garmentType.toLowerCase().includes('trouser') ? 'bottoms' : 'tops';

    try {
      const response = await fetch('https://api.fashn.ai/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model_image: input.sourceImageUrl,
          garment_image: garmentUrl,
          category: category,
          mode: 'professional',
          cover_feet: true,
          adjust_hands: true,
          guidance_scale: 2.5,
          timesteps: 25,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Fashn API request failed');
      }

      return {
        providerJobId: data.id,
        status: 'queued',
        estimatedCost: 0.0500,
      };
    } catch (err: any) {
      console.error('Fashn generate error:', err);
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0500,
        error: err.message || 'Failed to submit job to Fashn.ai',
      };
    }
  }

  async getStatus(jobId: string): Promise<TryOnJobStatus> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: jobId,
        status: 'failed',
        error: 'Fashn.ai API key is missing',
      };
    }

    try {
      const res = await fetch(`https://api.fashn.ai/v1/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch status from Fashn.ai');
      }

      const status = data.status;

      if (status === 'queued') {
        return {
          providerJobId: jobId,
          status: 'queued',
          progressPct: 15,
        };
      }

      if (status === 'processing') {
        return {
          providerJobId: jobId,
          status: 'processing',
          progressPct: 55,
        };
      }

      if (status === 'failed') {
        return {
          providerJobId: jobId,
          status: 'failed',
          error: data.error || 'Job failed on Fashn.ai side',
        };
      }

      if (status === 'completed') {
        const outputImage = data.output?.[0];
        if (!outputImage) {
          throw new Error('Fashn.ai did not return any output image URL');
        }

        return {
          providerJobId: jobId,
          status: 'completed',
          progressPct: 100,
          outputImageUrls: data.output || [],
        };
      }

      return {
        providerJobId: jobId,
        status: 'processing',
        progressPct: 40,
      };
    } catch (err: any) {
      console.error('Fashn getStatus error:', err);
      return {
        providerJobId: jobId,
        status: 'failed',
        error: err.message || 'Failed to query status from Fashn.ai',
      };
    }
  }

  async cancel(jobId: string): Promise<void> {
    return;
  }
}
