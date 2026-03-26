'use client'

import Link from 'next/link'
import { Bounty, BountyStatus } from '@/types/bounty'
import { stroopsToXlm, truncateAddress } from '@/lib/constants'
import { StatusBadge } from './StatusBadge'
import { CountdownTimer } from './CountdownTimer'

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const isSubmitted = bounty.status === BountyStatus.Submitted
  const isDisputed = bounty.status === BountyStatus.Disputed
  
  // Pseudo-random rotation for a messy bulletin board feel (-2deg to +2deg)
  const rotationClass = Number(bounty.id) % 2 === 0 ? 'rotate-1' : '-rotate-1'

  return (
    <Link
      href={`/bounty/${bounty.id}`}
      className={`block group ${rotationClass} parchment p-6 transition-all duration-300 hover:scale-[1.02] hover:z-10 focus:z-10`}
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
      <p className="font-special text-sm text-ink-light line-clamp-3 mb-6 leading-relaxed">
        {bounty.description}
      </p>

      {/* Reward & Meta */}
      <div className="flex items-end justify-between mt-auto pt-4 border-t border-ink/10">
        <div>
          <span className="text-xs font-rye text-ink/60 uppercase tracking-widest block mb-1">Reward</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-rye text-blood tracking-tight">
              {stroopsToXlm(bounty.reward)}
            </span>
            <span className="text-sm font-rye text-ink">XLM</span>
          </div>
        </div>

        <div className="text-right font-special space-y-1">
          <p className="text-xs text-ink/70">
            Posted by: <span className="text-ink font-bold">{truncateAddress(bounty.poster)}</span>
          </p>
          {bounty.hunter && (
            <p className="text-xs text-ink/70">
              Hunter: <span className="text-ink font-bold">{truncateAddress(bounty.hunter)}</span>
            </p>
          )}
        </div>
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
