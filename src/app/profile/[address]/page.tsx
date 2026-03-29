'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchReputation, fetchBountiesByPoster, fetchBountiesByHunter, fetchAllBounties } from '@/lib/contract'
import { Bounty, BountyStatus } from '@/types/bounty'
import { truncateAddress, stroopsToXlm, ARBITRATOR_ADDRESS } from '@/lib/constants'
import { ReputationBadge } from '@/components/ReputationBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { ArbitrationPanel } from '@/components/ArbitrationPanel'
import { Check, Clipboard, User, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const params = useParams()
  const wallet = params.address as string

  const [reputation, setReputation] = useState(0)
  const [posted, setPosted] = useState<Bounty[]>([])
  const [hunted, setHunted] = useState<Bounty[]>([])
  const [disputed, setDisputed] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const isArbitrator = wallet && ARBITRATOR_ADDRESS && wallet === ARBITRATOR_ADDRESS

  useEffect(() => {
    const fetches: Promise<unknown>[] = [
      fetchReputation(wallet),
      fetchBountiesByPoster(wallet),
      fetchBountiesByHunter(wallet),
    ]
    if (isArbitrator) {
      fetches.push(fetchAllBounties())
    }

    Promise.all(fetches).then(([rep, p, h, all]) => {
      setReputation(rep as number)
      setPosted(p as Bounty[])
      setHunted(h as Bounty[])
      if (isArbitrator && all) {
        setDisputed((all as Bounty[]).filter((b) => b.status === BountyStatus.Disputed))
      }
    }).finally(() => setLoading(false))
  }, [wallet, isArbitrator])

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

  const reloadDisputed = () => {
    fetchAllBounties().then((all) => {
      setDisputed(all.filter((b) => b.status === BountyStatus.Disputed))
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-32 bg-wood-800 rounded-2xl" />
        <div className="h-64 bg-wood-800 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile header */}
      <div className="rounded-2xl wood-panel border-2 border-wood-700 p-6 relative overflow-hidden">
        {/* Decorative nail */}
        <div className="absolute top-0 left-1/2 -ml-2 -mt-2 w-4 h-4 rounded-full bg-wood-900 border-2 border-wood-700 shadow z-10" />

        {isArbitrator && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-wanted/20 border border-wanted text-wanted text-xs font-rye mb-4 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Sheriff on Duty
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-rye tracking-widest text-cream mb-1">
              {isArbitrator ? "Sheriff's Profile" : 'Frontier Profile'}
            </h1>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-cream/70 bg-wood-900/60 px-2 py-0.5 rounded">
                {truncateAddress(wallet, 12)}
              </code>
              <button
                id="copy-profile-address"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-cream/40 hover:text-wanted transition-colors"
              >
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Clipboard className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
          <ReputationBadge count={reputation} size="sm" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-wood-700">
          <div>
            <p className="text-xs text-cream/50 font-rye uppercase tracking-wide">Posted</p>
            <p className="text-2xl font-rye text-cream mt-1">{posted.length}</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-rye uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-rye text-cream mt-1">{reputation}</p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-rye uppercase tracking-wide">XLM Earned</p>
            <p className="text-2xl font-rye text-frontier mt-1">
              {(totalEarned / 10_000_000).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-cream/50 font-rye uppercase tracking-wide">XLM Paid Out</p>
            <p className="text-2xl font-rye text-wanted mt-1">
              {(totalPaidOut / 10_000_000).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Bounties posted */}
      {posted.length > 0 && (
        <section>
          <h2 className="font-rye text-lg tracking-widest text-cream mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-wanted inline-block" /> Bounties Posted
          </h2>
          <div className="space-y-3">
            {posted.map((b) => (
              <Link
                key={b.id.toString()}
                href={`/bounty/${b.id}`}
                className="flex items-center justify-between gap-3 rounded wood-panel border border-wood-700 hover:border-wanted/40 px-4 py-3 transition-all"
              >
                <div>
                  <p className="text-sm font-rye text-cream">{b.title}</p>
                  <p className="text-xs text-cream/40 mt-0.5 font-special">#{b.id.toString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-rye text-cream">{stroopsToXlm(b.reward)} XLM</span>
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
          <h2 className="font-rye text-lg tracking-widest text-cream mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-frontier inline-block" /> Bounties Hunted
          </h2>
          <div className="space-y-3">
            {hunted.map((b) => (
              <Link
                key={b.id.toString()}
                href={`/bounty/${b.id}`}
                className="flex items-center justify-between gap-3 rounded wood-panel border border-wood-700 hover:border-frontier/40 px-4 py-3 transition-all"
              >
                <div>
                  <p className="text-sm font-rye text-cream">{b.title}</p>
                  <p className="text-xs text-cream/40 mt-0.5 font-special">#{b.id.toString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-rye text-frontier">{stroopsToXlm(b.reward)} XLM</span>
                  <StatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posted.length === 0 && hunted.length === 0 && !isArbitrator && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <User className="w-12 h-12 mb-3 text-cream/30" />
          <p className="text-cream/50 font-special">No bounty history for this wallet yet.</p>
        </div>
      )}

      {/* Sheriff's Docket — only shown for the arbitrator */}
      {isArbitrator && (
        <section>
          {/* Barbed wire divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blood/60 to-transparent" />
            <div className="flex items-center gap-1.5 text-blood font-rye text-xs tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4" /> Sheriff&apos;s Docket
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blood/60 to-transparent" />
          </div>

          <div className="wood-panel border-4 border-wood-900 rounded p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-blood/5 pointer-events-none" />
            <p className="font-special text-cream/70 text-sm leading-relaxed relative z-10">
              Review disputed bounties and rule in favour of the Hunter or refund the Poster.
            </p>
          </div>

          <ArbitrationPanel bounties={disputed} onResolved={reloadDisputed} />
        </section>
      )}
    </div>
  )
}
