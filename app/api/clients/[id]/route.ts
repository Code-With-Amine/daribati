import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params

  const existing = await prisma.user.findFirst({
    where: { id, role: 'CLIENT', notaireId: auth.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  try {
    const body = await request.json()
    const { name, email, phone, cin, avatar } = body

    const data: any = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (cin !== undefined) data.cin = cin
    if (avatar !== undefined) data.avatar = avatar

    const user = await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ client: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, phone: user.phone, cin: user.cin } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params

  const existing = await prisma.user.findFirst({
    where: { id, role: 'CLIENT', notaireId: auth.user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
