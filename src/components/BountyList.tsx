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

const AVAILABLE_TAGS = ['Design', 'Frontend', 'Backend', 'Writing', 'Research', 'Video', 'Marketing', 'Other']

interface BountyListProps {
  bounties: Bounty[]
  loading?: boolean
}

export function BountyList({ bounties, loading }: BountyListProps) {
  const [activeFilter, setActiveFilter] = useState<BountyStatus | 'All'>('All')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = bounties
    .filter((b) => {
      if (activeFilter !== 'All' && b.status !== activeFilter) return false
      if (activeTag && !(b.tags || []).includes(activeTag)) return false
      return true
    })
    .sort((a, b) => {
      const getUrgency = (bounty: Bounty) => {
        if (!bounty.submitted_at) return Infinity
        const deadlineSecs = Number(bounty.deadline_hours) * 3600
        const expiresAt = Number(bounty.submitted_at) + deadlineSecs
        const now = Math.floor(Date.now() / 1000)
        return expiresAt - now
      }

      if (a.status === BountyStatus.Submitted && b.status !== BountyStatus.Submitted) return -1
      if (b.status === BountyStatus.Submitted && a.status !== BountyStatus.Submitted) return 1

      if (a.status === BountyStatus.Submitted && b.status === BountyStatus.Submitted) {
        return getUrgency(a) - getUrgency(b)
      }

      return Number(b.id) - Number(a.id)
    })

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-rye tracking-wider whitespace-nowrap transition-all duration-200 uppercase border-2 shadow-sm ${
                  activeFilter === value
                    ? 'bg-wood-900 border-wood-700 text-cream scale-105 rotate-1'
                    : 'bg-wood-800 border-wood-700/50 text-cream/70 hover:border-wood-600'
                }`}
              >
                {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-special ${
                    activeFilter === value ? 'bg-cream/20 text-cream' : 'bg-wood-900/50 text-cream/50'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 rounded text-xs font-rye tracking-widest whitespace-nowrap transition-all duration-200 uppercase border-2 shadow-sm ${
              activeTag === null
                ? 'bg-wanted/20 border-wanted text-wanted scale-105'
                : 'bg-wood-800/10 border-wood-700/30 text-cream/50 hover:bg-wood-800/30'
            }`}
          >
            All Skills
          </button>
          <div className="w-px h-6 bg-wood-700/50 mx-1" />
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded text-xs font-rye tracking-widest whitespace-nowrap transition-all duration-200 uppercase border-2 shadow-sm ${
                activeTag === tag
                  ? 'bg-wanted/20 border-wanted text-wanted scale-105'
                  : 'bg-wood-800/10 border-wood-700/30 text-cream/50 hover:bg-wood-800/30 hover:text-cream/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[350px] parchment rounded opacity-50 border-4 border-transparent border-dashed animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center wood-panel rounded p-8 border-4 border-wood-900 shadow-xl max-w-lg mx-auto">
          <span className="text-6xl mb-6 opacity-80"> tumbleweed </span>
          <h2 className="text-3xl font-rye tracking-widest text-cream mb-2">Town's Quiet</h2>
          <p className="text-base font-special text-cream/70">
            {activeFilter === 'All' && !activeTag
              ? 'No bounties posted yet. Be the first!'
              : 'No bounties match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((b) => (
            <BountyCard key={b.id.toString()} bounty={b} />
          ))}
        </div>
      )}
    </div>
  )
}
