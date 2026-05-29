"use client"

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { key: 'EN_COURS', label: 'En cours' },
  { key: 'DOCUMENTS_MANQUANTS', label: 'Documents\nmanquants' },
  { key: 'CHEZ_COMMUNE', label: 'Chez\ncommune' },
  { key: 'CHEZ_CONSERVATION', label: 'Chez\nconservation' },
  { key: 'VALIDATION_BANCAIRE', label: 'Validation\nbancaire' },
  { key: 'EN_ATTENTE_SIGNATURE', label: 'En attente\nsignature' },
  { key: 'TERMINE', label: 'Terminé' },
]

function getStepIndex(status: string) {
  return steps.findIndex((s) => s.key === status)
}

export default function DossierStatusStepper({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: string
  onStatusChange: (status: string) => void
}) {
  const currentIdx = getStepIndex(currentStatus)

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center gap-0 min-w-[700px]">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isClickable = idx !== currentIdx

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStatusChange(step.key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 group",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all shrink-0",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50 bg-muted/50",
                    isClickable && !isCurrent && "hover:border-primary hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-tight text-center whitespace-pre-line max-w-[70px]",
                    isCompleted && "text-primary font-medium",
                    isCurrent && "text-foreground font-semibold",
                    !isCompleted && !isCurrent && "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mt-[-1.25rem] transition-colors",
                    idx < currentIdx ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
