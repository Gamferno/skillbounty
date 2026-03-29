'use client'

import { useEffect, useState } from 'react'
import { fetchRecentContractEvents, ContractEvent } from '@/lib/contract'
import { truncateAddress } from '@/lib/constants'
import { RefreshCw, Trophy, Target, Activity, Star } from 'lucide-react'

interface Stats {
  hunterCompletions: Record<string, number>
  posterPosts: Record<string, number>
  mostActive: Record<string, number> // total interactions
}

export default function LeaderboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const events = await fetchRecentContractEvents() // using the same helper that can fetch up to 50 for now, or you could extend it to fetch ALL events.
        
        const s: Stats = {
          hunterCompletions: {},
          posterPosts: {},
          mostActive: {}
        }

        events.forEach(evt => {
          // Track total activity
          s.mostActive[evt.actor] = (s.mostActive[evt.actor] || 0) + 1

          // specific metrics
          if (evt.type === 'approve' || evt.type === 'timeout' || evt.type === 'arb_win') {
            s.hunterCompletions[evt.actor] = (s.hunterCompletions[evt.actor] || 0) + 1
          } else if (evt.type === 'post') {
            s.posterPosts[evt.actor] = (s.posterPosts[evt.actor] || 0) + 1
          }
        })

        setStats(s)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <RefreshCw className="w-10 h-10 text-wanted animate-spin" />
        <p className="font-rye tracking-widest text-cream uppercase">Tallying the scores...</p>
      </div>
    )
  }

  const getTop5 = (record: Record<string, number>) => {
    return Object.entries(record)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  const topHunters = getTop5(stats!.hunterCompletions)
  const topPosters = getTop5(stats!.posterPosts)
  const topActive = getTop5(stats!.mostActive)

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-5xl font-rye text-cream tracking-widest uppercase text-shadow-md mb-4 flex items-center justify-center gap-4">
          <Star className="w-8 h-8 text-wanted fill-wanted" /> Hall of Fame <Star className="w-8 h-8 text-wanted fill-wanted" />
        </h1>
        <p className="text-cream/70 font-special max-w-xl mx-auto">
          The finest gunslingers and sheriffs in the territory. Based on recent on-chain contract activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Top Hunters */}
        <div className="bg-wood-900 border-[3px] border-wood-700 shadow-xl rounded overflow-hidden">
          <div className="bg-wood-800 border-b-2 border-wood-700 p-4 flex items-center justify-center gap-3">
            <Trophy className="text-wanted w-6 h-6" />
            <h2 className="text-xl font-rye tracking-widest text-cream uppercase">Top Hunters</h2>
          </div>
          <div className="p-4 space-y-4">
            {topHunters.length === 0 ? <p className="text-center text-cream/50 font-special text-sm py-4">No completions yet</p> : topHunters.map(([actor, count], i) => (
              <div key={actor} className="flex items-center justify-between text-cream font-special p-3 bg-wood-800/40 rounded border border-wood-700/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded flex items-center justify-center font-rye ${i === 0 ? 'bg-wanted text-wood-900' : 'bg-wood-700 text-cream/70'}`}>
                    {i + 1}
                  </span>
                  <a href={`/profile/${actor}`} className="hover:text-wanted transition-colors font-bold break-all">
                    {truncateAddress(actor)}
                  </a>
                </div>
                <span className="font-bold text-wanted text-lg">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posters */}
        <div className="bg-wood-900 border-[3px] border-wood-700 shadow-xl rounded overflow-hidden">
          <div className="bg-wood-800 border-b-2 border-wood-700 p-4 flex items-center justify-center gap-3">
            <Target className="text-frontier w-6 h-6" />
            <h2 className="text-xl font-rye tracking-widest text-cream uppercase">Top Posters</h2>
          </div>
          <div className="p-4 space-y-4">
            {topPosters.length === 0 ? <p className="text-center text-cream/50 font-special text-sm py-4">No bounties posted yet</p> : topPosters.map(([actor, count], i) => (
              <div key={actor} className="flex items-center justify-between text-cream font-special p-3 bg-wood-800/40 rounded border border-wood-700/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded flex items-center justify-center font-rye ${i === 0 ? 'bg-frontier text-wood-900' : 'bg-wood-700 text-cream/70'}`}>
                    {i + 1}
                  </span>
                  <a href={`/profile/${actor}`} className="hover:text-frontier transition-colors font-bold break-all">
                    {truncateAddress(actor)}
                  </a>
                </div>
                <span className="font-bold text-frontier text-lg">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div className="bg-wood-900 border-[3px] border-wood-700 shadow-xl rounded overflow-hidden">
          <div className="bg-wood-800 border-b-2 border-wood-700 p-4 flex items-center justify-center gap-3">
            <Activity className="text-blood w-6 h-6" />
            <h2 className="text-xl font-rye tracking-widest text-cream uppercase">Most Active</h2>
          </div>
          <div className="p-4 space-y-4">
            {topActive.length === 0 ? <p className="text-center text-cream/50 font-special text-sm py-4">No activity yet</p> : topActive.map(([actor, count], i) => (
              <div key={actor} className="flex items-center justify-between text-cream font-special p-3 bg-wood-800/40 rounded border border-wood-700/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded flex items-center justify-center font-rye ${i === 0 ? 'bg-blood text-wood-900' : 'bg-wood-700 text-cream/70'}`}>
                    {i + 1}
                  </span>
                  <a href={`/profile/${actor}`} className="hover:text-blood transition-colors font-bold break-all">
                    {truncateAddress(actor)}
                  </a>
                </div>
                <span className="font-bold text-blood text-lg">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
