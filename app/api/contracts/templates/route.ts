import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireNotaire } from '@/app/api/auth/middleware'

export async function GET(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const qs = new URL(req.url).searchParams
  const category = qs.get('category')

  const where: any = { createdById: auth.user!.id }
  if (category) where.category = category

  const templates = await prisma.contractTemplate.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ templates })
}

export async function POST(req: Request) {
  const auth = await requireNotaire(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { name, description, content, category } = body

    if (!name || !content) {
      return NextResponse.json({ error: 'name et content requis' }, { status: 400 })
    }

    const template = await prisma.contractTemplate.create({
      data: {
        name,
        description,
        content,
        category: category || null,
        createdById: auth.user!.id,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
