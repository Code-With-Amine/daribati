import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const dossierId = form.get('dossierId') as string
    const name = form.get('name') as string
    const file = form.get('file') as unknown as File

  if (!dossierId || !name || !file) return NextResponse.json({ error: 'Dossier, nom ou fichier manquant' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let fileUrl = ''

    const hasS3 = process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION
    if (hasS3) {
      const client = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! } })
      const filename = `${Date.now()}-${file.name}`
      const cmd = new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: filename, Body: buffer, ContentType: file.type || 'application/octet-stream' })
      await client.send(cmd)
      fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
    } else {
      const base64 = buffer.toString('base64')
      fileUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`
    }

    const doc = await prisma.document.create({ data: { dossierId, name, fileUrl } })
    return NextResponse.json({ doc }, { status: 201 })
  } catch (err: any) {
    console.error('Upload error', err)
    return NextResponse.json({ error: 'Impossible de téléverser le document. Réessayez plus tard.' }, { status: 500 })
  }
}
