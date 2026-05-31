import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Mail, Phone, FolderOpen } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import AddClientDialog from '@/components/AddClientDialog'

async function getNotaireId() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) redirect('/login')

  const { payload } = await jwtVerify(session, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'))
  return payload.sub as string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default async function ClientsPage() {
  const notaireId = await getNotaireId()

  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT', notaireId },
    include: { _count: { select: { dossiers: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <AddClientDialog />
          <Link href="/notaire/dossiers/new">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Nouveau dossier
            </Button>
          </Link>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            Aucun client pour le moment. Créez un dossier pour ajouter un client.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client: any) => (
            <Card key={client.id} className="group hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-muted/30">
                    {client.avatar ? (
                      <AvatarImage src={client.avatar} alt={client.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {getInitials(client.name || '?')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-semibold truncate">{client.name}</h3>
                      {client.cin && <p className="text-xs text-muted-foreground">CIN: {client.cin}</p>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" /> {client._count.dossiers} dossier{client._count.dossiers > 1 ? 's' : ''}
                      </span>
                      <Link
                        href={`/notaire/dossiers?q=${encodeURIComponent(client.name || '')}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Voir dossiers
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
