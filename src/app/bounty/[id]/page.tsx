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

export default function BountyDetailPage() {
  const params = useParams()
  const bountyId = BigInt(params.id as string)
  const { address, signTransaction, refreshBalance } = useWallet()

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
        <div className="h-8 bg-surface-800 rounded-lg w-1/2" />
        <div className="h-48 bg-surface-800 rounded-2xl" />
      </div>
    )
  }

  if (!bounty) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-lg text-slate-300">Bounty not found</p>
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
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {bounty.title}
            </h1>
            <StatusBadge status={bounty.status} />
          </div>
          <p className="text-sm text-slate-500">
            Bounty #{bounty.id.toString()} · posted by{' '}
            <a
              href={`/profile/${bounty.poster}`}
              className="text-brand-400 hover:underline"
            >
              {truncateAddress(bounty.poster)}
            </a>
          </p>
        </div>

        {/* Main card */}
        <div className="rounded-2xl bg-surface-800/60 border border-white/10 p-6 space-y-4">
          {/* Reward */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Reward</p>
              <p className="text-3xl font-extrabold text-white mt-0.5">
                {stroopsToXlm(bounty.reward)}{' '}
                <span className="text-slate-400 text-lg font-normal">XLM</span>
              </p>
            </div>
            {bounty.status === BountyStatus.Open && (
              <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                🔒 Locked in contract
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {bounty.description}
            </p>
          </div>

          {/* Hunter info */}
          {bounty.hunter && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-slate-500">
                Claimed by{' '}
                <a href={`/profile/${bounty.hunter}`} className="text-brand-400 hover:underline">
                  {truncateAddress(bounty.hunter)}
                </a>
              </p>
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
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300">
            ⚖ This bounty is under arbitration. The platform arbitrator will resolve.
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
          <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-sm text-yellow-300 space-y-2">
            <p>✅ Work submitted! Waiting for the poster to review.</p>
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
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {claimTx.status === 'pending' ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '🎯 Claim this Bounty'
            )}
          </button>
        )}

        {/* No wallet connected */}
        {!address && bounty.status === BountyStatus.Open && (
          <p className="text-center text-sm text-slate-500 py-4">
            Connect your wallet to claim this bounty
          </p>
        )}

        {/* Read-only: completed/refunded */}
        {(bounty.status === BountyStatus.Completed || bounty.status === BountyStatus.Refunded) && (
          <div className="rounded-xl bg-surface-800/40 border border-white/10 p-4 text-sm text-slate-400 text-center">
            {bounty.status === BountyStatus.Completed
              ? '✅ This bounty has been completed and XLM released.'
              : '↩ This bounty was refunded to the poster.'}
          </div>
        )}
      </div>

      <TransactionToast tx={claimTx} onDismiss={() => setClaimTx({ status: 'idle' })} />
    </>
  )
}
