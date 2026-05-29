import { TerranExo } from "@/components/TerranExo-form"
import { Calculator } from "lucide-react"

export default function NotaireTerrainExoPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6" /> Calculateur TNB — Terrain Exonéré
        </h1>
        <p className="text-sm text-muted-foreground">
          Renseignez les informations requises pour calculer la taxe
        </p>
      </div>
      <TerranExo />
    </div>
  )
}
