'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  fetchBounty,
  buildClaimBounty,
  submitSignedTransaction,
} from '@/lib/contract'
import { Bounty, BountyStatus, TxState } from '@/types/bounty'
import { useWallet } from '@/context/WalletContext'
import { stroopsToXlm, truncateAddress, txExplorerUrl } from '@/lib/constants'
import { StatusBadge } from '@/components/StatusBadge'
import { ApproveDisputeButtons } from '@/components/ApproveDisputeButtons'
import { SubmitWorkForm } from '@/components/SubmitWorkForm'
import { CountdownTimer } from '@/components/CountdownTimer'
import { TransactionToast } from '@/components/TransactionToast'
import { useXlmPrice } from '@/hooks/useXlmPrice'
import { CopyButton } from '@/components/CopyButton'
import { Crosshair, Search, Scale, CheckCircle, RotateCcw } from 'lucide-react'

export default function BountyDetailPage() {
  const params = useParams()
  const bountyId = BigInt(params.id as string)
  const { address, signTransaction, refreshBalance } = useWallet()
  const xlmPrice = useXlmPrice()

  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [claimTx, setClaimTx] = useState<TxState>({ status: 'idle' })

  const reload = useCallback(() => {
    fetchBounty(bountyId)
      .then(setBounty)
      .finally(() => setLoading(false))
  }, [bountyId])

  useEffect(() => {
    reload()
  }, [reload])

  const handleClaim = async () => {
    if (!address || !bounty) return
    setClaimTx({ status: 'pending' })
    try {
      const xdr = await buildClaimBounty(address, bounty.id)
      const signed = await signTransaction(xdr)
      const hash = await submitSignedTransaction(signed)
      setClaimTx({ status: 'confirmed', hash })
      await refreshBalance()
      reload()
    } catch (err: unknown) {
      const e = err as Error
      setClaimTx({ status: 'failed', error: e.message })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-wood-800 rounded w-1/2" />
        <div className="h-48 bg-wood-800 rounded" />
      </div>
    )
  }

  if (!bounty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Search className="w-12 h-12 mb-4 text-cream/30" />
        <p className="font-rye text-2xl text-cream tracking-widest mb-2">No Such Bounty</p>
        <p className="text-cream/50 font-special">This poster has blown into the wind, partner.</p>
      </div>
    )
  }

  const isPoster = address === bounty.poster
  const isHunter = address === bounty.hunter
  const isUnassignedHunter =
    address && address !== bounty.poster && !bounty.hunter &&
    bounty.status === BountyStatus.Open

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="wood-panel rounded border-2 border-wood-700 p-6 relative overflow-hidden">
          {/* Decorative nail */}
          <div className="absolute top-0 left-1/2 -ml-2 -mt-2 w-4 h-4 rounded-full bg-wood-900 border-2 border-wood-700 shadow z-10" />

          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-rye tracking-widest text-cream leading-snug">
              {bounty.title}
            </h1>
            <StatusBadge status={bounty.status} />
          </div>
          <p className="text-sm font-special text-cream/50">
            Bounty #{bounty.id.toString()} · posted by{' '}
            <span className="inline-flex items-center gap-1">
              <a
                href={`/profile/${bounty.poster}`}
                className="text-wanted hover:underline"
              >
                {truncateAddress(bounty.poster)}
              </a>
              <CopyButton value={bounty.poster} />
            </span>
          </p>
        </div>

        {/* Main card */}
        <div className="wood-panel rounded border-2 border-wood-700 p-6 space-y-5">
          {/* Reward */}
          <div className="flex items-center gap-3 pb-4 border-b border-wood-700">
            <div>
              <p className="text-xs font-rye text-cream/50 uppercase tracking-widest mb-1">Reward</p>
              <p className="text-4xl font-rye text-wanted leading-none">
                {stroopsToXlm(bounty.reward)}
                <span className="text-cream/60 text-xl font-rye ml-2">XLM</span>
                {xlmPrice && (
                  <span className="text-cream/40 text-sm font-special ml-2">
                    (≈ ${(parseFloat(stroopsToXlm(bounty.reward)) * xlmPrice).toFixed(2)})
                  </span>
                )}
              </p>
            </div>
            {bounty.status === BountyStatus.Open && (
              <span className="ml-auto text-xs font-rye tracking-widest text-frontier bg-frontier/10 border border-frontier/30 rounded px-3 py-1">
                Locked in Contract
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-rye text-cream/50 uppercase tracking-widest mb-2">Description</p>
            <p className="text-cream/90 text-sm leading-relaxed whitespace-pre-wrap font-special">
              {bounty.description}
            </p>
          </div>

          {/* Tags */}
          {bounty.tags && bounty.tags.length > 0 && (
            <div className="pt-4 border-t border-wood-700">
              <p className="text-xs font-rye text-cream/50 uppercase tracking-widest mb-3">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {bounty.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 flex items-center justify-center text-xs font-rye tracking-widest uppercase border-2 shadow-sm bg-wood-800 border-wanted/40 text-wanted rounded"
                    style={{ transform: `rotate(${Math.random() > 0.5 ? 2 : -2}deg)` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hunter info */}
          {bounty.hunter && (
            <div className="pt-3 border-t border-wood-700 flex items-center gap-2">
              <p className="text-xs font-special text-cream/50">
                Claimed by{' '}
                <a href={`/profile/${bounty.hunter}`} className="text-frontier hover:underline">
                  {truncateAddress(bounty.hunter)}
                </a>
              </p>
              <CopyButton value={bounty.hunter} />
            </div>
          )}
        </div>

        {/* Context-aware action panels */}

        {/* Poster: can approve/dispute if submitted */}
        {isPoster && bounty.status === BountyStatus.Submitted && (
          <ApproveDisputeButtons bounty={bounty} onSuccess={reload} />
        )}

        {/* Poster: disputed */}
        {isPoster && bounty.status === BountyStatus.Disputed && (
          <div className="wood-panel rounded border-2 border-blood/50 p-4 flex items-start gap-3">
            <Scale className="w-5 h-5 text-blood shrink-0 mt-0.5" />
            <p className="text-sm font-special text-cream/80">
              This bounty is under arbitration. The Sheriff will resolve the dispute.
            </p>
          </div>
        )}

        {/* Poster: submitted — show timer */}
        {isPoster && bounty.status === BountyStatus.Submitted && bounty.submitted_at && (
          <div className="pt-2">
            <CountdownTimer submittedAt={bounty.submitted_at} deadlineHours={bounty.deadline_hours} />
          </div>
        )}

        {/* Hunter: submit work if in progress */}
        {isHunter && bounty.status === BountyStatus.InProgress && (
          <SubmitWorkForm bountyId={bounty.id} onSuccess={reload} />
        )}

        {/* Hunter: waiting after submit */}
        {isHunter && bounty.status === BountyStatus.Submitted && (
          <div className="wood-panel rounded border-2 border-wanted/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-wanted shrink-0" />
              <p className="text-sm font-special text-cream/80">Work submitted! Waiting for the poster to review.</p>
            </div>
            {bounty.submitted_at && (
              <CountdownTimer submittedAt={bounty.submitted_at} deadlineHours={bounty.deadline_hours} />
            )}
          </div>
        )}

        {/* Unassigned hunter: claim button */}
        {isUnassignedHunter && (
          <button
            id="claim-bounty-btn"
            onClick={handleClaim}
            disabled={claimTx.status === 'pending'}
            className="w-full py-3.5 rounded wood-sign disabled:opacity-60 text-cream font-rye tracking-widest text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {claimTx.status === 'pending' ? (
              <span className="inline-block w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Crosshair className="w-5 h-5 text-wanted" /> Claim this Bounty</>
            )}
          </button>
        )}

        {/* No wallet connected */}
        {!address && bounty.status === BountyStatus.Open && (
          <p className="text-center text-sm font-special text-cream/50 py-4 border border-wood-700 rounded bg-wood-900/50">
            Draw your wallet to claim this bounty
          </p>
        )}

        {/* Read-only: completed/refunded */}
        {(bounty.status === BountyStatus.Completed || bounty.status === BountyStatus.Refunded) && (
          <div className="wood-panel rounded border-2 border-wood-700 p-4 text-center">
            {bounty.status === BountyStatus.Completed ? (
              <div className="flex items-center justify-center gap-2 text-frontier font-rye tracking-widest">
                <CheckCircle className="w-4 h-4" /> Bounty completed — XLM released
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-cream/50 font-rye tracking-widest">
                <RotateCcw className="w-4 h-4" /> Bounty refunded to poster
              </div>
            )}
          </div>
        )}
      </div>

      <TransactionToast tx={claimTx} onDismiss={() => setClaimTx({ status: 'idle' })} />
    </>
  )
}
