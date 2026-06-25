import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProvider } from '@/lib/tryon';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');

    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const isMockMode = cookieStore.get('sb-mock-token')?.value === 'true';
    const isMockSession = sessionId.startsWith('mock_sess_') || isMockMode;

    if (isMockSession) {
      const providerName = searchParams.get('provider') || 'Mock';
      const providerInstance = getProvider(providerName);
      const statusResult = await providerInstance.getStatus(jobId);

      return NextResponse.json({
        success: true,
        status: statusResult.status,
        progressPct: statusResult.progressPct || 0,
        outputImageUrls: statusResult.outputImageUrls || [],
        error: statusResult.error,
      });
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

    // 2. Fetch session detail
    const { data: session, error: sessionError } = await supabase
      .from('ai_tryon_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 3. Query Provider Status
    const providerInstance = getProvider(session.provider);
    const statusResult = await providerInstance.getStatus(jobId);

    // 4. Update session DB if job state has updated
    let mappedStatus = session.status;
    if (statusResult.status === 'processing') {
      mappedStatus = 'Processing';
    } else if (statusResult.status === 'completed') {
      mappedStatus = 'Completed';
    } else if (statusResult.status === 'failed') {
      mappedStatus = 'Failed';
    }

    if (mappedStatus !== session.status) {
      const updateData: any = { status: mappedStatus };
      if (mappedStatus === 'Completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (mappedStatus === 'Failed') {
        updateData.failed_at = new Date().toISOString();
        updateData.error_message = statusResult.error || 'Provider execution failed';
      }
      await supabase
        .from('ai_tryon_sessions')
        .update(updateData)
        .eq('id', sessionId);
    }

    // 5. If completed and results not recorded, insert them
    if (statusResult.status === 'completed' && statusResult.outputImageUrls) {
      // Check if already populated
      const { count } = await supabase
        .from('ai_tryon_results')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if ((count || 0) === 0) {
        for (let i = 0; i < statusResult.outputImageUrls.length; i++) {
          await supabase.from('ai_tryon_results').insert([
            {
              session_id: sessionId,
              output_image_path: statusResult.outputImageUrls[i],
              provider_result_id: jobId,
              version_number: i + 1,
            },
          ]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: statusResult.status,
      progressPct: statusResult.progressPct || 0,
      outputImageUrls: statusResult.outputImageUrls || [],
      error: statusResult.error,
    });
  } catch (error: any) {
    console.error('Job status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch generation status' },
      { status: 500 }
    );
  }
}
