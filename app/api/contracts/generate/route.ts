import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'
import { generateContract } from '@/lib/contract-engine'

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { dossierId, prompt, method = 'AI', referenceIds, templateId, templateVariables } = body

    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
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

    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
