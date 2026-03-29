'use client'

import { useEffect, useState } from 'react'
import { fetchRecentContractEvents, ContractEvent } from '@/lib/contract'
import { truncateAddress } from '@/lib/constants'
import { RefreshCw, Star, Crosshair, FileText, Coins, Swords, Clock, Scale, Radio } from 'lucide-react'

export function ActivityFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = async () => {
    try {
      const data = await fetchRecentContractEvents()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
    const interval = setInterval(loadEvents, 15000)
    return () => clearInterval(interval)
  }, [])

  const getEventText = (evt: ContractEvent) => {
    const actor = truncateAddress(evt.actor)
    switch (evt.type) {
      case 'post':     return <><strong className="text-wanted flex items-center gap-1.5 shrink-0"><Star className="w-3.5 h-3.5" /> Posted</strong> <span className="truncate">Bounty #{evt.bountyId} by {actor}</span></>
      case 'claim':    return <><strong className="text-frontier flex items-center gap-1.5 shrink-0"><Crosshair className="w-3.5 h-3.5" /> Claimed</strong> <span className="truncate">Bounty #{evt.bountyId} by {actor}</span></>
      case 'submit':   return <><strong className="text-cream flex items-center gap-1.5 shrink-0"><FileText className="w-3.5 h-3.5" /> Submitted</strong> <span className="truncate">work for #{evt.bountyId} by {actor}</span></>
      case 'approve':  return <><strong className="text-frontier flex items-center gap-1.5 shrink-0"><Coins className="w-3.5 h-3.5" /> Approved</strong> <span className="truncate">&amp; paid for #{evt.bountyId}</span></>
      case 'dispute':  return <><strong className="text-blood flex items-center gap-1.5 shrink-0"><Swords className="w-3.5 h-3.5" /> Disputed</strong> <span className="truncate">Bounty #{evt.bountyId}</span></>
      case 'timeout':  return <><strong className="text-wanted flex items-center gap-1.5 shrink-0"><Clock className="w-3.5 h-3.5" /> Auto-released</strong> <span className="truncate">#{evt.bountyId} to {actor}</span></>
      case 'arb_win':  return <><strong className="text-frontier flex items-center gap-1.5 shrink-0"><Scale className="w-3.5 h-3.5" /> Win</strong> <span className="truncate">for Hunter {actor} on #{evt.bountyId}</span></>
      case 'arb_loss': return <><strong className="text-blood flex items-center gap-1.5 shrink-0"><Scale className="w-3.5 h-3.5" /> Refunded</strong> <span className="truncate">Poster {actor} on #{evt.bountyId}</span></>
      default:         return <span className="truncate">Activity on #{evt.bountyId} by {actor}</span>
    }
  }

  if (loading && events.length === 0) {
    return (
      <div className="bg-wood-900 border-2 border-wood-700 shadow-xl rounded p-4 font-special text-sm text-cream/50 min-h-[300px] flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin opacity-50" />
      </div>
    )
  }

  return (
    <div className="bg-wood-900 border-2 border-wood-700 shadow-xl rounded overflow-hidden flex flex-col h-[500px]">
      <div className="bg-wood-800 border-b border-wood-700 p-3 flex items-center justify-between">
        <h3 className="font-rye text-cream tracking-widest uppercase text-sm flex items-center gap-2 m-0 p-0 leading-none h-4">
          <Radio className="w-4 h-4 text-wanted shrink-0 block" /> 
          <span className="block translate-y-[1px]">The Telegraph Wire</span>
        </h3>
        <button onClick={loadEvents} className="text-cream/40 hover:text-wanted transition-colors" title="Refresh Feed">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-3 relative">
        {events.length === 0 ? (
          <p className="text-cream/50 text-xs text-center mt-4">No recent signals on the wire...</p>
        ) : (
          events.map((evt) => (
            <div key={`${evt.id}-${evt.type}`} className="group flex items-center gap-3 text-xs leading-relaxed border-b border-wood-800 pb-3 last:border-0 last:pb-0">
              <span className="text-wood-700 font-bold group-hover:text-wanted/50 transition-colors shrink-0">•</span>
              <p className="text-cream/80 flex-1 flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                {getEventText(evt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
