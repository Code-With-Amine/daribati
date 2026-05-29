import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

async function uploadToLocal(fileBuffer: Buffer, filename: string) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, filename)
  fs.writeFileSync(filePath, fileBuffer)
  return `/uploads/${filename}`
}

async function uploadToS3(fileBuffer: Buffer, filename: string) {
  const client = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! } })
  const bucket = process.env.AWS_S3_BUCKET!
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: filename, Body: fileBuffer, ContentType: 'application/octet-stream' })
  await client.send(cmd)
  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
  return url
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const dossierId = form.get('dossierId') as string
    const name = form.get('name') as string
    const file = form.get('file') as unknown as File

  if (!dossierId || !name || !file) return NextResponse.json({ error: 'Dossier, nom ou fichier manquant' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = `${Date.now()}-${file.name}`

    let fileUrl = ''
    if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
      fileUrl = await uploadToS3(buffer, filename)
    } else {
      fileUrl = await uploadToLocal(buffer, filename)
    }

    const doc = await prisma.document.create({ data: { dossierId, name, fileUrl } })
    return NextResponse.json({ doc }, { status: 201 })
  } catch (err: any) {
    console.error('Upload error', err)
    return NextResponse.json({ error: 'Impossible de téléverser le document. Réessayez plus tard.' }, { status: 500 })
  }
}
