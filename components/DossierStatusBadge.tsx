const statusStyles: Record<string, string> = {
  EN_COURS: 'bg-blue-50 text-blue-700 border-blue-200',
  DOCUMENTS_MANQUANTS: 'bg-red-50 text-red-700 border-red-200',
  CHEZ_COMMUNE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CHEZ_CONSERVATION: 'bg-purple-50 text-purple-700 border-purple-200',
  VALIDATION_BANCAIRE: 'bg-orange-50 text-orange-700 border-orange-200',
  EN_ATTENTE_SIGNATURE: 'bg-green-50 text-green-700 border-green-200',
  TERMINE: 'bg-gray-50 text-gray-700 border-gray-200',
}

const statusLabels: Record<string, string> = {
  EN_COURS: 'En cours',
  DOCUMENTS_MANQUANTS: 'Documents manquants',
  CHEZ_COMMUNE: 'Chez commune',
  CHEZ_CONSERVATION: 'Chez conservation',
  VALIDATION_BANCAIRE: 'Validation bancaire',
  EN_ATTENTE_SIGNATURE: 'En attente signature',
  TERMINE: 'Terminé',
}

export default function DossierStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status] || 'bg-gray-50 text-gray-700'}`}>
      {statusLabels[status] || status}
    </span>
  )
}