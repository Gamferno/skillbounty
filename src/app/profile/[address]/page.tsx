'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchReputation, fetchBountiesByPoster, fetchBountiesByHunter } from '@/lib/contract'
import { Bounty, BountyStatus } from '@/types/bounty'
import { truncateAddress, stroopsToXlm } from '@/lib/constants'
import { ReputationBadge } from '@/components/ReputationBadge'
import { StatusBadge } from '@/components/StatusBadge'

export default function ProfilePage() {
  const params = useParams()
  const wallet = params.address as string

  const [reputation, setReputation] = useState(0)
  const [posted, setPosted] = useState<Bounty[]>([])
  const [hunted, setHunted] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchReputation(wallet),
      fetchBountiesByPoster(wallet),
      fetchBountiesByHunter(wallet),
    ]).then(([rep, p, h]) => {
      setReputation(rep)
      setPosted(p)
      setHunted(h)
    }).finally(() => setLoading(false))
  }, [wallet])

  const totalEarned = hunted
    .filter((b) => b.status === BountyStatus.Completed)
    .reduce((sum, b) => sum + Number(b.reward), 0)

  const totalPaidOut = posted
    .filter((b) => b.status === BountyStatus.Completed)
    .reduce((sum, b) => sum + Number(b.reward), 0)

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-32 bg-surface-800 rounded-2xl" />
        <div className="h-64 bg-surface-800 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile header */}
      <div className="rounded-2xl bg-surface-800/60 border border-white/10 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Wallet Profile</h1>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                {truncateAddress(wallet, 12)}
              </code>
              <button
                id="copy-profile-address"
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>
          <ReputationBadge count={reputation} size="sm" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Bounties Posted</p>
            <p className="text-2xl font-bold text-white mt-1">{posted.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Bounties Completed</p>
            <p className="text-2xl font-bold text-white mt-1">{reputation}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">XLM Earned</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {(totalEarned / 10_000_000).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">XLM Paid Out</p>
            <p className="text-2xl font-bold text-brand-400 mt-1">
              {(totalPaidOut / 10_000_000).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Bounties posted */}
      {posted.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Bounties Posted</h2>
          <div className="space-y-3">
            {posted.map((b) => (
              <Link
                key={b.id.toString()}
                href={`/bounty/${b.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface-800/60 border border-white/10 hover:border-brand-500/30 px-4 py-3 transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-white">{b.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">#{b.id.toString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-white">{stroopsToXlm(b.reward)} XLM</span>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bounties hunted */}
      {hunted.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Bounties Hunted</h2>
          <div className="space-y-3">
            {hunted.map((b) => (
              <Link
                key={b.id.toString()}
                href={`/bounty/${b.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface-800/60 border border-white/10 hover:border-brand-500/30 px-4 py-3 transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-white">{b.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">#{b.id.toString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-emerald-400">{stroopsToXlm(b.reward)} XLM</span>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posted.length === 0 && hunted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">👤</span>
          <p className="text-slate-400">No bounty history for this wallet yet.</p>
        </div>
      )}
    </div>
  )
}
