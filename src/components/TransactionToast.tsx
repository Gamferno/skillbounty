'use client'

import { useEffect, useState } from 'react'
import { TxState } from '@/types/bounty'
import { txExplorerUrl } from '@/lib/constants'

interface TransactionToastProps {
  tx: TxState
  onDismiss: () => void
}

export function TransactionToast({ tx, onDismiss }: TransactionToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (tx.status !== 'idle') {
      setVisible(true)
    }
    if (tx.status === 'confirmed' || tx.status === 'failed') {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [tx.status, onDismiss])

  if (!visible) return null

  const styles = {
    pending: 'parchment !bg-wanted/10 border-wanted/30',
    confirmed: 'parchment !bg-frontier/10 border-frontier/30',
    failed: 'parchment !bg-blood/10 border-blood/30',
    idle: '',
  }

  const icons = {
    pending: '⏳',
    confirmed: '🤠',
    failed: '🌵',
    idle: '',
  }

  const messages = {
    pending: 'Wire is being sent...',
    confirmed: 'Bounty paid, partner.',
    failed: `Whoa there. Something went wrong: ${tx.error ?? 'unknown error'}`,
    idle: '',
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full rounded border p-4 shadow-2xl transition-all duration-300 ${styles[tx.status]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{icons[tx.status]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-special text-ink-light font-bold">{messages[tx.status]}</p>
          {tx.hash && tx.status === 'confirmed' && (
            <a
              href={txExplorerUrl(tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-special text-wanted hover:underline mt-1 block truncate"
            >
              View transaction ↗
            </a>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white text-sm leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
