import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const cookieStore = await cookies();
    const isMockMode = cookieStore.get('sb-mock-token')?.value === 'true';
    const isMockSession = sessionId.startsWith('mock_sess_') || isMockMode;

    const body = await request.json();
    const { source_image_url } = body;

    if (!source_image_url) {
      return NextResponse.json({ error: 'source_image_url is required' }, { status: 400 });
    }

    // 1. Fetch OpenAI API Key
    let apiKey = '';

    if (isMockSession) {
      const demoSettingsStr = cookieStore.get('sb-demo-ai-settings')?.value;
      if (demoSettingsStr) {
        try {
          const settings = JSON.parse(demoSettingsStr);
          const providerSetting = settings.find((s: any) => s.provider === 'OpenAI');
          apiKey = providerSetting?.configuration?.api_key || '';
        } catch (_) {}
      }
    }

    if (!apiKey) {
      const supabase = await createClient();
      try {
        const { data } = await supabase
          .from('ai_provider_settings')
          .select('configuration')
          .eq('provider', 'OpenAI')
          .single();
        apiKey = data?.configuration?.api_key || '';
      } catch (_) {}
    }

    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY || '';
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key for OpenAI (ChatGPT) is not configured. Please check your AI Settings.' },
        { status: 400 }
      );
    }

    // 2. Call GPT-4o-mini Vision to analyze the client photo
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
                  url: source_image_url
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    const visionData = await visionResponse.json();
    if (!visionResponse.ok) {
      throw new Error(visionData.error?.message || 'Failed to analyze image via OpenAI Vision API');
    }

    const description = visionData.choices?.[0]?.message?.content || '';
    if (!description) {
      throw new Error('OpenAI Vision API did not return a description');
    }

    return NextResponse.json({
      success: true,
      description,
    });
  } catch (error: any) {
    console.error('Describe route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
