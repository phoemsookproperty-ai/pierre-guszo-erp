import { TryOnGenerationInput, TryOnGenerationResult, TryOnJobStatus, VirtualTryOnProvider } from '../tryon';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export class OpenAIAdapter implements VirtualTryOnProvider {
  private async getApiKey(): Promise<string> {
    try {
      const cookieStore = await cookies();
      const demoSettingsStr = cookieStore.get('sb-demo-ai-settings')?.value;
      if (demoSettingsStr) {
        try {
          const settings = JSON.parse(demoSettingsStr);
          const providerSetting = settings.find((s: any) => s.provider === 'OpenAI');
          if (providerSetting?.configuration?.api_key) {
            return providerSetting.configuration.api_key;
          }
        } catch (_) {}
      }

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

  private async getModelName(): Promise<string> {
    try {
      const cookieStore = await cookies();
      const demoSettingsStr = cookieStore.get('sb-demo-ai-settings')?.value;
      if (demoSettingsStr) {
        try {
          const settings = JSON.parse(demoSettingsStr);
          const providerSetting = settings.find((s: any) => s.provider === 'OpenAI');
          if (providerSetting?.model_name) {
            return providerSetting.model_name;
          }
        } catch (_) {}
      }

      const supabase = await createClient();
      const { data } = await supabase
        .from('ai_provider_settings')
        .select('model_name')
        .eq('provider', 'OpenAI')
        .single();
      
      return data?.model_name || 'dall-e-3';
    } catch (e) {
      return 'dall-e-3';
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

    const modelName = await this.getModelName();

    try {
      // 1. Analyze the face and pose of the client photo using GPT-4o-mini (Vision)
      let personDescription = '';
      if (input.sourceImageUrl) {
        try {
          const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Please describe the person in this image in detail so a text-to-image model can recreate them. Focus on their face shape, eyes, hair color and style, skin tone, facial hair, gender, approximate age, pose/posture, and the background. Keep it concise but highly descriptive (approx. 2-3 sentences). Do not mention what they are wearing, as we will replace their clothes.'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: input.sourceImageUrl
                      }
                    }
                  ]
                }
              ],
              max_tokens: 300
            })
          });

          const visionData = await visionResponse.json();
          if (visionResponse.ok) {
            personDescription = visionData.choices?.[0]?.message?.content || '';
          } else {
            console.warn('GPT-4o Vision description call failed:', visionData.error?.message);
          }
        } catch (err) {
          console.warn('Failed to call GPT-4o Vision description:', err);
        }
      }

      const styleDesc = input.styleDetails || `${input.fitType} suit`;
      const patternDetail = input.patternType !== 'Solid' ? `${input.patternType} (${input.patternDesc})` : 'solid color';
      
      let prompt = '';
      if (personDescription) {
        prompt = `A professional, high-end luxury studio portrait photograph of a client.
Appearance of the person:
${personDescription}
The person must be wearing a premium, bespoke tailored suit.
Suit details:
- Style: ${styleDesc}
- Color: ${input.colorHex}
- Fabric Pattern: ${patternDetail}
- Fit: ${input.fitType} tailored fit.
- Accents: includes a crisp white dress shirt and an elegant matching tie.
Please render the person with the exact same facial features, hair, skin tone, pose, and background as described above, wearing the suit seamlessly and naturally.`;
      } else {
        prompt = `A professional, high-end luxury studio portrait photograph of a client.
Please generate a photo of this client, preserving their face, facial features, hair, posture, and skin tone, but wearing a premium, bespoke tailored suit.
Suit details:
- Style: ${styleDesc}
- Color: ${input.colorHex}
- Fabric Pattern: ${patternDetail}
- Fit: ${input.fitType} tailored fit.
- Accents: includes a crisp white dress shirt and an elegant matching tie.
The person should be shown in a natural, confident pose, facing the camera. The background should be a clean, minimalist professional photography studio background. Keep the person's face, features, and hairstyle as close to the reference photo as possible, integrating the suit seamlessly.`;
      }
 
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName || 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: modelName === 'dall-e-2' ? '512x512' : '1024x1024',
          quality: modelName === 'dall-e-2' ? 'standard' : 'hd',
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

      const jobId = `openai_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
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

const globalOpenAIResults = new Map<string, string>();
