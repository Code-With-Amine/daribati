"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setIsLoggedIn(true)
        setRole(user.role)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn && role === "NOTAIRE") {
      router.push("/notaire/dashboard")
    } else if (isLoggedIn && role === "CLIENT") {
      router.push("/client")
    }
  }, [isLoggedIn, role, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#262EE3] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NF</span>
          </div>
          <span className="font-bold text-xl text-slate-800">NotaireFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="border-[#262EE3] text-[#262EE3] hover:bg-[#262EE3] hover:text-white">
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-[#262EE3] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">NF</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">
            NotaireFlow
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Plateforme numérique de gestion de dossiers notariaux.
            Gérez vos clients, dossiers, documents et paiements en toute simplicité.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Dossiers numériques</h3>
                <p className="text-sm text-slate-500 mt-1">Centralisez tous vos dossiers en un endroit</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Suivi en temps réel</h3>
                <p className="text-sm text-slate-500 mt-1">Clients informés à chaque étape</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Gain de temps</h3>
                <p className="text-sm text-slate-500 mt-1">Plus de papier, plus de fichiers éparpillés</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button className="bg-[#262EE3] hover:bg-[#150AA3] text-white px-8 py-6 text-lg">
                Accéder à votre espace
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-sm text-slate-400 border-t bg-white/50">
        &copy; {new Date().getFullYear()} NotaireFlow. Tous droits réservés.
      </footer>
    </div>
  )
}