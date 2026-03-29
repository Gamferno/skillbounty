'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchAllBounties } from '@/lib/contract'
import { Bounty, BountyStatus } from '@/types/bounty'
import { BountyList } from '@/components/BountyList'
import { ActivityFeed } from '@/components/ActivityFeed'
import { useWallet } from '@/context/WalletContext'
import { MapPin, Telescope } from 'lucide-react'

// Organic tumbleweed — irregular dried bush shape
function Tumbleweed({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className ?? ''}`} aria-hidden="true">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer irregular bush body */}
        <path
          d="M30 8 C36 5, 48 10, 52 20 C56 30, 52 46, 42 52 C32 58, 18 56, 10 48 C2 40, 4 24, 10 16 C16 8, 24 11, 30 8Z"
          fill="rgba(180,130,50,0.18)" stroke="#c9963a" strokeWidth="2"
        />
        {/* Inner oval */}
        <ellipse cx="30" cy="31" rx="14" ry="15" stroke="#d4a84a" strokeWidth="1.5" fill="none" />
        {/* Crossing branches (curved) */}
        <path d="M10 20 Q30 31 52 20" stroke="#c09030" strokeWidth="1.4" fill="none" />
        <path d="M10 42 Q30 31 50 42" stroke="#c09030" strokeWidth="1.4" fill="none" />
        <path d="M19 10 Q30 31 20 52" stroke="#b88028" strokeWidth="1.3" fill="none" />
        <path d="M41 10 Q30 31 40 52" stroke="#b88028" strokeWidth="1.3" fill="none" />
        {/* Center knot */}
        <ellipse cx="30" cy="31" rx="4" ry="4" fill="#c09030" opacity="0.55" />
        {/* Spiky sticks poking out */}
        <line x1="30" y1="8"  x2="30" y2="2"  stroke="#c9963a" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="52" y1="20" x2="57" y2="16" stroke="#c9963a" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="52" y1="41" x2="58" y2="44" stroke="#c9963a" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="30" y1="54" x2="29" y2="59" stroke="#c9963a" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8"  y1="42" x2="3"  y2="47" stroke="#c9963a" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8"  y1="20" x2="3"  y2="15" stroke="#c9963a" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// Barbed Wire Divider
function BarbedWireDivider() {
  return (
    <div className="relative flex items-center gap-0 my-2 overflow-hidden" aria-hidden="true">
      <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="6" x2="400" y2="6" stroke="#4a2f25" strokeWidth="1.5" />
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i} transform={`translate(${i * 20 + 5}, 6)`}>
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="#6b4232" strokeWidth="1.5" />
            <line x1="4" y1="-4" x2="-4" y2="4" stroke="#6b4232" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
    </div>
  )
}

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
      {/* Hero — no overflow-hidden so tumbleweeds enter cleanly */}
      <section className="relative text-center py-12 sm:py-20">
        {/* Lantern glow behind title */}
        <div
          className="lantern-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(232,197,71,0.18) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-rye tracking-widest text-cream mb-6 drop-shadow-md">
          <span className="text-wanted">Skill</span>Bounty
        </h1>
        <p className="relative text-lg sm:text-xl text-cream/70 max-w-2xl mx-auto leading-relaxed font-special px-4">
          A trustless frontier bounty board powered by Stellar&apos;s Soroban smart contracts.
          No middlemen. Funds auto-release or the Sheriff resolves disputes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {address ? (
            <Link
              href="/post"
              className="wood-sign inline-flex items-center gap-2 px-8 py-3.5 rounded text-cream font-rye tracking-widest text-lg transition-transform hover:scale-105"
            >
              <MapPin className="w-5 h-5" /> Post a Bounty
            </Link>
          ) : (
            <div className="text-sm font-special text-cream/50 bg-wood-900/50 px-4 py-2 rounded border border-wood-800 poster-sway">
              Draw your wallet to post a bounty
            </div>
          )}
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-wood-800 border-2 border-wood-700 hover:border-wood-600 text-cream/80 hover:text-cream font-rye tracking-widest text-sm transition-all"
          >
            <Telescope className="w-4 h-4" /> View on Explorer
          </a>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-6 sm:gap-8 bg-wood-900/80 border-2 border-wood-700 shadow-xl rounded px-6 sm:px-8 py-4 mx-auto max-w-full backdrop-blur-sm">
            <div className="text-center">
              <p className="text-3xl font-rye text-cream">{bounties.length}</p>
              <p className="text-xs font-special text-wanted mt-1 uppercase tracking-widest">Total</p>
            </div>
            <div className="w-px h-10 bg-wood-700" />
            <div className="text-center">
              <p className="text-3xl font-rye text-cream">
                {bounties.filter((b) => b.status === BountyStatus.Open).length}
              </p>
              <p className="text-xs font-special text-frontier mt-1 uppercase tracking-widest">Open</p>
            </div>
            <div className="w-px h-10 bg-wood-700" />
            <div className="text-center">
              <p className="text-3xl font-rye text-cream">
                {bounties.filter((b) => b.status === BountyStatus.Completed).length}
              </p>
              <p className="text-xs font-special text-cream/50 mt-1 uppercase tracking-widest">Done</p>
            </div>
          </div>
        )}
      </section>

      {/* Tumbleweed ground strip — separate div with overflow:hidden for clean entry/exit */}
      <div className="relative h-20 w-full overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Each tumbleweed starts at absolute left:0 — the animation translateX takes it off-screen left */}
        <div className="absolute bottom-3 left-0 tumbleweed">
          <Tumbleweed />
        </div>
        <div className="absolute bottom-6 left-0 tumbleweed-slow opacity-70">
          <Tumbleweed className="scale-75 opacity-80" />
        </div>
        <div className="absolute bottom-2 left-0 tumbleweed-delay">
          <Tumbleweed className="scale-90" />
        </div>
      </div>

      {/* Barbed wire separator */}
      <BarbedWireDivider />

      {/* Main Board & Feed */}
      <section className="mt-8 grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        <div className="xl:col-span-3">
          <BountyList bounties={bounties} loading={loading} />
        </div>
        <div className="xl:col-span-1 pt-12 xl:pt-16">
          <ActivityFeed />
        </div>
      </section>
    </div>
  )
}
