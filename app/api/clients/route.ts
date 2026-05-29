import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

function genPassword(len = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function GET(req: Request) {
  try {
    // List clients; if notaireId is provided on the querystring, filter by it
    const url = new URL(req.url)
    const notaireId = url.searchParams.get('notaireId')
    const where: any = { role: 'CLIENT' }
    if (notaireId) where.notaireId = notaireId
    const clients = await prisma.user.findMany({ where, select: { id: true, name: true, email: true, phone: true } })
    return NextResponse.json({ clients })
  } catch (err: any) {
    console.error('GET /api/clients error:', err)
    return NextResponse.json({ error: String(err?.message || err), stack: err?.stack }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
  const { name, email, password } = body
    if (!name || !email) return NextResponse.json({ error: 'Missing' }, { status: 400 })

    const tempPassword = password || genPassword(10)
    const hashed = await bcrypt.hash(tempPassword, 10)
  const { phone, notaireId, cin } = body

    // Build data using accepted Prisma fields; notaireId can be null
  const data: any = {
    name,
    email,
    role: 'CLIENT',
    password: hashed,
  }
  if (phone) data.phone = phone
  if (cin) data.cin = cin
  data.notaireId = notaireId || null

  const client = await prisma.user.create({ data })

    // We no longer send emails automatically. It's up to the notaire to provide credentials to their client.
    return NextResponse.json({ client, tempPassword }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/clients error:', err)
    return NextResponse.json({ error: String(err?.message || err), stack: err?.stack }, { status: 500 })
  }
}
