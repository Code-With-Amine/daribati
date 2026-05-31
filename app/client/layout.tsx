import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { Scale, LogOut, MessageSquare, Home, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ModeToggle } from '@/components/ui/toggole-mode'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) redirect('/login')

  try {
    const { payload } = await jwtVerify(session, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'))
    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } })
    if (!user || user.role !== 'CLIENT') redirect('/login')

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white dark:bg-card sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Scale className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">NotaireFlow</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Espace Client</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Home className="w-4 h-4 mr-1" /> Accueil
                </Button>
              </Link>
              <Link href="/client/messages">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageSquare className="w-4 h-4 mr-1" /> Messages
                </Button>
              </Link>
              <Link href="/client/settings">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Settings className="w-4 h-4 mr-1" /> Paramètres
                </Button>
              </Link>
              <ModeToggle />
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-1" /> Déconnexion
                </Button>
              </form>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </div>
    )
  } catch {
    redirect('/login')
  }
}
