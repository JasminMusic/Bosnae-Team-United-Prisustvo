import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifyToken } from './lib/session'

// Optimistic check only: every page, action and API route also calls requireAuth().
export async function proxy(request: NextRequest) {
  const ok = process.env.APP_PASSWORD ? await verifyToken(request.cookies.get(SESSION_COOKIE)?.value) : false
  if (ok) return NextResponse.next()

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|icons/|manifest.webmanifest|sw.js|favicon.ico|offline.html).*)'],
}
