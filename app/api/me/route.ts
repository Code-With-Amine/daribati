import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function getUserIdFromToken(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const m = auth.match(/^Bearer\s+(.*)$/i)
  if (!m) return null
  const token = m[1]
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    return payload.userId
  } catch (e) {
    return null
  }
}

export async function GET(request: Request) {
  const userId = getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return NextResponse.json({ user: user as any })
}

export async function PUT(request: Request) {
  const userId = getUserIdFromToken(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = request.headers.get('content-type') || ''
  let data: any = {}
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    data.name = String(form.get('name') || '')
    data.email = String(form.get('email') || '')
    data.phone = String(form.get('phone') || '')
    data.cin = String(form.get('cin') || '')
  const pw = String(form.get('password') || '')
  if (pw) data.password = await bcrypt.hash(pw, 10)
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
        data.avatar = `/uploads/${filename}`
      } catch (e) {
        console.error('Upload error', e)
      }
    }
  } else {
    const body = await request.json()
    data.name = String(body.name || '')
    data.email = String(body.email || '')
    data.phone = String(body.phone || '')
    data.cin = String(body.cin || '')
  if (body.password) data.password = await bcrypt.hash(String(body.password), 10)
    if (body.avatar) data.avatar = String(body.avatar)
  }

  try {
    const user = await prisma.user.update({ where: { id: userId }, data })
    return NextResponse.json({ user: user as any })
  } catch (err: any) {
    console.error('PUT /api/me error', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
