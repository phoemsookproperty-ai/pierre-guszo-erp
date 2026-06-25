import { TryOnGenerationInput, TryOnGenerationResult, TryOnJobStatus, VirtualTryOnProvider } from '../tryon';
import { createClient } from '@/lib/supabase/server';

const STOCK_GARMENTS: Record<string, string> = {
  'navy': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
  'grey': 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600&auto=format&fit=crop',
  'beige': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop',
  'black': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
};

function getGarmentImageUrl(colorHex: string): string {
  // Simple heuristic to map color to closest stock garment photo
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
  return STOCK_GARMENTS.black; // default to black tux
}

export class FalAdapter implements VirtualTryOnProvider {
  private async getApiKey(): Promise<string> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('ai_provider_settings')
        .select('configuration')
        .eq('provider', 'Fal')
        .single();
      
      return data?.configuration?.api_key || process.env.FAL_API_KEY || '';
    } catch (e) {
      return process.env.FAL_API_KEY || '';
    }
  }

  async generate(input: TryOnGenerationInput): Promise<TryOnGenerationResult> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0150,
        error: 'API Key for Fal.ai is not configured. Please check your AI Settings.',
      };
    }

    const garmentUrl = getGarmentImageUrl(input.colorHex);
    const category = input.garmentType.toLowerCase().includes('trouser') ? 'lower_body' : 'upper_body';

    try {
      const response = await fetch('https://queue.fal.run/fal-ai/foduu/idm-vton', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`,
        },
        body: JSON.stringify({
          human_image_url: input.sourceImageUrl,
          garment_image_url: garmentUrl,
          description: input.styleDetails,
          category: category,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Fal API request failed');
      }

      return {
        providerJobId: data.request_id,
        status: 'queued',
        estimatedCost: 0.0150,
      };
    } catch (err: any) {
      console.error('Fal generate error:', err);
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0150,
        error: err.message || 'Failed to submit job to Fal.ai',
      };
    }
  }

  async getStatus(jobId: string): Promise<TryOnJobStatus> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: jobId,
        status: 'failed',
        error: 'Fal.ai API key is missing',
      };
    }

    try {
      // 1. Fetch status of queue request
      const statusRes = await fetch(`https://queue.fal.run/fal-ai/foduu/idm-vton/requests/${jobId}/status`, {
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
      });

      const statusData = await statusRes.json();
      if (!statusRes.ok) {
        throw new Error(statusData.detail || 'Failed to fetch status from Fal.ai');
      }

      const status = statusData.status;

      if (status === 'IN_QUEUE') {
        return {
          providerJobId: jobId,
          status: 'queued',
          progressPct: 10,
        };
      }

      if (status === 'IN_PROGRESS') {
        return {
          providerJobId: jobId,
          status: 'processing',
          progressPct: 50,
        };
      }

      if (status === 'FAILED') {
        return {
          providerJobId: jobId,
          status: 'failed',
          error: statusData.error || 'Job failed on Fal.ai side',
        };
      }

      if (status === 'COMPLETED') {
        // 2. Fetch completed output result details
        const resultRes = await fetch(`https://queue.fal.run/fal-ai/foduu/idm-vton/requests/${jobId}`, {
          headers: {
            'Authorization': `Key ${apiKey}`,
          },
        });

        const resultData = await resultRes.json();
        if (!resultRes.ok) {
          throw new Error('Failed to retrieve finalized result from Fal.ai');
        }

        const outputUrl = resultData.image?.url;
        if (!outputUrl) {
          throw new Error('Fal.ai output did not return any image URL');
        }

        return {
          providerJobId: jobId,
          status: 'completed',
          progressPct: 100,
          outputImageUrls: [outputUrl],
        };
      }

      return {
        providerJobId: jobId,
        status: 'processing',
        progressPct: 30,
      };
    } catch (err: any) {
      console.error('Fal getStatus error:', err);
      return {
        providerJobId: jobId,
        status: 'failed',
        error: err.message || 'Failed to query status from Fal.ai',
      };
    }
  }

  async cancel(jobId: string): Promise<void> {
    // Fal doesn't support easy REST API cancels on free queues, we just return
    return;
  }
}
