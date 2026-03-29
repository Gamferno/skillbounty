'use client'

import { useState } from 'react'
import { Bounty, TxState } from '@/types/bounty'
import { buildApproveWork, buildDisputeWork, submitSignedTransaction } from '@/lib/contract'
import { useWallet } from '@/context/WalletContext'
import { CountdownTimer } from './CountdownTimer'
import { TransactionToast } from './TransactionToast'
import { ShieldAlert, CheckCircle2, ExternalLink, Zap } from 'lucide-react'

interface ApproveDisputeButtonsProps {
  bounty: Bounty
  onSuccess?: () => void
}

export function ApproveDisputeButtons({ bounty, onSuccess }: ApproveDisputeButtonsProps) {
  const { address, signTransaction, refreshBalance } = useWallet()
  const [tx, setTx] = useState<TxState>({ status: 'idle' })
  const [action, setAction] = useState<'approve' | 'dispute' | null>(null)

  const handleAction = async (type: 'approve' | 'dispute') => {
    if (!address) return
    setAction(type)
    setTx({ status: 'pending' })
    try {
      const xdr =
        type === 'approve'
          ? await buildApproveWork(address, bounty.id)
          : await buildDisputeWork(address, bounty.id)
      const signed = await signTransaction(xdr)
      const hash = await submitSignedTransaction(signed)
      setTx({ status: 'confirmed', hash })
      await refreshBalance()
      onSuccess?.()
    } catch (err: unknown) {
      const e = err as Error
      setTx({ status: 'failed', error: e.message })
    } finally {
      setAction(null)
    }
  }

  const isLoading = tx.status === 'pending'

  // Time warning
  const hoursLeft = bounty.submitted_at
    ? (Number(bounty.submitted_at) + Number(bounty.deadline_hours) * 3600 - Math.floor(Date.now() / 1000)) / 3600
    : null

  return (
    <>
      <div className="rounded parchment p-6 space-y-5 mt-4">
        <div>
          <h3 className="font-rye text-ink text-lg mb-1">Review Submitted Work</h3>
          {bounty.work_url && (
            <a
              href={bounty.work_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-special text-sm text-ink font-bold hover:underline break-all bg-ink/5 px-2 py-1 rounded"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {bounty.work_url}
            </a>
          )}
        </div>

        {bounty.submitted_at && (
          <div>
            <CountdownTimer
              submittedAt={bounty.submitted_at}
              deadlineHours={bounty.deadline_hours}
            />
            {hoursLeft !== null && hoursLeft < 24 && hoursLeft > 0 && (
              <p className="mt-2 text-xs font-special text-blood font-bold bg-blood/10 border border-blood/20 rounded p-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 shrink-0" /> Under 24 hours left — if you don&apos;t respond, XLM auto-releases to the hunter.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-ink/10">
          <button
            id="approve-work-btn"
            onClick={() => handleAction('approve')}
            disabled={isLoading}
            className="wood-sign flex-1 py-3 rounded hover:brightness-110 disabled:opacity-60 text-cream text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading && action === 'approve' ? (
              <span className="inline-block w-4 h-4 border-2 border-frontier border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-frontier" />
                <span className="font-rye tracking-wider mt-0.5 text-frontier">Approve & Release XLM</span>
              </>
            )}
          </button>
          <button
            id="dispute-work-btn"
            onClick={() => handleAction('dispute')}
            disabled={isLoading}
            className="wood-sign flex-1 py-3 rounded hover:brightness-110 disabled:opacity-60 text-cream text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading && action === 'dispute' ? (
              <span className="inline-block w-4 h-4 border-2 border-blood border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-blood" />
                <span className="font-rye tracking-wider mt-0.5 text-blood">Raise Dispute</span>
              </>
            )}
          </button>
        </div>
      </div>
      <TransactionToast tx={tx} onDismiss={() => setTx({ status: 'idle' })} />
    </>
  )
}
