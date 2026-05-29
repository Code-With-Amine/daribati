import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const template = await prisma.contractTemplate.findUnique({ where: { id } })
  if (!template || template.createdById !== auth.user!.id) {
    return NextResponse.json({ error: 'Template introuvable' }, { status: 404 })
  }

  return NextResponse.json({ template })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const existing = await prisma.contractTemplate.findUnique({ where: { id } })
  if (!existing || existing.createdById !== auth.user!.id) {
    return NextResponse.json({ error: 'Template introuvable' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const template = await prisma.contractTemplate.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        description: body.description ?? undefined,
        content: body.content ?? undefined,
        category: body.category ?? undefined,
      },
    })

    return NextResponse.json({ template })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const existing = await prisma.contractTemplate.findUnique({ where: { id } })
  if (!existing || existing.createdById !== auth.user!.id) {
    return NextResponse.json({ error: 'Template introuvable' }, { status: 404 })
  }

  await prisma.contractTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
