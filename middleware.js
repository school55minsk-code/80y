import { NextResponse } from 'next/server'

export function middleware(req) {
  const url = req.nextUrl

  // Ограничиваем только путь /moderator
  if (url.pathname.startsWith('/moderator')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      // Задай свои логин/пароль
      if (user === 'admin' && pwd === 'secret123') {
        return NextResponse.next()
      }
    }

    return new Response('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}
