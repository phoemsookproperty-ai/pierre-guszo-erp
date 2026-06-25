import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const consentSchema = z.object({
  customer_id: z.string().uuid(),
  consent_version: z.string().default('v1.0'),
  consented: z.boolean(),
  signature_path: z.string().optional(),
  device_info: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get logged-in user profile details
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Load staff profile details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, nickname')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 403 });
    }

    // Get user role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id);
    
    const roleName = userRoles?.[0]?.roles ? (userRoles[0].roles as any).name : 'Staff';

    // 2. Validate input payload
    const body = await request.json();
    const validatedData = consentSchema.parse(body);

    const { customer_id, consent_version, consented, signature_path, device_info } = validatedData;

    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('first_name, last_name')
      .eq('id', customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // 3. Upsert client consent details
    const consentRecord = {
      customer_id,
      consent_version,
      consented,
      signature_path: signature_path || null,
      device_info: device_info || {},
      consented_by: user.id,
      consented_at: consented ? new Date().toISOString() : null,
      revoked_at: !consented ? new Date().toISOString() : null,
    };

    // Find if there is an existing consent record
    const { data: existingConsent } = await supabase
      .from('customer_ai_consents')
      .select('id, consented')
      .eq('customer_id', customer_id)
      .single();

    let result;
    if (existingConsent) {
      result = await supabase
        .from('customer_ai_consents')
        .update(consentRecord)
        .eq('id', existingConsent.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('customer_ai_consents')
        .insert([consentRecord])
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    // Update pdpa_consent on customers table as well
    await supabase
      .from('customers')
      .update({
        pdpa_consent: consented,
        pdpa_consent_date: consented ? new Date().toISOString() : null,
      })
      .eq('id', customer_id);

    // 4. Log audit record
    const auditAction = consented ? 'SIGN_CONSENT' : 'REVOKE_CONSENT';
    const auditData = {
      user_id: user.id,
      user_name_snapshot: `${profile.first_name} ${profile.last_name} (${profile.nickname || ''})`,
      role: roleName,
      action: auditAction,
      entity_type: 'Customer',
      entity_id: customer_id,
      before_data: existingConsent ? { consented: existingConsent.consented } : null,
      after_data: { consented },
      ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'Unknown',
      reason: consented 
        ? `Customer signed AI Virtual Try-On consent version ${consent_version}`
        : `Customer revoked AI Virtual Try-On consent`,
    };

    await supabase.from('audit_logs').insert([auditData]);

    return NextResponse.json({
      success: true,
      consented,
      data: result.data,
    });
  } catch (error: any) {
    console.error('Consent processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process consent transaction' },
      { status: 500 }
    );
  }
}
