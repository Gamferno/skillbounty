'use client'

import { useState } from 'react'
import { Bounty, TxState } from '@/types/bounty'
import { buildArbitrate, submitSignedTransaction } from '@/lib/contract'
import { useWallet } from '@/context/WalletContext'
import { stroopsToXlm, truncateAddress } from '@/lib/constants'
import { TransactionToast } from './TransactionToast'
import { Scale, RotateCcw } from 'lucide-react'

interface ArbitrationPanelProps {
  bounties: Bounty[]
  onResolved?: () => void
}

export function ArbitrationPanel({ bounties, onResolved }: ArbitrationPanelProps) {
  const { address, signTransaction, refreshBalance } = useWallet()
  const [tx, setTx] = useState<TxState>({ status: 'idle' })
  const [resolving, setResolving] = useState<bigint | null>(null)

  const handleArbitrate = async (bountyId: bigint, releaseToHunter: boolean) => {
    if (!address) return
    setResolving(bountyId)
    setTx({ status: 'pending' })
    try {
      const xdr = await buildArbitrate(address, bountyId, releaseToHunter)
      const signed = await signTransaction(xdr)
      const hash = await submitSignedTransaction(signed)
      setTx({ status: 'confirmed', hash })
      await refreshBalance()
      onResolved?.()
    } catch (err: unknown) {
      const e = err as Error
      setTx({ status: 'failed', error: e.message })
    } finally {
      setResolving(null)
    }
  }

  if (bounties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center wood-panel rounded border-[3px] border-wood-900 shadow-2xl">
        <span className="text-5xl mb-4 drop-shadow-md">🏜️</span>
        <p className="font-rye text-2xl tracking-widest text-cream mb-2">No disputed bounties</p>
        <p className="font-special text-cream/60">All clear — tumbleweeds rollin&apos; through.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {bounties.map((bounty) => {
          const isLoading = resolving === bounty.id && tx.status === 'pending'
          // Optional slight rotation to messy them up a bit
          const rotationClass = Number(bounty.id) % 2 === 0 ? 'rotate-1' : '-rotate-1'
          
          return (
            <div
              key={bounty.id.toString()}
              className={`parchment p-6 relative ${rotationClass}`}
            >
              {/* The Pin (Nail) */}
              <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 rounded-full bg-wood-900 border-2 border-wood-700 shadow-sm z-10">
                <div className="absolute inset-m-0.5 rounded-full bg-black/20" />
              </div>

              <div className="flex items-start justify-between gap-4 mb-3 mt-2">
                <div>
                  <h3 className="font-rye text-xl text-ink leading-snug">{bounty.title}</h3>
                  <p className="font-special text-sm text-ink-light mt-1.5 line-clamp-2">{bounty.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-3xl font-rye text-blood block leading-none">
                    {stroopsToXlm(bounty.reward)}
                  </span>
                  <span className="text-sm font-rye text-ink">XLM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 pt-3 border-t border-ink/10 font-special text-sm">
                <div>
                  <span className="text-ink/60 text-xs font-rye uppercase tracking-widest block mb-0.5">Poster</span>
                  <p className="font-bold text-ink">{truncateAddress(bounty.poster, 10)}</p>
                </div>
                <div>
                  <span className="text-ink/60 text-xs font-rye uppercase tracking-widest block mb-0.5">Hunter</span>
                  <p className="font-bold text-ink">
                    {bounty.hunter ? truncateAddress(bounty.hunter, 10) : '—'}
                  </p>
                </div>
              </div>

              {bounty.work_url && (
                <a
                  href={bounty.work_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-special text-sm text-ink font-bold hover:underline mb-5 block bg-ink/5 px-2 py-1 rounded w-fit"
                >
                  🔗 View submitted work ↗
                </a>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-ink/10">
                <button
                  id={`release-hunter-${bounty.id}`}
                  onClick={() => handleArbitrate(bounty.id, true)}
                  disabled={isLoading}
                  className="wood-sign flex-1 py-3 hover:brightness-110 disabled:opacity-60 text-cream text-sm transition-all duration-200 flex items-center justify-center gap-2 rounded"
                >
                  {isLoading && resolving === bounty.id ? (
                    <span className="inline-block w-4 h-4 border-2 border-frontier border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Scale className="w-4 h-4 text-frontier" />
                      <span className="font-rye tracking-wider mt-0.5 text-frontier">Rule for Hunter</span>
                    </>
                  )}
                </button>
                <button
                  id={`refund-poster-${bounty.id}`}
                  onClick={() => handleArbitrate(bounty.id, false)}
                  disabled={isLoading}
                  className="wood-sign flex-1 py-3 hover:brightness-110 disabled:opacity-60 text-cream text-sm transition-all duration-200 flex items-center justify-center gap-2 rounded"
                >
                  {isLoading && resolving === bounty.id ? (
                    <span className="inline-block w-4 h-4 border-2 border-blood border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 text-blood" />
                      <span className="font-rye tracking-wider mt-0.5 text-blood">Rule for Poster</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <TransactionToast tx={tx} onDismiss={() => setTx({ status: 'idle' })} />
    </>
  )
}
