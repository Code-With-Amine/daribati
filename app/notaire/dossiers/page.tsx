import { prisma } from '@/lib/db'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'

async function getDossiers() {
  return prisma.dossier.findMany({ include: { client: true }, orderBy: { createdAt: 'desc' } })
}

async function getNotaire() {
  return prisma.user.findFirst({ where: { role: 'NOTAIRE' } })
}

export default async function DossiersPage() {
  const [dossiers, notaire] = await Promise.all([getDossiers(), getNotaire()])
  const docsCount = await prisma.document.count()

  const user = { name: notaire?.name ?? 'Maître', email: notaire?.email }
  const navMain = [{ title: 'Dossiers', url: '/notaire/dossiers' }, { title: 'Tableau de bord', url: '/notaire/dashboard' }]
  const docs = [{ name: `Documents (${docsCount})`, url: '/notaire/documents' }]

  return (
    <div className="flex">
      <AppSidebar user={user} navMain={navMain} documents={docs} />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Dossiers</h1>
          <div className="bg-white rounded-2xl shadow p-4">
            <table className="w-full text-left">
              <thead className="text-slate-500 text-sm">
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(dossiers as any[]).map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="py-3 text-blue-600 font-medium"><Link href={`/notaire/dossiers/${d.id}`}>{d.dossierNumber}</Link></td>
                    <td className="py-3">{d.client?.name}</td>
                    <td className="py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
