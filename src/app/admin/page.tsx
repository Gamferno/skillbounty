'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { fetchAllBounties } from '@/lib/contract'
import { Bounty, BountyStatus } from '@/types/bounty'
import { useWallet } from '@/context/WalletContext'
import { ARBITRATOR_ADDRESS } from '@/lib/constants'
import { ArbitrationPanel } from '@/components/ArbitrationPanel'

export default function AdminPage() {
  const { address } = useWallet()
  const [disputed, setDisputed] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)

  const isArbitrator = address && address === ARBITRATOR_ADDRESS

  const reload = useCallback(() => {
    fetchAllBounties().then((all) => {
      setDisputed(all.filter((b) => b.status === BountyStatus.Disputed))
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isArbitrator) {
      reload()
    } else {
      setLoading(false)
    }
  }, [isArbitrator, reload])

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center wood-panel rounded p-12 border-4 border-wood-900 shadow-2xl">
        <span className="text-6xl mb-6">🚪</span>
        <h1 className="text-4xl font-rye tracking-widest text-cream mb-4">Saloon Doors Locked</h1>
        <p className="font-special text-cream/70 text-lg">Draw your wallet to enter the Sheriff&apos;s Office.</p>
      </div>
    )
  }

  if (!isArbitrator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center wood-panel rounded p-12 border-4 border-wood-900 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blood/10 pointer-events-none" />
        <span className="text-6xl mb-6 drop-shadow-lg text-blood z-10">☠</span>
        <h1 className="text-4xl font-rye tracking-widest text-cream mb-4 z-10">Turn Back, Partner</h1>
        <p className="font-special text-cream/80 text-lg z-10">
          This office is strictly for the town Sheriff. Lookin&apos; at you, stranger.
        </p>
        <p className="text-xs text-blood font-special mt-4 max-w-[250px] mx-auto truncate bg-wood-900 p-2 border border-blood/20 z-10">Connected: {address}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="wood-panel p-8 rounded border-4 border-wood-900 shadow-xl relative">
        <div className="absolute top-0 left-1/2 -ml-3 -mt-4 w-6 h-6 bg-wood-900 rounded-full border-2 border-wood-700 shadow-sm" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-wanted/20 border border-wanted text-wanted text-sm font-rye mb-6 font-bold shadow-sm uppercase tracking-widest">
          ⭐ Sheriff on Duty
        </div>
        <h1 className="text-4xl font-rye tracking-widest text-cream mb-3 drop-shadow-md">Sheriff&apos;s Office</h1>
        <p className="font-special text-cream/80 text-lg leading-relaxed max-w-lg">
          Review disputed bounties and decide whether to release funds to the hunter or refund the poster.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 parchment opacity-50 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <ArbitrationPanel bounties={disputed} onResolved={reload} />
      )}
    </div>
  )
}
