const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('Password123!', 10)

  const notaire = await prisma.user.upsert({
    where: { email: 'notaire@example.com' },
    update: {},
    create: {
      name: 'Notaire Demo',
      email: 'notaire@example.com',
      password: passwordHash,
      role: 'NOTAIRE',
      phone: '0612345678',
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Client Demo',
      email: 'client@example.com',
      password: passwordHash,
      role: 'CLIENT',
      phone: '0698765432',
    },
  })

  // avoid duplicate unique constraint errors by reusing an existing dossier if present
  const existing = await prisma.dossier.findUnique({ where: { dossierNumber: 'SEED-0001' } })
  let dossier
  if (existing) {
    dossier = existing
    console.log('Using existing dossier', dossier.id)
  } else {
    dossier = await prisma.dossier.create({
      data: {
        title: 'Seeded Dossier',
        dossierNumber: 'SEED-0001',
        clientId: client.id,
        createdById: notaire.id,
        status: 'EN_COURS',
        landRef: 'LR-SEED-1',
        statusHistory: {
          create: {
            status: 'EN_COURS',
            note: 'Dossier created by seed script',
            changedById: notaire.id,
          },
        },
      },
    })
  }

  // create document if it doesn't already exist for this dossier
  const existingDoc = await prisma.document.findFirst({ where: { dossierId: dossier.id, fileUrl: 'https://streamspher.com/example.pdf' } })
  if (!existingDoc) {
    await prisma.document.create({
      data: {
        dossierId: dossier.id,
        name: 'example.pdf',
        fileUrl: 'https://streamspher.com/example.pdf',
        uploadedById: notaire.id,
      },
    })
  }

  // create note if not exists
  const existingNote = await prisma.note.findFirst({ where: { dossierId: dossier.id, content: 'This is an initial internal note (seed).' } })
  if (!existingNote) {
    await prisma.note.create({
      data: {
        dossierId: dossier.id,
        userId: notaire.id,
        content: 'This is an initial internal note (seed).',
      },
    })
  }

  console.log('Seeding finished')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
