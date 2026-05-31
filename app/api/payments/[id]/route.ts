import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params

  const payment = await prisma.payment.findFirst({
    where: { id, dossier: { createdById: auth.user.id } },
  })
  if (!payment) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })

  try {
    const body = await req.json()
    const { paidAmount, status, method, paidAt } = body

    const data: any = {}
    if (paidAmount !== undefined) data.paidAmount = parseFloat(paidAmount)
    if (status !== undefined) data.status = status
    if (method !== undefined) data.method = method
    if (paidAt !== undefined) data.paidAt = new Date(paidAt)
    if (status === 'PAID' && !body.paidAt) data.paidAt = new Date()

    const updated = await prisma.payment.update({ where: { id }, data })
    return NextResponse.json({ payment: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params

  const payment = await prisma.payment.findFirst({
    where: { id, dossier: { createdById: auth.user.id } },
  })
  if (!payment) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })

  try {
    await prisma.payment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
