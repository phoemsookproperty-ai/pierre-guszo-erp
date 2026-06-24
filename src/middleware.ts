import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Update session cookies first
  const response = await updateSession(request);

  // Create a minimal client to check auth status
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op here since updateSession already handled cookies updating
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasMockCookie = request.cookies.get('sb-mock-token')?.value === 'true';
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // If mock cookie is active, bypass strict auth checks for local preview
  if (hasMockCookie) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // If not authenticated and not visiting login, redirect to login
  if (!user && !isLoginPage && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and visiting login, redirect to dashboard root
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to exclude other files like images/logo:
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
