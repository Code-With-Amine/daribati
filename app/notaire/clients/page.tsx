import { prisma } from '@/lib/db'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
function ClientsAdmin({ initialClients }: { initialClients: Array<any> }) {
  return (
    <div>
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Email</th>
          </tr>
        </thead>
        <tbody>
          {initialClients.map((c: any) => (
            <tr key={c.id}>
              <td className="border px-2 py-1">{c.name ?? '—'}</td>
              <td className="border px-2 py-1">{c.email ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function getClients() {
  return prisma.user.findMany({ where: { role: 'CLIENT' } })
}

export default async function ClientsPage() {
  const clients = await getClients()
  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Clients</h1>
        <div className="bg-white rounded-2xl shadow p-4">
          <ClientsAdmin initialClients={clients} />
        </div>
      </div>
    </main>
  )
}
