import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'
import bcrypt from 'bcryptjs'

function genPassword(len = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT', notaireId: auth.user.id },
      select: { id: true, name: true, email: true, phone: true, cin: true, avatar: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ clients })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { name, email, password } = body
    if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })

    const tempPassword = password || genPassword(10)
    const hashed = await bcrypt.hash(tempPassword, 10)
    const { phone, cin, avatar } = body

    const client = await prisma.user.create({
      data: {
        name,
        email,
        role: 'CLIENT',
        password: hashed,
        phone: phone || null,
        cin: cin || null,
        avatar: avatar || null,
        notaireId: auth.user.id,
      },
    })

    return NextResponse.json({ client, tempPassword }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
