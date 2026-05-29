import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, phone } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role.toUpperCase(),
        phone,
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
