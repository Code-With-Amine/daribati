import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'

async function requireNotaire(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return null
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== 'NOTAIRE') return null
  return dbUser
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireNotaire(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await prisma.dossier.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireNotaire(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
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
          changedById: user.id,
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