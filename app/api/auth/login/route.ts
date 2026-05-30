import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function getExpiry() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d
}

export async function POST(req: Request) {
  try {
    let email, password
    try {
      const body = await req.json()
      email = body.email
      password = body.password
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    let user
    try {
      user = await prisma.user.findUnique({ where: { email } })
    } catch (dbErr: any) {
      return NextResponse.json({ error: `Database error: ${dbErr.message}` }, { status: 500 })
    }

    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    if (user.disabled) return NextResponse.json({ error: 'Account disabled' }, { status: 403 })

    let passwordOk
    try {
      passwordOk = await bcrypt.compare(password, user.password)
    } catch (bcryptErr: any) {
      return NextResponse.json({ error: `Bcrypt error: ${bcryptErr.message}` }, { status: 500 })
    }

    if (!passwordOk) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    let secret
    try {
      secret = new TextEncoder().encode(JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'JWT_SECRET encoding failed' }, { status: 500 })
    }

    let token
    try {
      token = await new SignJWT({ sub: user.id, role: user.role, name: user.name, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .setIssuedAt()
        .sign(secret)
    } catch (jwtErr: any) {
      return NextResponse.json({ error: `JWT signing error: ${jwtErr.message}` }, { status: 500 })
    }

    try {
      const response = NextResponse.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone }
      })

      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: getExpiry(),
        path: '/',
      })

      return response
    } catch (respErr: any) {
      return NextResponse.json({ error: `Response error: ${respErr.message}` }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Unexpected error: ${err.message}` }, { status: 500 })
  }
}
