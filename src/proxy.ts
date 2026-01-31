import { NextRequest, NextResponse } from 'next/server'

export default function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-control-plane-trace-id', requestId)

  if (request.nextUrl.pathname.startsWith('/api')) {
    const contentType = request.headers.get('content-type')
    if (request.method !== 'GET' && contentType !== 'application/json') {
      return NextResponse.json(
        { error: 'Protocol Violation: API requires application/json' },
        { status: 415 }
      )
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
