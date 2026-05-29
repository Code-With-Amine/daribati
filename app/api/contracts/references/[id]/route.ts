import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const reference = await prisma.contractReference.findUnique({ where: { id } })
  if (!reference || reference.createdById !== auth.user!.id) {
    return NextResponse.json({ error: 'Référence introuvable' }, { status: 404 })
  }

  return NextResponse.json({ reference })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const existing = await prisma.contractReference.findUnique({ where: { id } })
  if (!existing || existing.createdById !== auth.user!.id) {
    return NextResponse.json({ error: 'Référence introuvable' }, { status: 404 })
  }

  await prisma.contractReference.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
