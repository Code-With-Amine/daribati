import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireOwner } from '@/app/api/auth/middleware'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOwner(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await req.json()

  const notaire = await prisma.user.findUnique({ where: { id } })
  if (!notaire || notaire.role !== 'NOTAIRE') {
    return NextResponse.json({ error: 'Notaire not found' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.disabled !== undefined && { disabled: body.disabled }),
      ...(body.name && { name: body.name }),
      ...(body.phone !== undefined && { phone: body.phone }),
    },
  })

  return NextResponse.json({ id: updated.id, disabled: updated.disabled })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireOwner(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params

  const notaire = await prisma.user.findUnique({ where: { id } })
  if (!notaire || notaire.role !== 'NOTAIRE') {
    return NextResponse.json({ error: 'Notaire not found' }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
