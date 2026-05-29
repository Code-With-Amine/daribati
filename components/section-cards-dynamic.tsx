"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"

export default function SectionCardsDynamic({
  totalDossiers,
  enCours,
  termines,
  newClients,
  docManquants,
  totalRevenue,
  totalUnpaid,
}: {
  totalDossiers: number
  enCours: number
  termines: number
  newClients: number
  docManquants?: number
  totalRevenue?: number
  totalUnpaid?: number
}) {
  const successPct = totalDossiers > 0 ? Math.round((termines / totalDossiers) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardDescription>Total dossiers</CardDescription>
          <CardTitle className="text-2xl font-semibold">{totalDossiers}</CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          {successPct}% terminés · {enCours} en cours
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>En cours</CardDescription>
          <CardTitle className="text-2xl font-semibold">{enCours}</CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          {docManquants && docManquants > 0 ? `${docManquants} avec documents manquants` : "Tous complets"}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Clients</CardDescription>
          <CardTitle className="text-2xl font-semibold">{newClients}</CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          {totalDossiers > 0 ? `${Math.round((newClients / totalDossiers) * 100)}% avec dossiers` : "Aucun dossier"}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Terminés</CardDescription>
          <CardTitle className="text-2xl font-semibold">{termines}</CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          {successPct}% de tous les dossiers
        </CardFooter>
      </Card>
    </div>
  )
}