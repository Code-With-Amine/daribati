import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const dossierId = qs.get('dossierId')

  const where: any = { createdById: auth.user!.id }
  if (dossierId) where.dossierId = dossierId

  const references = await prisma.contractReference.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { dossier: { select: { dossierNumber: true, title: true } } },
  })

  return NextResponse.json({ references })
}

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const formData = await req.formData()

    const name = (formData.get('name') as string) || 'Référence'
    const description = formData.get('description') as string || null
    const dossierId = formData.get('dossierId') as string || null
    const file = formData.get('file') as File | null
    const contentText = formData.get('content') as string | null

    let content = contentText || ''

    if (file) {
      content = await file.text()
    }

    if (!content) {
      return NextResponse.json({ error: 'Contenu ou fichier requis' }, { status: 400 })
    }

    const reference = await prisma.contractReference.create({
      data: {
        name,
        description,
        content,
        createdById: auth.user!.id,
        dossierId: dossierId || null,
      },
    })

    return NextResponse.json({ reference }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
