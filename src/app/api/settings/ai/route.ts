import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const DEFAULT_SETTINGS_MOCK = [
  {
    id: '1',
    provider: 'Mock',
    model_name: 'pierre-mock-tryon-v1',
    endpoint_url: 'local://mock-provider',
    is_enabled: true,
    priority: 1,
    cost_per_generation: 0.0000,
    configuration: { has_key: false, api_key: '' }
  },
  {
    id: '2',
    provider: 'Fal',
    model_name: 'fal-ai/foduu/idm-vton',
    endpoint_url: 'https://queue.fal.run/fal-ai/foduu/idm-vton',
    is_enabled: true,
    priority: 2,
    cost_per_generation: 0.0150,
    configuration: { has_key: false, api_key: '' }
  },
  {
    id: '3',
    provider: 'Fashn',
    model_name: 'fashn-v1',
    endpoint_url: 'https://api.fashn.ai/v1/run',
    is_enabled: true,
    priority: 3,
    cost_per_generation: 0.0500,
    configuration: { has_key: false, api_key: '' }
  },
  {
    id: '4',
    provider: 'OpenAI',
    model_name: 'dall-e-3',
    endpoint_url: 'https://api.openai.com/v1/images/generations',
    is_enabled: true,
    priority: 4,
    cost_per_generation: 0.0400,
    configuration: { has_key: false, api_key: '' }
  },
  {
    id: '5',
    provider: 'Replicate',
    model_name: 'da77198e0e935a4d6b63...',
    endpoint_url: 'https://api.replicate.com/v1/predictions',
    is_enabled: true,
    priority: 5,
    cost_per_generation: 0.0250,
    configuration: { has_key: false, api_key: '' }
  }
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isMockMode = cookieStore.get('sb-mock-token')?.value === 'true';

    if (isMockMode) {
      const demoSettingsStr = cookieStore.get('sb-demo-ai-settings')?.value;
      if (demoSettingsStr) {
        try {
          return NextResponse.json({ success: true, settings: JSON.parse(demoSettingsStr) });
        } catch (_) {}
      }
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS_MOCK });
    }

    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS_MOCK });
      }
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // 2. Fetch provider settings
    const { data: settings, error } = await supabase
      .from('ai_provider_settings')
      .select('*')
      .order('priority', { ascending: true });

    if (error) throw error;

    // Mask configuration API keys for security
    const maskedSettings = (settings || []).map((s: any) => {
      const config = s.configuration || {};
      const maskedConfig = { ...config };
      
      if (config.api_key) {
        const key = config.api_key;
        maskedConfig.api_key = key.length > 8 
          ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
          : '••••••••';
        maskedConfig.has_key = true;
      } else {
        maskedConfig.has_key = false;
        maskedConfig.api_key = '';
      }
      
      return {
        ...s,
        configuration: maskedConfig,
      };
    });

    return NextResponse.json({ success: true, settings: maskedSettings });
  } catch (error: any) {
    console.error('Failed to get AI settings:', error);
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS_MOCK });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isMockMode = cookieStore.get('sb-mock-token')?.value === 'true';

    const body = await request.json();
    const { provider, model_name, endpoint_url, is_enabled, cost_per_generation, api_key } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider name is required' }, { status: 400 });
    }

    if (isMockMode) {
      const demoSettingsStr = cookieStore.get('sb-demo-ai-settings')?.value;
      let currentSettings = DEFAULT_SETTINGS_MOCK;
      if (demoSettingsStr) {
        try {
          currentSettings = JSON.parse(demoSettingsStr);
        } catch (_) {}
      }

      const updated = currentSettings.map((s) => {
        if (s.provider === provider) {
          const config = s.configuration || {};
          return {
            ...s,
            model_name: model_name !== undefined ? model_name : s.model_name,
            endpoint_url: endpoint_url !== undefined ? endpoint_url : s.endpoint_url,
            cost_per_generation: cost_per_generation !== undefined ? cost_per_generation : s.cost_per_generation,
            is_enabled: is_enabled !== undefined ? is_enabled : s.is_enabled,
            configuration: {
              ...config,
              api_key: api_key && !api_key.includes('...') ? api_key : config.api_key,
              has_key: api_key ? true : config.has_key,
            }
          };
        }
        return s;
      });

      const res = NextResponse.json({ success: true, message: 'Settings saved successfully (Demo Mode)' });
      res.cookies.set('sb-demo-ai-settings', JSON.stringify(updated), { path: '/', maxAge: 315360000 });
      return res;
    }

    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Get user role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id);
    
    const roleName = userRoles?.[0]?.roles ? (userRoles[0].roles as any).name : 'Staff';
    if (roleName !== 'Owner' && roleName !== 'Manager') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // Load existing settings to preserve other config values
    const { data: existing } = await supabase
      .from('ai_provider_settings')
      .select('configuration')
      .eq('provider', provider)
      .single();

    const existingConfig = existing?.configuration || {};
    
    // Merge new API key if provided and not masked
    let finalApiKey = existingConfig.api_key || '';
    if (api_key && !api_key.includes('...')) {
      finalApiKey = api_key;
    }

    const updatedConfig = {
      ...existingConfig,
      api_key: finalApiKey,
    };

    const updatePayload: any = {};
    if (model_name !== undefined) updatePayload.model_name = model_name;
    if (endpoint_url !== undefined) updatePayload.endpoint_url = endpoint_url;
    if (is_enabled !== undefined) updatePayload.is_enabled = is_enabled;
    if (cost_per_generation !== undefined) updatePayload.cost_per_generation = cost_per_generation;
    updatePayload.configuration = updatedConfig;
    updatePayload.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('ai_provider_settings')
      .update(updatePayload)
      .eq('provider', provider);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Failed to update AI settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update AI settings' },
      { status: 500 }
    );
  }
}
