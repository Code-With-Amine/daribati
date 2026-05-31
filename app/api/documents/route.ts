import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    let dossierId: string | undefined
    let name: string | undefined
    let fileUrl: string | undefined

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      dossierId = body.dossierId
      name = body.name
      fileUrl = body.fileUrl
    } else {
      const form = await req.formData()
      dossierId = form.get('dossierId') as string
      name = form.get('name') as string
      fileUrl = form.get('fileUrl') as string
    }

    if (!dossierId || !name || !fileUrl) return NextResponse.json({ error: 'Dossier, nom ou url de fichier manquant' }, { status: 400 })

    const dossier = await prisma.dossier.findFirst({ where: { id: dossierId, createdById: auth.user.id } })
    if (!dossier) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })

    const doc = await prisma.document.create({ data: { dossierId, name, fileUrl } })
    return NextResponse.json({ doc }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Impossible de créer le document' }, { status: 500 })
  }
}
