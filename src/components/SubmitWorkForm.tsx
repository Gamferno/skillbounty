'use client'

import { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { buildSubmitWork, submitSignedTransaction } from '@/lib/contract'
import { TxState } from '@/types/bounty'
import { TransactionToast } from './TransactionToast'
import { Send } from 'lucide-react'

interface SubmitWorkFormProps {
  bountyId: bigint
  onSuccess?: () => void
}

export function SubmitWorkForm({ bountyId, onSuccess }: SubmitWorkFormProps) {
  const { address, signTransaction, refreshBalance } = useWallet()
  const [workUrl, setWorkUrl] = useState('')
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    setTx({ status: 'pending' })
    try {
      const xdr = await buildSubmitWork(address, bountyId, workUrl)
      const signedXdr = await signTransaction(xdr)
      const hash = await submitSignedTransaction(signedXdr)
      setTx({ status: 'confirmed', hash })
      await refreshBalance()
      onSuccess?.()
    } catch (err: unknown) {
      const e = err as Error
      setTx({ status: 'failed', error: e.message })
    }
  }

  const isLoading = tx.status === 'pending'

  return (
    <>
      <div className="rounded parchment p-6 mt-4">
        <h3 className="font-rye text-ink text-lg mb-2">Submit Your Work</h3>
        <p className="font-special text-sm text-ink-light mb-5">
          Drop your deliverable link — GitHub repo, Figma file, Notion doc, deployed URL, etc.
          Once submitted, the review countdown starts.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            id="work-url-input"
            type="url"
            required
            value={workUrl}
            onChange={(e) => setWorkUrl(e.target.value)}
            placeholder="https://github.com/you/repo"
            className="font-special flex-1 px-4 py-3 rounded bg-parchment-light border-2 border-wood-700/30 focus:border-ink focus:ring-1 focus:ring-ink text-ink placeholder:text-ink/40 outline-none transition text-sm shadow-inner"
          />
          <button
            id="submit-work-btn"
            type="submit"
            disabled={isLoading || !address}
            className="wood-sign sm:w-auto w-full px-6 py-3 rounded hover:brightness-110 disabled:opacity-60 text-cream text-base transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-wanted" />
                <span className="font-rye tracking-wider mt-0.5">Deliver</span>
              </>
            )}
          </button>
        </form>
      </div>
      <TransactionToast tx={tx} onDismiss={() => setTx({ status: 'idle' })} />
    </>
  )
}
