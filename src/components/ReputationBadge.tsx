'use client'

import { Star } from 'lucide-react'

interface ReputationBadgeProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
}

export function ReputationBadge({ count, size = 'md' }: ReputationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  const label =
    count === 0
      ? 'New hunter'
      : count < 5
      ? 'Rising'
      : count < 20
      ? 'Trusted'
      : 'Elite'

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 font-medium ${sizeClasses[size]}`}>
      <Star className={`${iconSize[size]} fill-current`} />
      <span>{count} {count === 1 ? 'bounty' : 'bounties'} completed</span>
      <span className="opacity-60 text-xs">· {label}</span>
    </div>
  )
}
