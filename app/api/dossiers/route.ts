import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const clientId = qs.get('clientId')

  const where: any = { createdById: auth.user.id }
  if (clientId) where.clientId = clientId

  const dossiers = await prisma.dossier.findMany({
    where,
    include: { documents: true, statusHistory: true, notes: true, client: true },
  })

  return NextResponse.json({ dossiers })
}

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  let { title, dossierNumber, clientId = null, landRef = '', documents } = body

  if (!dossierNumber) {
    dossierNumber = `D-${Date.now().toString(36).toUpperCase().slice(-8)}`
  }

  const data: any = {
    title,
    dossierNumber,
    clientId,
    createdById: auth.user.id,
    landRef,
    status: 'EN_COURS',
    statusHistory: { create: { status: 'EN_COURS', note: 'Créé', changedById: auth.user.id } },
  }

  if (Array.isArray(documents) && documents.length > 0) {
    const docs = documents.slice(0, 6).map((d: any) => ({ name: d.name, fileUrl: d.fileUrl }))
    data.documents = { create: docs }
  }

  const dossier = await prisma.dossier.create({ data, include: { statusHistory: true, documents: true } })

  return NextResponse.json({ dossier }, { status: 201 })
}
