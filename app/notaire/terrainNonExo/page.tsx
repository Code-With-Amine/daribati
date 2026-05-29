import { TnbForm } from "@/components/tnb-form"
import { Building } from "lucide-react"

export default function NotaireTerrainNonExoPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building className="w-6 h-6" /> Calculateur TNB — Terrain Non Exonéré
        </h1>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations requises pour calculer la taxe
        </p>
      </div>
      <TnbForm />
    </div>
  )
}
