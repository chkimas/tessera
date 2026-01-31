import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const requestId = crypto.randomUUID()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-control-plane-trace-id', requestId)

  if (req.nextUrl.pathname.startsWith('/api')) {
    const contentType = req.headers.get('content-type')
    if (req.method !== 'GET' && contentType !== 'application/json') {
      return NextResponse.json(
        { error: 'Protocol Violation: API requires application/json' },
        { status: 415 }
      )
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
