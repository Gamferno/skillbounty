'use client'

import Link from 'next/link'
import { Bounty, BountyStatus } from '@/types/bounty'
import { stroopsToXlm, truncateAddress } from '@/lib/constants'
import { StatusBadge } from './StatusBadge'
import { CountdownTimer } from './CountdownTimer'
import { useXlmPrice } from '@/hooks/useXlmPrice'
import { CopyButton } from './CopyButton'
import { usePosterReputation } from '@/hooks/usePosterReputation'
import { MapPin, Target, Check, User, Crosshair, Star, Shield, Trophy, LucideIcon } from 'lucide-react'

const TIER_ICONS: Record<string, LucideIcon> = {
  user:      User,
  crosshair: Crosshair,
  star:      Star,
  shield:    Shield,
  trophy:    Trophy,
}

const TIER_COLORS: Record<string, string> = {
  newcomer:   'border-wood-700/40 text-ink/50 bg-wood-800/10',
  apprentice: 'border-ink/30 text-ink/70 bg-wood-800/5',
  deputy:     'border-frontier/50 text-frontier bg-frontier/10',
  sheriff:    'border-wanted/50 text-wanted bg-wanted/10',
  legend:     'border-yellow-500/60 text-yellow-400 bg-yellow-500/10',
}

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const isSubmitted = bounty.status === BountyStatus.Submitted
  const isDisputed = bounty.status === BountyStatus.Disputed
  const xlmPrice = useXlmPrice()
  const posterRep = usePosterReputation(bounty.poster)

  // Pseudo-random rotation for a messy bulletin board feel (-2deg to +2deg)
  const rotationClass = Number(bounty.id) % 2 === 0 ? 'rotate-1' : '-rotate-1'

  return (
    <Link
      href={`/bounty/${bounty.id}`}
      className={`block group ${rotationClass} parchment p-6 transition-all duration-300 hover:scale-[1.02] hover:z-10 focus:z-10 overflow-hidden`}
    >
      {/* The Pin (Nail) */}
      <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rounded-full bg-wood-900 border-2 border-wood-700 shadow-sm z-10">
        <div className="absolute inset-m-0.5 rounded-full bg-black/20" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 mt-2">
        <h3 className="font-rye text-ink text-xl leading-snug group-hover:text-blood transition-colors line-clamp-2">
          {bounty.title}
        </h3>
        <StatusBadge status={bounty.status} />
      </div>

      {/* Description */}
      <p className="font-special text-sm text-ink-light line-clamp-3 mb-4 leading-relaxed">
        {bounty.description}
      </p>

      {/* Tags */}
      {bounty.tags && bounty.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bounty.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[0.65rem] font-rye tracking-widest uppercase border border-ink/30 text-ink/70 rounded bg-wood-800/5 shadow-sm opacity-80"
              style={{ transform: `rotate(${Math.random() > 0.5 ? 1 : -1}deg)` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Reward row */}
      <div className="mt-auto pt-4 border-t border-ink/10">
        <span className="text-xs font-rye text-ink/60 uppercase tracking-widest block mb-1">Reward</span>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-3xl font-rye text-blood tracking-tight">
            {stroopsToXlm(bounty.reward)}
          </span>
          <span className="text-sm font-rye text-ink">XLM</span>
          {xlmPrice && (
            <span className="text-[0.65rem] font-special text-ink/70 ml-1">
              (≈ ${(parseFloat(stroopsToXlm(bounty.reward)) * xlmPrice).toFixed(2)})
            </span>
          )}
        </div>
      </div>

      {/* Poster / Hunter + rep badge — full-width row */}
      <div className="mt-3 pt-3 border-t border-ink/10 flex items-start justify-between gap-2">
        {/* Left: poster address + reputation badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-xs text-ink/70 truncate min-w-0 font-special flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0 text-ink/50" />
              <span className="text-ink font-bold">{truncateAddress(bounty.poster)}</span>
            </p>
            <CopyButton value={bounty.poster} />
          </div>
          {posterRep && (() => {
            const TierIcon = TIER_ICONS[posterRep.icon]
            return (
              <span
                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[0.6rem] font-rye tracking-wider whitespace-nowrap ${TIER_COLORS[posterRep.tier]}`}
              >
                <TierIcon className="w-3 h-3" />
                {posterRep.label}
                {posterRep.completions > 0 && (
                  <span className="opacity-70 ml-0.5 inline-flex items-center gap-0.5">· {posterRep.completions}<Check className="w-2.5 h-2.5" /></span>
                )}
              </span>
            )
          })()}
        </div>

        {/* Right: hunter address (if any) */}
        {bounty.hunter && (
          <div className="text-right shrink-0 max-w-[45%] min-w-0">
            <div className="flex items-center justify-end gap-1 min-w-0">
              <p className="text-xs text-ink/70 truncate min-w-0 font-special flex items-center gap-1">
                <Target className="w-3 h-3 shrink-0 text-ink/50" />
                <span className="text-ink font-bold">{truncateAddress(bounty.hunter)}</span>
              </p>
              <CopyButton value={bounty.hunter} />
            </div>
          </div>
        )}
      </div>

      {/* Countdown if submitted */}
      {(isSubmitted || isDisputed) && bounty.submitted_at && (
        <div className="mt-4 pt-4 border-t border-ink/10">
          <div className="bg-wood-800/5 p-3 rounded border border-wood-800/10">
            <CountdownTimer
              submittedAt={bounty.submitted_at}
              deadlineHours={bounty.deadline_hours}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
