import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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
    return NextResponse.json(
      { error: error.message || 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // 2. Read parameters
    const body = await request.json();
    const { provider, model_name, endpoint_url, is_enabled, cost_per_generation, api_key } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider name is required' }, { status: 400 });
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
