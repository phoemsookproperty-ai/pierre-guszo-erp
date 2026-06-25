import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientImageQualityChecker } from '@/lib/quality-checker';

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

    // 2. Read multipart/form-data payload
    const formData = await request.formData();
    const customerId = formData.get('customer_id') as string;
    const file = formData.get('file') as File;

    if (!customerId || !file) {
      return NextResponse.json(
        { error: 'Missing customer_id or image file in payload' },
        { status: 400 }
      );
    }

    // Verify client consent exists before starting session
    const { data: consent } = await supabase
      .from('customer_ai_consents')
      .select('consented')
      .eq('customer_id', customerId)
      .eq('consented', true)
      .is('revoked_at', null)
      .single();

    if (!consent) {
      return NextResponse.json(
        { error: 'Customer consent is required before processing photographs' },
        { status: 403 }
      );
    }

    // 3. Image Quality Checker analysis
    const checker = new ClientImageQualityChecker();
    const qualityResult = await checker.analyzeImage(file);

    // 4. Upload photo to private storage bucket
    const fileExt = file.name.split('.').pop() || 'jpg';
    const mediaId = crypto.randomUUID();
    const fileName = `${mediaId}_source.${fileExt}`;
    const storagePath = `customers/${customerId}/source/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer-attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 5. Insert record into media_files
    const { data: mediaFile, error: mediaError } = await supabase
      .from('media_files')
      .insert([
        {
          id: mediaId,
          file_name: file.name,
          file_path: storagePath,
          mime_type: file.type,
          file_size: file.size,
          category: 'CustomerPhoto',
          uploaded_by: user.id,
        },
      ])
      .select()
      .single();

    if (mediaError) {
      throw mediaError;
    }

    // Link media file to customer entity
    await supabase.from('entity_media_links').insert([
      {
        media_file_id: mediaId,
        entity_type: 'Customer',
        entity_id: customerId,
      },
    ]);

    // 6. Create AI Try-on session in 'Draft' state
    const { data: session, error: sessionError } = await supabase
      .from('ai_tryon_sessions')
      .insert([
        {
          customer_id: customerId,
          source_image_id: mediaId,
          provider: 'Mock', // Default to Mock adapter
          model_name: 'pierre-mock-tryon-v1',
          status: 'Draft',
          requested_by: user.id,
        },
      ])
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      media_file_id: mediaId,
      quality_check: qualityResult,
    });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize try-on session' },
      { status: 500 }
    );
  }
}
