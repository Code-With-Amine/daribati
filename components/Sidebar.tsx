"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { useCallback } from 'react'
import { Home, FileText, Users, Calendar, LogOut, Plus } from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }, [router])

  return (
    <aside className="w-64 min-h-screen bg-slate-50 border-r border-slate-100 p-4 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">NotaryVault</h3>
          <p className="text-sm text-slate-500 mt-2">Maître Jean Dupont<br/><span className="text-xs text-slate-400">Certified Notary</span></p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/notaire/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-white">
            <Home className="w-5 h-5 text-slate-600" /> <span className="text-slate-700">Dashboard</span>
          </Link>
          <Link href="/notaire/dossiers" className="flex items-center gap-3 p-2 rounded-md hover:bg-white">
            <FileText className="w-5 h-5 text-slate-600" /> <span className="text-slate-700">Dossiers</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-white">
            <Users className="w-5 h-5 text-slate-600" /> <span className="text-slate-700">Clients</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-white">
            <Calendar className="w-5 h-5 text-slate-600" /> <span className="text-slate-700">Calendar</span>
          </Link>
        </nav>

        <div className="mt-4">
          <Link href="/notaire/dossiers/new">
            <Button className="w-full bg-[#262EE3] hover:bg-[#150AA3] text-white">
              <Plus className="w-4 h-4" /> New Dossier
            </Button>
          </Link>
        </div>

        <div className="mt-auto space-y-2">
          <button onClick={logout} className="w-full flex items-center gap-2 py-2 px-3 rounded-md hover:bg-white">
            <LogOut className="w-4 h-4 text-slate-600"/> <span className="text-sm text-slate-700">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
