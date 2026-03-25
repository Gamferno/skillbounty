'use client'

import { BountyStatus } from '@/types/bounty'
import { Star, Lasso, CheckCircle2, Crosshair, XCircle, RotateCcw } from 'lucide-react'

// Map status to a specific icon
const STATUS_ICONS: Record<BountyStatus, React.ElementType> = {
  [BountyStatus.Open]: Star,
  [BountyStatus.InProgress]: Lasso,
  [BountyStatus.Submitted]: CheckCircle2,
  [BountyStatus.Completed]: Star, // Completed gets a solid star maybe, but we'll use Star for now.
  [BountyStatus.Disputed]: Crosshair,
  [BountyStatus.Refunded]: RotateCcw,
}

const STATUS_STYLES: Record<BountyStatus, string> = {
  [BountyStatus.Open]: 'bg-wanted/20 text-ink-light border border-wanted/50',
  [BountyStatus.InProgress]: 'bg-ink/10 text-ink border border-ink/30',
  [BountyStatus.Submitted]: 'bg-frontier/10 text-frontier border border-frontier/30',
  [BountyStatus.Completed]: 'bg-frontier/20 text-frontier border border-frontier/50',
  [BountyStatus.Disputed]: 'bg-blood/10 text-blood border border-blood/30',
  [BountyStatus.Refunded]: 'bg-wood-800/10 text-wood-900 border border-wood-800/30',
}

const STATUS_LABELS: Record<BountyStatus, string> = {
  [BountyStatus.Open]: 'WANTED',
  [BountyStatus.InProgress]: 'IN PURSUIT',
  [BountyStatus.Submitted]: 'CAPTURED',
  [BountyStatus.Completed]: 'REWARD PAID',
  [BountyStatus.Disputed]: 'DISPUTED',
  [BountyStatus.Refunded]: 'REFUNDED',
}

export function StatusBadge({ status }: { status: BountyStatus }) {
  const Icon = STATUS_ICONS[status]
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-rye tracking-wider text-xs shadow-sm ${STATUS_STYLES[status]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {STATUS_LABELS[status]}
    </span>
  )
}
