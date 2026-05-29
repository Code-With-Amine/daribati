import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const notaire = await prisma.user.findFirst({ where: { role: 'NOTAIRE' } })
  return NextResponse.json({ notaire: notaire as any })
}

export async function PUT(request: Request) {
  const contentType = request.headers.get('content-type') || ''
  let name = ''
  let email = ''
  let phone = ''
  let cin = ''
  let avatarUrl: string | null = null

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    name = String(form.get('name') || '')
    email = String(form.get('email') || '')
    phone = String(form.get('phone') || '')
    cin = String(form.get('cin') || '')
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
    phone = String(body.phone || '')
    cin = String(body.cin || '')
    if (body.avatar) avatarUrl = String(body.avatar)
  }

  try {
    const data: any = { name, email }
    if (phone) data.phone = phone
    if (cin) data.cin = cin
    if (avatarUrl) data.avatar = avatarUrl

    // Update the first notaire (app is single-notaire oriented)
    const notaire = await prisma.user.updateMany({ where: { role: 'NOTAIRE' }, data })
    return NextResponse.json({ notaire })
  } catch (err: any) {
    console.error('PUT /api/notaire error', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
