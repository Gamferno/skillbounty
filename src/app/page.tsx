'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchAllBounties } from '@/lib/contract'
import { Bounty } from '@/types/bounty'
import { BountyList } from '@/components/BountyList'
import { useWallet } from '@/context/WalletContext'

export default function HomePage() {
  const { address } = useWallet()
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllBounties()
      .then(setBounties)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative text-center py-16 sm:py-24 overflow-hidden">
        {/* Gradient blob */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand-600/20 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Live on Stellar Testnet
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          Post work.{' '}
          <span className="text-gradient">Lock XLM.</span>
          <br />
          Pay on delivery.
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A trustless bounty board powered by Stellar's Soroban smart contracts.
          No middlemen. Funds auto-release or an arbitrator resolves disputes.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {address ? (
            <Link
              href="/post"
              id="hero-post-bounty-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-brand-900/40 hover:shadow-brand-600/30 hover:-translate-y-0.5"
            >
              ⚡ Post a Bounty
            </Link>
          ) : (
            <div className="text-sm text-slate-500">Connect your wallet to post a bounty</div>
          )}
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-800 border border-white/10 text-slate-300 hover:text-white hover:border-brand-500/30 font-medium text-sm transition-all duration-200"
          >
            🔭 Stellar Explorer ↗
          </a>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="mt-10 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{bounties.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Bounties</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {bounties.filter((b) => b.status === 'Open' as unknown).length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Open Now</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {bounties.filter((b) => b.status === 'Completed' as unknown).length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Completed</p>
            </div>
          </div>
        )}
      </section>

      {/* Bounty Board */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">Bounty Board</h2>
          {address && (
            <Link
              href="/post"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all duration-200"
            >
              + Post Bounty
            </Link>
          )}
        </div>
        <BountyList bounties={bounties} loading={loading} />
      </section>
    </div>
  )
}
