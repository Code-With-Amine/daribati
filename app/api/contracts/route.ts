import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'
import { generateContract } from '@/lib/contract-engine'

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const {
      dossierId, title, prompt, method = 'AI',
      referenceIds, templateId, templateVariables
    } = body

    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } })
    if (!dossier) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })

    if (method === 'TEMPLATE' && !templateId) {
      return NextResponse.json({ error: 'templateId requis pour la méthode TEMPLATE' }, { status: 400 })
    }

    if ((method === 'AI' || method === 'INSPIRATION') && !prompt) {
      return NextResponse.json({ error: 'prompt requis pour la méthode ' + method }, { status: 400 })
    }

    const result = await generateContract({
      prompt: prompt || '',
      dossierId,
      method,
      referenceIds,
      templateId,
      templateVariables,
      notaireName: auth.user?.name,
    })

    const dbTitle = title
      || (templateId ? (await prisma.contractTemplate.findUnique({ where: { id: templateId } }))?.name : null)
      || `Contrat - ${dossier.dossierNumber}`

    const contract = await prisma.contract.create({
      data: {
        dossierId,
        title: dbTitle,
        content: result.content,
        method: result.method,
        prompt: result.prompt || null,
        templateId: result.templateId || null,
        templateData: result.templateData || undefined,
        referenceIds: result.referenceIds || [],
        createdById: auth.user!.id,
      },
    })

    return NextResponse.json({ contract }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const dossierId = qs.get('dossierId')

  const where: any = {}
  if (dossierId) where.dossierId = dossierId

  const contracts = await prisma.contract.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { template: true },
  })

  return NextResponse.json({ contracts })
}
