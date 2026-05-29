import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const dossierId = qs.get('dossierId')

  const where: any = {}
  if (dossierId) where.dossierId = dossierId

  const payments = await prisma.payment.findMany({
    where,
    include: { dossier: { select: { dossierNumber: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ payments })
}

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { dossierId, amount, method, dueDate } = body

    if (!dossierId || amount === undefined) {
      return NextResponse.json({ error: 'dossierId et amount requis' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        dossierId,
        amount: parseFloat(amount),
        status: 'UNPAID',
        method: method || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}