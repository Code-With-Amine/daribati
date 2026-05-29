const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('Password123!', 10)

  const owner = await prisma.user.upsert({
    where: { email: 'owner@daribati.com' },
    update: {},
    create: {
      name: 'Owner',
      email: 'owner@daribati.com',
      password: passwordHash,
      role: 'OWNER',
      phone: '0600000000',
    },
  })

  const notaire = await prisma.user.upsert({
    where: { email: 'notaire@example.com' },
    update: {},
    create: {
      name: 'Me Ahmed Benali',
      email: 'notaire@example.com',
      password: passwordHash,
      role: 'NOTAIRE',
      phone: '0612345678',
      cin: 'AB123456',
    },
  })

  const clients = await Promise.all([
    prisma.user.upsert({
      where: { email: 'client@example.com' },
      update: {},
      create: {
        name: 'Fatima Zahra El Amrani',
        email: 'client@example.com',
        password: passwordHash,
        role: 'CLIENT',
        phone: '0698765432',
        cin: 'FZ789012',
        notaireId: notaire.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'omar.hassan@example.com' },
      update: {},
      create: {
        name: 'Omar Hassan',
        email: 'omar.hassan@example.com',
        password: passwordHash,
        role: 'CLIENT',
        phone: '0655555555',
        cin: 'OH345678',
        notaireId: notaire.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'saad.bennis@example.com' },
      update: {},
      create: {
        name: 'Saad Bennis SARL',
        email: 'saad.bennis@example.com',
        password: passwordHash,
        role: 'CLIENT',
        phone: '0644444444',
        cin: 'SB901234',
        notaireId: notaire.id,
      },
    }),
  ])

  const statuses = ['EN_COURS', 'CHEZ_COMMUNE', 'CHEZ_CONSERVATION', 'TERMINE', 'DOCUMENTS_MANQUANTS', 'VALIDATION_BANCAIRE', 'EN_ATTENTE_SIGNATURE']

  for (let i = 1; i <= 5; i++) {
    const existing = await prisma.dossier.findUnique({ where: { dossierNumber: `DOS-${String(i).padStart(4, '0')}` } })
    if (!existing) {
      const clientIdx = (i - 1) % clients.length
      const dossier = await prisma.dossier.create({
        data: {
          title: `Vente immobilière #${i}`,
          dossierNumber: `DOS-${String(i).padStart(4, '0')}`,
          clientId: clients[clientIdx].id,
          createdById: notaire.id,
          status: statuses[(i - 1) % statuses.length],
          landRef: `LR-2024-${String(i * 100).padStart(5, '0')}`,
          statusHistory: {
            create: {
              status: statuses[(i - 1) % statuses.length],
              note: `Dossier créé et en cours de traitement`,
              changedById: notaire.id,
            },
          },
        },
      })

      if (i <= 3) {
        await prisma.document.create({
          data: {
            dossierId: dossier.id,
            name: i === 1 ? 'CIN.pdf' : i === 2 ? 'Titre foncier.pdf' : 'Contrat preliminaire.pdf',
            fileUrl: 'https://streamspher.com/example.pdf',
            uploadedById: notaire.id,
          },
        })
      }

      if (i <= 2) {
        await prisma.payment.create({
          data: {
            dossierId: dossier.id,
            amount: 500000 + (i * 100000),
            paidAmount: i === 1 ? 500000 : 100000,
            status: i === 1 ? 'PAID' : 'PARTIAL',
            method: i === 1 ? 'virement' : 'espèces',
            paidAt: i === 1 ? new Date() : null,
          },
        })
      }
    }
  }

  console.log('✅ Seed completed successfully')
  console.log('   Notaire: notaire@example.com / Password123!')
  console.log('   Client: client@example.com / Password123!')
  console.log('   5 dossiers created with various statuses')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
