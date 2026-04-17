import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, SESSION_COOKIE, type Role } from '@/lib/auth';

// Route → allowed roles. Longest prefix wins.
const ROUTE_ROLES: Record<string, Role[]> = {
  // Admin-only
  '/admin/engine': ['admin'],
  '/admin/engine-m2': ['admin'],
  '/admin/testlab': ['admin'],
  '/admin/testlab-m2': ['admin'],
  '/admin/simulator': ['admin'],
  '/admin/simulator-m2': ['admin'],
  '/admin/traceability': ['admin'],
  // Admin + Management
  '/admin/gas': ['admin', 'management'],
  '/admin/applications': ['admin', 'management'],
  '/admin/space-types': ['admin', 'management'],
  '/admin/products': ['admin', 'management'],
  '/admin/discount-matrix': ['admin', 'management'],
  '/admin/calc-sheets': ['admin', 'management'],
  // Quotes — accessible to all internal roles
  '/admin/catalogue': ['admin', 'sales', 'management'],
  '/admin/quotes': ['admin', 'sales', 'management'],
  // Architecture — admin only
  '/admin/architecture': ['admin'],
  // Settings — admin only
  '/admin/settings': ['admin'],
  // Admin dashboard (admin only)
  '/admin': ['admin'],
  // Legacy sales routes
  '/sales': ['admin', 'sales'],
};

function findAllowedRoles(pathname: string): Role[] | null {
  // Longest prefix match
  let bestMatch = '';
  for (const route of Object.keys(ROUTE_ROLES)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      if (route.length > bestMatch.length) bestMatch = route;
    }
  }
  return bestMatch ? ROUTE_ROLES[bestMatch] : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedRoles = findAllowedRoles(pathname);

  // Public route → allow
  if (!allowedRoles) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifySession(cookie.value);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all admin/sales routes except public assets
    '/admin/:path*',
    '/sales/:path*',
  ],
};
