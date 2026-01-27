"use client"

import { useState } from "react"
import type React from "react"
import { MultiSelect, type Option } from "./multi-select"
import { cn } from "@/lib/utils"
import {tndYearsOptions} from "@/lib/years";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { calculateAmountForYear } from "@/lib/tnb-utils" // utility function we'll define below

export function TerranExo({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [superficie, setSuperficie] = useState("")
  const [etage, setEtage] = useState<string | null>(null)
  const [zone, setZone] = useState<string | null>(null)
  const [selectedTndYears, setSelectedTndYears] = useState<string[]>([])
  const [totalYears, setTotalYears] = useState<number>(0)
  const [results, setResults] = useState<{ year: string; total: number }[]>([])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const superficieValue = parseFloat(superficie)
    setTotalYears(0)
    if (isNaN(superficieValue) || superficieValue <= 0) return

    const computed = selectedTndYears.map((year) => {
      const y = parseInt(year)
      const tarif = (y >= 2026 && zone === "A") ? (etage == "villa" ? 15 : 20) : (etage == "villa" ? 6 : 10)
      const principal = superficieValue * tarif
      const total = Math.max(principal * 0.15, 500)
      return { year, total }
    })
    const total = computed.reduce((sum, item) => sum + item.total, 0)
    setTotalYears(total)
    setResults(computed)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Terrain Exonérés</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="superficie">Taille du terrain en m²</Label>
                <Input
                  id="superficie"
                  type="number"
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value)}
                  placeholder="ex: 92"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zone">Zone</Label>
                <Select onValueChange={setZone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Zone</SelectLabel>
                      <SelectItem value="A">Zone A</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="etage">Nombre d'étages</Label>
                <Select onValueChange={setEtage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Type de terrain</SelectLabel>
                      <SelectItem value="villa">R ≤ 3 (Zone villa ou maison)</SelectItem>
                      <SelectItem value="immeuble">R ≥ 3 (Zone immeuble)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Années non payées</Label>
                <MultiSelect
                  options={tndYearsOptions()}
                  selected={selectedTndYears}
                  onChange={setSelectedTndYears}
                  placeholder="Sélectionnez les années"
                />
              </div>

              <Button type="submit" className="w-full">
                Calculer
              </Button>

              {results.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-center mb-2">Résultats</h3>
                  <ul className="space-y-1 text-sm">
                    {results.map((r) => (
                      <li key={r.year}>
                        <strong>{r.year}:</strong> {r.total.toFixed(2)} DH
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            {totalYears > 0 &&  <p className="space-y-1 text-sm"><strong>Total: </strong>{totalYears.toFixed(2)}</p>}

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
