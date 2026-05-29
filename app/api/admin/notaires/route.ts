import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireOwner } from '@/app/api/auth/middleware'
import bcrypt from 'bcryptjs'

export async function GET(req: Request) {
  const auth = await requireOwner(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const notaires = await prisma.user.findMany({
    where: { role: 'NOTAIRE' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      disabled: true,
      createdAt: true,
      _count: { select: { dossiers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notaires)
}

export async function POST(req: Request) {
  const auth = await requireOwner(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { name, email, password, phone } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, password required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const notaire = await prisma.user.create({
      data: { name, email, password: hashed, role: 'NOTAIRE', phone },
    })

    return NextResponse.json({ id: notaire.id, name: notaire.name, email: notaire.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
