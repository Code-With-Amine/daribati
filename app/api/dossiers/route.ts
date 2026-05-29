import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const qs = new URL(req.url).searchParams
  const clientId = qs.get('clientId')

  const args: any = {
    include: { documents: true, statusHistory: true, notes: true, client: true },
  }

  if (clientId) args.where = { clientId }

  const dossiers = await prisma.dossier.findMany(args)

  return NextResponse.json({ dossiers })
}

export async function POST(req: Request) {
  const body = await req.json()
  let { title, dossierNumber, clientId, createdById = null, landRef = '', documents } = body

  // generate a dossierNumber if not provided
  if (!dossierNumber) {
    dossierNumber = `D-${Date.now().toString(36).toUpperCase().slice(-8)}`
  }

  const data: any = {
    title,
    dossierNumber,
    clientId: clientId || null,
    createdById,
    landRef,
    status: 'EN_COURS',
    statusHistory: { create: { status: 'EN_COURS', note: 'Created via dialog', changedById: createdById } },
  }

  if (Array.isArray(documents) && documents.length > 0) {
    // sanitize up to 6 documents
    const docs = documents.slice(0, 6).map((d: any) => ({ name: d.name, fileUrl: d.fileUrl }))
    data.documents = { create: docs }
  }

  const dossier = await prisma.dossier.create({ data, include: { statusHistory: true, documents: true } })

  return NextResponse.json({ dossier }, { status: 201 })
}
