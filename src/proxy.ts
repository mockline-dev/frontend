import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/workspace']

const authRoutes = ['/auth/login', '/auth/signup']


export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const jwtToken = request.cookies.get('jwt')?.value
  const currentUser = request.cookies.get('currentUser')?.value
  
  const isAuthenticated = !!(jwtToken && currentUser)
  
  // Handle protected routes - redirect unauthenticated users to root
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Handle auth routes - redirect authenticated users to dashboard
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Handle root route - allow both authenticated and unauthenticated users
  // Authenticated users can access root page (landing/marketing page) if they want
  // No redirect needed - let them stay on root if they choose to
  
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com; " +
    "style-src 'self' 'unsafe-inline' https://accounts.google.com; " +
    "img-src 'self' data: https: https://accounts.google.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' ws://localhost:* wss://localhost:* https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com https://www.googleapis.com; " +
    "frame-src 'self' https://accounts.google.com https://mockline-1a0e0.firebaseapp.com;"
  )
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)',]
}
