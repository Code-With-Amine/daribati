import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import NotaireSettings from '../../../components/NotaireSettings'

export const dynamic = 'force-dynamic'

async function getNotaire() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null
    const { payload } = await jwtVerify(session, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'))
    return prisma.user.findUnique({ where: { id: payload.sub as string } })
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const notaire = await getNotaire()
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Gérez les informations de votre compte notaire</p>
      </div>
      <NotaireSettings initialNotaire={notaire} />
    </div>
  )
}
