"use client"

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import DossierStatusStepper from './DossierStatusStepper'

export default function DossierStatusStepperWrapper({ dossierId, currentStatus }: { dossierId: string; currentStatus: string }) {
  const router = useRouter()

  async function handleStatusChange(status: string) {
    try {
      const token = localStorage.getItem('token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`/api/dossiers/${dossierId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Erreur lors du changement de statut')
      toast.success('Statut mis à jour')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return <DossierStatusStepper currentStatus={currentStatus} onStatusChange={handleStatusChange} />
}
