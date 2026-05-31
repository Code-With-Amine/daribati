import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const dossier = await prisma.dossier.findFirst({
    where: { id, createdById: auth.user.id },
    include: { client: true, documents: true, statusHistory: { orderBy: { createdAt: 'desc' } }, payments: true, notes: true },
  })
  if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })
  return NextResponse.json({ dossier })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const existing = await prisma.dossier.findFirst({ where: { id, createdById: auth.user.id } })
  if (!existing) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

  try {
    const body = await req.json()
    const { title, dossierNumber, clientId, landRef, status } = body

    const data: any = {}
    if (title !== undefined) data.title = title
    if (dossierNumber !== undefined) data.dossierNumber = dossierNumber
    if (clientId !== undefined) data.clientId = clientId || null
    if (landRef !== undefined) data.landRef = landRef
    if (status !== undefined) data.status = status

    if (status !== undefined) {
      await prisma.statusHistory.create({
        data: {
          dossierId: id,
          status,
          note: 'Statut mis à jour',
          changedById: auth.user.id,
        },
      })
    }

    const updated = await prisma.dossier.update({
      where: { id },
      data,
      include: { client: true, documents: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
    })

    return NextResponse.json({ ok: true, dossier: updated })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const existing = await prisma.dossier.findFirst({ where: { id, createdById: auth.user.id } })
  if (!existing) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

  try {
    await prisma.dossier.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
