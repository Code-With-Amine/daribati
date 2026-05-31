"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight, Menu, X, FileText, Brain, Eye, Wallet, Shield, CheckCircle, Sparkles, ChevronRight, Scale, Sun, Moon } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NotaireFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Plateforme numérique complète pour la gestion d'étude notariale : dossiers, contrats, paiements et communication client.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "MAD" },
    author: { "@type": "Organization", name: "NotaireFlow" },
  }

  const isDark = !mounted ? true : theme === 'dark'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === "OWNER") router.push("/admin")
        else if (user.role === "NOTAIRE") router.push("/notaire/dashboard")
        else if (user.role === "CLIENT") router.push("/client")
      } catch {}
    }
  }, [router])

  const d = isDark
  const bg = d ? "bg-[oklch(0.14_0.015_260)]" : "bg-white"
  const bg2 = d ? "bg-[oklch(0.18_0.02_260)]" : "bg-slate-50"
  const bg3 = d ? "bg-[oklch(0.18_0.025_260)]" : "bg-white"
  const text = d ? "text-white" : "text-slate-900"
  const text2 = d ? "text-indigo-200/60" : "text-slate-500"
  const text3 = d ? "text-indigo-200/80" : "text-slate-700"
  const text4 = d ? "text-indigo-200/70" : "text-slate-600"
  const text5 = d ? "text-indigo-300/70" : "text-slate-500/80"
  const text6 = d ? "text-indigo-200/80" : "text-slate-700/80"
  const textMuted = d ? "text-indigo-400/60" : "text-slate-400"
  const textMuted2 = d ? "text-indigo-400/40" : "text-slate-400/70"
  const border = d ? "border-indigo-800/30" : "border-slate-200"
  const border2 = d ? "border-indigo-800/20" : "border-slate-200"
  const border3 = d ? "border-indigo-500/20" : "border-slate-200"
  const navBg = d ? "bg-[oklch(0.14_0.015_260)/95]" : "bg-white/95"
  const navBorder = d ? "border-indigo-800/30" : "border-slate-200"
  const cardBorder = d ? "border-indigo-800/40" : "border-slate-200"
  const hoverBg = d ? "hover:bg-indigo-800/30" : "hover:bg-slate-100"
  const gradientFrom = d ? "from-indigo-900/20" : "from-indigo-100/50"
  const glow = d ? "bg-indigo-600/10" : "bg-indigo-400/10"
  const gradientText = "bg-gradient-to-r from-indigo-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent"
  const gradientTextLight = "bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent"
  const iconBg = d ? "bg-indigo-600/15" : "bg-indigo-100"
  const iconBgHover = d ? "group-hover:bg-indigo-600/25" : "group-hover:bg-indigo-200"
  const iconColor = d ? "text-indigo-400" : "text-indigo-600"
  const cardBg = d ? "bg-[oklch(0.18_0.02_260)]" : "bg-white"
  const cardHover = d ? "hover:border-indigo-600/50 hover:shadow-indigo-600/10" : "hover:border-indigo-300 hover:shadow-indigo-200/50"
  const badgeBg = d ? "bg-indigo-500/10" : "bg-indigo-50"
  const badgeBorder = d ? "border-indigo-500/40" : "border-indigo-200"
  const badgeText = d ? "text-indigo-300" : "text-indigo-700"
  const gradient = d ? "from-indigo-600/20 via-transparent to-amber-500/20" : "from-indigo-200/40 via-transparent to-amber-200/40"
  const ctaGradient = d ? "from-indigo-600/10 via-amber-500/5 to-indigo-600/10" : "from-indigo-100 via-amber-50 to-indigo-100"
  const footerText = d ? "text-indigo-300/50" : "text-slate-400"
  const footerTitle = d ? "text-indigo-200/80" : "text-slate-600"
  const footerLink = d ? "text-indigo-400/60 hover:text-indigo-300" : "text-slate-400 hover:text-slate-600"
  const quote = d ? "text-indigo-600/20" : "text-indigo-200"
  const avatarBorder = d ? "border-indigo-700/50" : "border-slate-200"
  const avatarBg = d ? "bg-indigo-600/20 text-indigo-300" : "bg-slate-100 text-slate-500"
  const aiBorder = d ? "border-indigo-500/20" : "border-slate-200"
  const aiBg = d ? "bg-[oklch(0.18_0.02_260)]" : "bg-white"
  const aiText = d ? "text-indigo-200/80" : "text-slate-600"
  const aiAccent = d ? "text-indigo-400" : "text-indigo-500"
  const gradientBadge = d ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700"
  const amberBadge = d ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : "border-amber-300 text-amber-700 bg-amber-50"
  const emerald = d ? "text-emerald-400" : "text-emerald-600"
  const logoGradient = d ? "from-indigo-500 to-indigo-700" : "from-indigo-600 to-indigo-800"

  const features = [
    { icon: FileText, title: "Gestion des Dossiers Digitaux", desc: "Centralisez toutes les pièces (CIN, contrats, reçus) dans un espace sécurisé. Recherchez n'importe quel document en une seconde grâce à l'indexation intelligente." },
    { icon: Brain, title: "IA : Génération de Contrats", desc: "Notre assistant IA apprend de vos modèles pour générer des brouillons d'actes en quelques secondes, réduisant les erreurs de saisie manuelle." },
    { icon: Eye, title: "Transparence Totale Client", desc: "Suivi en temps réel pour vos clients. Ils savent exactement si leur dossier est à la commune, à la conservation foncière ou en cours de signature." },
    { icon: Wallet, title: "Paiements & Reçus Automatiques", desc: "Suivez les honoraires, frais de timbre et avances. Générez des reçus PDF professionnels instantanément dès confirmation du paiement." },
  ]

  const testimonials = [
    { name: "Me. Karim Benjelloun", role: "Notaire à Casablanca", content: "NotaireFlow a révolutionné la gestion de mon étude. Mes clients sont ravis de pouvoir suivre l'avancement de leurs dossiers en temps réel. Un gain de temps considérable au quotidien.", initials: "KB" },
    { name: "Fatima Zahra El Ouazzani", role: "Acquéreuse à Rabat", content: "Grâce à NotaireFlow, j'ai pu suivre chaque étape de l'achat de mon appartement sans avoir à me déplacer. La transparence est exceptionnelle, je recommande vivement.", initials: "FE" },
    { name: "Driss Amrani", role: "Promoteur immobilier à Marrakech", content: "Nous gérons plus de 200 dossiers par an et NotaireFlow nous fait gagner un temps précieux. La génération de contrats par IA est tout simplement bluffante.", initials: "DA" },
    { name: "Nadia Bennis", role: "Responsable d'étude notariale à Fès", content: "L'outil le plus complet que j'ai utilisé. La gestion des paiements et des reçus automatiques nous a fait économiser des heures de travail administratif.", initials: "NB" },
  ]

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Témoignages", href: "#testimonials" },
    { label: "Tarifs", href: "#pricing" },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={`min-h-screen ${bg} ${text} overflow-x-hidden transition-colors duration-300`}>
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `${navBg} backdrop-blur-lg border-b ${navBorder}` : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className={`w-9 h-9 bg-gradient-to-br ${logoGradient} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25`}>
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-xl ${text}`}>NotaireFlow</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className={`text-sm ${text6} hover:${isDark ? "text-white" : "text-slate-900"} transition-colors`}>
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2 rounded-lg ${hoverBg} transition-colors`}>
                {isDark ? <Sun className="h-5 w-5 text-indigo-300" /> : <Moon className="h-5 w-5 text-slate-500" />}
              </button>
              <Link href="/login">
                <Button variant="ghost" className={`${isDark ? "text-indigo-200/80 hover:text-white hover:bg-indigo-800/40" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>
                  Connexion
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25">
                  Rejoindre la Beta
                </Button>
              </Link>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2 rounded-lg ${hoverBg} transition-colors`}>
                {isDark ? <Sun className="h-5 w-5 text-indigo-300" /> : <Moon className="h-5 w-5 text-slate-500" />}
              </button>
              <button className={`p-2 ${text}`} onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className={`md:hidden border-t ${border} ${bg}`}>
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className={`block text-sm ${text2} hover:${isDark ? "text-white" : "text-slate-900"} py-2`} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </a>
              ))}
              <div className="pt-3 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className={`w-full ${isDark ? "text-indigo-200/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>Connexion</Button>
                </Link>
                <Link href="/login" className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Rejoindre la Beta</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4">
        <div className={`absolute inset-0 bg-gradient-to-b ${gradientFrom} via-transparent to-transparent pointer-events-none`} />
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] ${glow} rounded-full blur-[120px] pointer-events-none`} />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className={`${badgeBorder} ${badgeText} ${badgeBg} px-4 py-1.5 text-xs font-medium tracking-wide`}>
                <Sparkles className={`h-3.5 w-3.5 mr-1.5 ${iconColor}`} />
                BETA ACCÈS OUVERT
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Digitalisez votre étude notariale avec{" "}
                <span className={isDark ? gradientText : gradientTextLight}>NotaireFlow</span>
              </h1>

              <p className={`text-lg ${text2} max-w-xl leading-relaxed`}>
                Centralisez vos dossiers, automatisez vos contrats par l&apos;IA et offrez une transparence totale à vos clients. La solution moderne pour les notaires du Maroc.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/login">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 text-base px-8">
                    Rejoindre la Beta Gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className={`${isDark ? "border-indigo-500/30 text-indigo-200 hover:bg-indigo-800/30" : "border-slate-300 text-slate-600 hover:bg-slate-100"} text-base px-8`}>
                    Découvrir les fonctionnalités
                  </Button>
                </a>
              </div>

              <div className={`flex flex-wrap items-center gap-6 pt-4 text-sm ${text5}`}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className={`h-4 w-4 ${emerald}`} />
                  Conforme RGPD
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className={`h-4 w-4 ${emerald}`} />
                  Sécurisé & Chiffré
                </span>
              </div>
            </div>

            <div className="relative">
              <div className={`absolute -inset-4 bg-gradient-to-tr ${gradient} rounded-2xl blur-2xl`} />
              <div className={`relative rounded-2xl border ${border3} ${bg3} overflow-hidden shadow-2xl`}>
                <div className={`flex items-center gap-1.5 px-4 py-3 border-b ${border}`}>
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className={`ml-2 text-xs ${textMuted}`}>NotaireFlow Dashboard</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-3 w-32 rounded ${isDark ? "bg-indigo-700/30" : "bg-slate-200"}`} />
                    <div className={`h-3 w-20 rounded ${isDark ? "bg-indigo-600/20" : "bg-slate-100"}`} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`h-20 rounded-lg ${isDark ? "bg-indigo-700/20" : "bg-slate-100"}`} />
                    <div className={`h-20 rounded-lg ${isDark ? "bg-indigo-700/20" : "bg-slate-100"}`} />
                    <div className={`h-20 rounded-lg ${isDark ? "bg-indigo-700/20" : "bg-slate-100"}`} />
                  </div>
                  <div className={`h-24 rounded-lg ${isDark ? "bg-indigo-700/15" : "bg-slate-50"}`} />
                  <div className={`flex items-center justify-center gap-1 text-xs ${textMuted2}`}>
                    <span className={`w-2 h-2 rounded-full ${isDark ? "bg-emerald-400/60" : "bg-emerald-500/60"}`} />
                    Interface de gestion intuitive
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className={`py-16 sm:py-20 px-4 border-t ${border2}`}>
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className={`${gradientBadge} px-4 py-1.5 mb-6`}>
            <Sparkles className={`h-3.5 w-3.5 mr-1.5 ${iconColor}`} />
            IA Générative
          </Badge>
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? "from-indigo-600/5 via-transparent to-indigo-600/5" : "from-indigo-100/50 via-transparent to-indigo-100/50"} rounded-2xl`} />
            <div className={`relative rounded-xl border ${aiBorder} ${aiBg} px-6 py-5 sm:py-6 inline-block shadow-xl`}>
              <p className={`text-base sm:text-lg ${aiText} font-mono`}>
                <span className={aiAccent}>&ldquo;</span>Générez un acte de vente définitif pour le dossier n°452...<span className={aiAccent}>&rdquo;</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${text}`}>L&apos;excellence opérationnelle pour votre étude</h2>
            <p className={`${text2} max-w-2xl mx-auto`}>
              Tous les outils dont vous avez besoin pour gérer votre étude notariale au Maroc, réunis en une seule plateforme.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`group relative rounded-xl border ${cardBorder} ${cardBg} p-6 sm:p-8 transition-all duration-300 ${cardHover}`}>
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${isDark ? "from-indigo-600/5 to-transparent" : "from-indigo-50 to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5 ${iconBgHover} transition-colors`}>
                    <f.icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${text}`}>{f.title}</h3>
                  <p className={`text-sm ${text4} leading-relaxed`}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className={`py-16 sm:py-24 px-4 border-y ${border2}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${text}`}>Ce que disent nos utilisateurs</h2>
            <p className={`${text2} max-w-2xl mx-auto`}>
              Des notaires et clients témoignent de leur expérience avec NotaireFlow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className={`relative rounded-xl border ${border} ${cardBg} p-6 sm:p-8`}>
                <div className={`absolute top-0 right-0 text-5xl ${quote} leading-none p-6 font-serif`}>&ldquo;</div>
                <p className={`text-sm ${text4} leading-relaxed mb-6 relative z-10`}>{t.content}</p>
                <div className="flex items-center gap-3">
                  <Avatar className={`h-10 w-10 border ${avatarBorder}`}>
                    <AvatarFallback className={`${avatarBg} text-xs font-medium`}>{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`text-sm font-semibold ${text}`}>{t.name}</p>
                    <p className={`text-xs ${textMuted}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beta CTA */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${ctaGradient} rounded-3xl blur-3xl pointer-events-none`} />
          <div className="relative space-y-6">
            <Badge variant="outline" className={`${amberBadge} px-4 py-1.5`}>
              OFFRE LIMITÉE
            </Badge>
            <h2 className={`text-3xl sm:text-4xl font-bold ${text}`}>Accès Beta Exclusif</h2>
            <p className={`${text2} max-w-xl mx-auto`}>
              Pendant notre phase beta, profitez d&apos;un accès complet à toutes nos fonctionnalités professionnelles gratuitement. Transformez votre étude dès aujourd&apos;hui sans frais.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 text-base px-10 py-6">
                  Commencer maintenant
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className={`text-xs ${textMuted2} mt-4 tracking-wide`}>AUCUNE CARTE BANCAIRE REQUISE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${border2} px-4 py-12 sm:py-16`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 bg-gradient-to-br ${logoGradient} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25`}>
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className={`font-bold text-lg ${text}`}>NotaireFlow</span>
              </Link>
              <p className={`text-sm ${footerText} leading-relaxed max-w-xs`}>
                Digitalisez et sécurisez l&apos;avenir de votre étude notariale avec nos solutions d&apos;IA de pointe.
              </p>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${footerTitle} mb-4 uppercase tracking-wider`}>Produit</h4>
              <ul className="space-y-3">
                {["Fonctionnalités", "Sécurité", "IA Assistant"].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm ${footerLink} transition-colors`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${footerTitle} mb-4 uppercase tracking-wider`}>Ressources</h4>
              <ul className="space-y-3">
                {["Support", "Blog Légal", "Guide Notaire"].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm ${footerLink} transition-colors`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${footerTitle} mb-4 uppercase tracking-wider`}>Légal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm ${footerLink} transition-colors`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t ${border2} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <p className={`text-xs ${textMuted2}`}>&copy; {new Date().getFullYear()} NotaireFlow. Tous droits réservés.</p>
            <div className={`flex items-center gap-2 text-xs ${textMuted2}`}>
              <span>Français (Maroc)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
