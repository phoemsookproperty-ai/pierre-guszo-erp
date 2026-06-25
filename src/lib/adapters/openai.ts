import { TryOnGenerationInput, TryOnGenerationResult, TryOnJobStatus, VirtualTryOnProvider } from '../tryon';
import { createClient } from '@/lib/supabase/server';

export class OpenAIAdapter implements VirtualTryOnProvider {
  private async getApiKey(): Promise<string> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('ai_provider_settings')
        .select('configuration')
        .eq('provider', 'OpenAI')
        .single();
      
      return data?.configuration?.api_key || process.env.OPENAI_API_KEY || '';
    } catch (e) {
      return process.env.OPENAI_API_KEY || '';
    }
  }

  async generate(input: TryOnGenerationInput): Promise<TryOnGenerationResult> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0400,
        error: 'API Key for OpenAI (ChatGPT) is not configured. Please check your AI Settings.',
      };
    }

    try {
      // 1. Build a highly descriptive prompt incorporating the source photo and suit catalog choices
      const styleDesc = input.styleDetails || `${input.fitType} suit`;
      const patternDetail = input.patternType !== 'Solid' ? `${input.patternType} (${input.patternDesc})` : 'solid color';
      
      const prompt = `A professional, high-end luxury studio portrait photograph of a client.
Client reference photo URL: ${input.sourceImageUrl}.
Please generate a photo of this client, preserving their face, facial features, hair, posture, and skin tone, but wearing a premium, bespoke tailored suit.
Suit details:
- Style: ${styleDesc}
- Color: ${input.colorHex}
- Fabric Pattern: ${patternDetail}
- Fit: ${input.fitType} tailored fit.
- Accents: includes a crisp white dress shirt and an elegant matching tie.
The person should be shown in a natural, confident pose, facing the camera. The background should be a clean, minimalist professional photography studio background. Keep the person's face, features, and hairstyle as close to the reference photo as possible, integrating the suit seamlessly.`;

      // 2. Call OpenAI DALL-E 3 API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'natural',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API request failed');
      }

      const outputUrl = data.data?.[0]?.url;
      if (!outputUrl) {
        throw new Error('OpenAI did not return any image URL in the response');
      }

      // OpenAI DALL-E 3 returns the output synchronously,
      // so we can resolve the job immediately as completed!
      const jobId = `openai_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      
      // Store in global memory map to simulate retrieval if requested later
      globalOpenAIResults.set(jobId, outputUrl);

      return {
        providerJobId: jobId,
        status: 'completed',
        estimatedCost: 0.0400,
        outputImageUrls: [outputUrl],
      };
    } catch (err: any) {
      console.error('OpenAI generate error:', err);
      return {
        providerJobId: '',
        status: 'failed',
        estimatedCost: 0.0400,
        error: err.message || 'Failed to generate image via OpenAI',
      };
    }
  }

  async getStatus(jobId: string): Promise<TryOnJobStatus> {
    const url = globalOpenAIResults.get(jobId);
    if (url) {
      return {
        providerJobId: jobId,
        status: 'completed',
        progressPct: 100,
        outputImageUrls: [url],
      };
    }
    return {
      providerJobId: jobId,
      status: 'failed',
      error: 'Job status not found or failed',
    };
  }

  async cancel(jobId: string): Promise<void> {
    return;
  }
}

// In-memory store for synchronous OpenAI results to satisfy immediate status queries
const globalOpenAIResults = new Map<string, string>();
