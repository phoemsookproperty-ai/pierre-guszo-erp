import { TryOnGenerationInput, TryOnGenerationResult, TryOnJobStatus, VirtualTryOnProvider } from '../tryon';
import { createClient } from '@/lib/supabase/server';

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

export class ReplicateAdapter implements VirtualTryOnProvider {
  private async getApiKey(): Promise<string> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('ai_provider_settings')
        .select('configuration')
        .eq('provider', 'Replicate')
        .single();
      
      return data?.configuration?.api_key || process.env.REPLICATE_API_TOKEN || '';
    } catch (e) {
      return process.env.REPLICATE_API_TOKEN || '';
    }
  }

  async generate(input: TryOnGenerationInput): Promise<TryOnGenerationResult> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0250,
        error: 'API Key for Replicate is not configured. Please check your AI Settings.',
      };
    }

    const garmentUrl = getGarmentImageUrl(input.colorHex);
    const category = input.garmentType.toLowerCase().includes('trouser') ? 'lower_body' : 'upper_body';

    try {
      // Replicate IDM-VTON model version hash
      const modelVersion = 'da77198e0e935a4d6b637d7ef20da62f7902d1847e0ab021b021319760777b73';

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`,
        },
        body: JSON.stringify({
          version: modelVersion,
          input: {
            human_image: input.sourceImageUrl,
            garment_image: garmentUrl,
            description: input.styleDetails,
            category: category,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Replicate API request failed');
      }

      return {
        providerJobId: data.id,
        status: 'queued',
        estimatedCost: 0.0250,
      };
    } catch (err: any) {
      console.error('Replicate generate error:', err);
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0250,
        error: err.message || 'Failed to submit job to Replicate',
      };
    }
  }

  async getStatus(jobId: string): Promise<TryOnJobStatus> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: jobId,
        status: 'failed',
        error: 'Replicate API key is missing',
      };
    }

    try {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to fetch status from Replicate');
      }

      const status = data.status; // starting, processing, succeeded, failed, canceled

      if (status === 'starting') {
        return {
          providerJobId: jobId,
          status: 'queued',
          progressPct: 10,
        };
      }

      if (status === 'processing') {
        return {
          providerJobId: jobId,
          status: 'processing',
          progressPct: 60,
        };
      }

      if (status === 'failed' || status === 'canceled') {
        return {
          providerJobId: jobId,
          status: 'failed',
          error: data.error || 'Job failed on Replicate side',
        };
      }

      if (status === 'succeeded') {
        // Replicate output is typically an array of string URLs or a string
        const output = data.output;
        let outputUrl = '';
        
        if (Array.isArray(output) && output.length > 0) {
          outputUrl = output[0];
        } else if (typeof output === 'string') {
          outputUrl = output;
        }

        if (!outputUrl) {
          throw new Error('Replicate did not return any output image URL');
        }

        return {
          providerJobId: jobId,
          status: 'completed',
          progressPct: 100,
          outputImageUrls: Array.isArray(output) ? output : [outputUrl],
        };
      }

      return {
        providerJobId: jobId,
        status: 'processing',
        progressPct: 40,
      };
    } catch (err: any) {
      console.error('Replicate getStatus error:', err);
      return {
        providerJobId: jobId,
        status: 'failed',
        error: err.message || 'Failed to query status from Replicate',
      };
    }
  }

  async cancel(jobId: string): Promise<void> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return;

    try {
      await fetch(`https://api.replicate.com/v1/predictions/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });
    } catch (e) {
      console.error('Failed to cancel Replicate prediction:', e);
    }
  }
}
