import { useEffect, useState } from 'react'
import { fetchReputation } from '@/lib/contract'

export interface PosterRep {
  completions: number
  tier: 'newcomer' | 'apprentice' | 'deputy' | 'sheriff' | 'legend'
  label: string
  icon: 'user' | 'crosshair' | 'star' | 'shield' | 'trophy'
}

function getTier(completions: number): PosterRep['tier'] {
  if (completions >= 20) return 'legend'
  if (completions >= 10) return 'sheriff'
  if (completions >= 5)  return 'deputy'
  if (completions >= 1)  return 'apprentice'
  return 'newcomer'
}

const TIER_META: Record<PosterRep['tier'], { label: string; icon: PosterRep['icon'] }> = {
  newcomer:   { label: 'Newcomer',   icon: 'user' },
  apprentice: { label: 'Apprentice', icon: 'crosshair' },
  deputy:     { label: 'Deputy',     icon: 'star' },
  sheriff:    { label: 'Sheriff',    icon: 'shield' },
  legend:     { label: 'Legend',     icon: 'trophy' },
}

/** Fetches on-chain reputation for a given wallet address.
 *  Caches in a module-level map so repeat renders don't refetch. */
const cache = new Map<string, number>()

export function usePosterReputation(wallet: string): PosterRep | null {
  const [rep, setRep] = useState<PosterRep | null>(null)

  useEffect(() => {
    if (!wallet) return
    let cancelled = false

    const load = async () => {
      let completions: number
      if (cache.has(wallet)) {
        completions = cache.get(wallet)!
      } else {
        completions = await fetchReputation(wallet)
        cache.set(wallet, completions)
      }
      if (cancelled) return
      const tier = getTier(completions)
      setRep({ completions, tier, ...TIER_META[tier] })
    }

    load()
    return () => { cancelled = true }
  }, [wallet])

  return rep
}
