import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProvider, buildGarmentPrompt } from '@/lib/tryon';
import { checkBudgetLimit } from '@/lib/budget';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    // 1. Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Load staff profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, nickname')
      .eq('id', user.id)
      .single();

    const staffName = profile 
      ? `${profile.first_name} ${profile.last_name} (${profile.nickname || ''})`
      : 'Staff';

    // Get user role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id);
    
    const roleName = userRoles?.[0]?.roles ? (userRoles[0].roles as any).name : 'Staff';

    // 2. Fetch active session details
    const { data: session, error: sessionError } = await supabase
      .from('ai_tryon_sessions')
      .select('*, media_files(file_path)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify PDPA/Consent exists
    const { data: consent } = await supabase
      .from('customer_ai_consents')
      .select('consented')
      .eq('customer_id', session.customer_id)
      .eq('consented', true)
      .is('revoked_at', null)
      .single();

    if (!consent) {
      return NextResponse.json(
        { error: 'Customer PDPA consent is required before processing photos' },
        { status: 403 }
      );
    }

    // 3. Read body configuration parameters
    const body = await request.json();
    const {
      suit_style_id,
      color_pattern_id,
      generation_count = 1,
      preserve_face: preserveFace = 'medium',
      preserve_hair: preserveHair = true,
      preserve_body: preserveBody = true,
      preserve_pose: preservePose = true,
      preserve_background: preserveBackground = false,
      background_mode: backgroundMode = 'studio',
      provider_name = 'Mock', // Default fallback
    } = body;

    if (!suit_style_id || !color_pattern_id) {
      return NextResponse.json(
        { error: 'suit_style_id and color_pattern_id are required' },
        { status: 400 }
      );
    }

    // 4. Fetch details for style and fabric pattern from catalog
    const { data: style } = await supabase
      .from('suit_styles')
      .select('*')
      .eq('id', suit_style_id)
      .single();

    const { data: pattern } = await supabase
      .from('suit_color_patterns')
      .select('*')
      .eq('id', color_pattern_id)
      .single();

    if (!style || !pattern) {
      return NextResponse.json(
        { error: 'Invalid style or pattern selected' },
        { status: 404 }
      );
    }

    // 5. Fetch Provider cost rates
    const { data: providerSetting } = await supabase
      .from('ai_provider_settings')
      .select('*')
      .eq('provider', provider_name)
      .single();

    const costPerImage = providerSetting ? Number(providerSetting.cost_per_generation) : 0.00;

    // 6. Run Budget check
    const budgetCheck = await checkBudgetLimit(
      user.id,
      session.customer_id,
      generation_count,
      costPerImage
    );

    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: `Budget block: ${budgetCheck.reason}`, code: budgetCheck.reason },
        { status: 403 }
      );
    }

    // 7. Get private secure URL for the customer photograph
    const sourceFilePath = (session.media_files as any)?.file_path;
    if (!sourceFilePath) {
      return NextResponse.json(
        { error: 'Session source photograph file path not found' },
        { status: 404 }
      );
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('customer-attachments')
      .createSignedUrl(sourceFilePath, 600); // 10 minutes expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error('Failed to generate temporary signed URL for AI processing');
    }

    // 8. Invoke Provider Adapter
    const providerInstance = getProvider(provider_name);
    const generationResult = await providerInstance.generate({
      sessionId,
      sourceImageUrl: signedUrlData.signedUrl,
      garmentType: style.category,
      fitType: style.fit_type,
      styleDetails: buildGarmentPrompt(style, pattern),
      colorHex: pattern.primary_hex,
      patternType: pattern.pattern_type,
      patternDesc: pattern.pattern_description || '',
      preserveFace,
      preserveHair,
      preserveBody,
      preservePose,
      preserveBackground,
      backgroundMode,
      numImages: generation_count,
    });

    // 9. Update session record
    await supabase
      .from('ai_tryon_sessions')
      .update({
        suit_style_id,
        color_pattern_id,
        provider: provider_name,
        model_name: providerSetting?.model_name || 'pierre-tryon-v1',
        status: generationResult.status === 'completed' ? 'Completed' : 'Queued',
        generation_count,
        estimated_cost: budgetCheck.estimatedCost,
        actual_cost: generationResult.status === 'completed' ? budgetCheck.estimatedCost : 0.00,
        preserve_face: preserveFace,
        preserve_hair: preserveHair,
        preserve_body: preserveBody,
        preserve_pose: preservePose,
        preserve_background: preserveBackground,
        background_mode: backgroundMode,
        started_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    // Save outputs if completed synchronously (like Mock can sometimes simulate)
    if (generationResult.status === 'completed' && generationResult.outputImageUrls) {
      for (let i = 0; i < generationResult.outputImageUrls.length; i++) {
        await supabase.from('ai_tryon_results').insert([
          {
            session_id: sessionId,
            output_image_path: generationResult.outputImageUrls[i],
            provider_result_id: generationResult.providerJobId,
            version_number: i + 1,
          },
        ]);
      }

      await supabase
        .from('ai_tryon_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    // 10. Write usage record log
    await supabase.from('ai_usage_logs').insert([
      {
        session_id: sessionId,
        user_id: user.id,
        provider: provider_name,
        model_name: providerSetting?.model_name || 'pierre-tryon-v1',
        images_generated: generation_count,
        cost: budgetCheck.estimatedCost,
        status: generationResult.status,
      },
    ]);

    // 11. Log Audit trail
    await supabase.from('audit_logs').insert([
      {
        user_id: user.id,
        user_name_snapshot: staffName,
        role: roleName,
        action: 'GENERATE_TRYON',
        entity_type: 'Customer',
        entity_id: session.customer_id,
        before_data: { session_id: sessionId },
        after_data: {
          style_code: style.code,
          pattern_code: pattern.code,
          provider: provider_name,
          images_requested: generation_count,
          estimated_cost: budgetCheck.estimatedCost,
        },
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || 'Unknown',
        reason: `Triggered AI virtual try-on using model ${providerSetting?.model_name || 'pierre-tryon-v1'}`,
      },
    ]);

    return NextResponse.json({
      success: true,
      job_id: generationResult.providerJobId,
      status: generationResult.status,
      outputImageUrls: generationResult.outputImageUrls || [],
    });
  } catch (error: any) {
    console.error('AI generation trigger error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to trigger AI Try-On generation' },
      { status: 500 }
    );
  }
}
