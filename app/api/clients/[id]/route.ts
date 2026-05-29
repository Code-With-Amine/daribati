import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: Request, context: any) {
  const id = context?.params?.id
  try {
    const contentType = request.headers.get('content-type') || ''
    let name = ''
    let email = ''
    let avatarUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      name = String(form.get('name') || '')
      email = String(form.get('email') || '')
      const avatar = form.get('avatar') as File | null
      if (avatar && (avatar as any).size) {
        const buffer = Buffer.from(await (avatar as File).arrayBuffer())
        const filename = `${Date.now()}-${(avatar as File).name}`
        const fs = require('fs')
        const path = require('path')
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        try {
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
          fs.writeFileSync(path.join(uploadDir, filename), buffer)
          avatarUrl = `/uploads/${filename}`
        } catch (e) {
          console.error('Upload error', e)
        }
      }
    } else {
      const body = await request.json()
      name = String(body.name || '')
      email = String(body.email || '')
      if (body.avatar) avatarUrl = String(body.avatar)
    }

    // Cast data as any to work around prisma client types until you run `npx prisma generate`
    const data: any = { name, email }
    if (avatarUrl) data.avatar = avatarUrl

    const user = await prisma.user.update({ where: { id }, data: data as any })
    const ua: any = user
    return NextResponse.json({ client: { id: ua.id, name: ua.name, email: ua.email, avatar: ua.avatar } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: any) {
  const id = context?.params?.id
  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
