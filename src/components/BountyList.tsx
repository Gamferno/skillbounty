'use client'

import { useState } from 'react'
import { Bounty, BountyStatus } from '@/types/bounty'
import { BountyCard } from './BountyCard'

const FILTERS: { label: string; value: BountyStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Open', value: BountyStatus.Open },
  { label: 'In Progress', value: BountyStatus.InProgress },
  { label: 'Submitted', value: BountyStatus.Submitted },
  { label: 'Completed', value: BountyStatus.Completed },
  { label: 'Disputed', value: BountyStatus.Disputed },
]

interface BountyListProps {
  bounties: Bounty[]
  loading?: boolean
}

export function BountyList({ bounties, loading }: BountyListProps) {
  const [activeFilter, setActiveFilter] = useState<BountyStatus | 'All'>('All')

  const filtered =
    activeFilter === 'All'
      ? bounties
      : bounties.filter((b) => b.status === activeFilter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === 'All'
              ? bounties.length
              : bounties.filter((b) => b.status === value).length

          return (
            <button
              key={value}
              id={`filter-${value.toString().toLowerCase()}`}
              onClick={() => setActiveFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === value
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                  : 'bg-surface-800 text-slate-400 border border-white/10 hover:border-brand-500/30 hover:text-slate-200'
              }`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === value ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-surface-800/40 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">📋</span>
          <p className="text-lg font-medium text-slate-300">No bounties found</p>
          <p className="text-sm text-slate-500 mt-1">
            {activeFilter === 'All'
              ? 'Be the first to post a bounty!'
              : `No bounties with status "${activeFilter}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BountyCard key={b.id.toString()} bounty={b} />
          ))}
        </div>
      )}
    </div>
  )
}
