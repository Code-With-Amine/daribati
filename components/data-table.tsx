"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User as UserIcon } from "lucide-react"

// Minimal schema for the table rows
export const schema = z.object({
  id: z.string(),
  dossierId: z.string().optional(),
  ref: z.string(),
  client: z.union([
    z.string(),
    z.object({ name: z.string().optional(), avatar: z.string().optional() }).optional(),
  ]).optional(),
  date: z.string(),
  status: z.string(),
})

type RowData = z.infer<typeof schema>

export function DataTable({ data: initialData }: { data: RowData[] }) {
  const [rows, setRows] = React.useState<RowData[]>(() => initialData)

  // Alert dialog state for delete confirmation
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmId, setConfirmId] = React.useState<string | null>(null)

  // Error dialog state
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  async function handleConfirmDelete(id: string | null) {
    if (!id) return
    try {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: any = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api/dossiers/${id}`, { method: "DELETE", headers })
      if (!res.ok) throw new Error("Delete failed")
      // update local state optimistically
      setRows((r) => r.filter((row) => (row.dossierId ?? row.id) !== id))
      setConfirmOpen(false)
      toast.success("Dossier supprimé")
    } catch (err: any) {
      setConfirmOpen(false)
      setErrorMessage(err?.message ?? "Une erreur est survenue")
      setErrorOpen(true)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Réf</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => {
              const id = row.dossierId ?? row.id
              // normalize client to an object { name?, avatar? }
              const clientObj: { name?: string; avatar?: string } =
                typeof row.client === 'string'
                  ? { name: row.client }
                  : (row.client as any) ?? {}
              return (
                <TableRow key={id}>
                  <TableCell>
                    <Link href={`/notaire/dossiers/${id}`}>{row.ref}</Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {clientObj.avatar ? (
                          <AvatarImage src={clientObj.avatar} alt={clientObj.name} />
                        ) : (
                          <AvatarFallback>
                            <UserIcon className="size-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{clientObj.name ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge>{row.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/notaire/dossiers/${id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => {
                            setConfirmId(id)
                            setConfirmOpen(true)
                          }}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={(o) => setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Voulez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmDelete(confirmId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error dialog */}
      <AlertDialog open={errorOpen} onOpenChange={(o) => setErrorOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage ?? "Une erreur est survenue"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DataTable
