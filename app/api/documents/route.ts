import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    // Accept both form-data (from legacy clients) and JSON
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

    const doc = await prisma.document.create({ data: { dossierId, name, fileUrl } })
    return NextResponse.json({ doc }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/documents error:', err)
    return NextResponse.json({ error: 'Impossible de créer le document. Réessayez plus tard.' }, { status: 500 })
  }
}
