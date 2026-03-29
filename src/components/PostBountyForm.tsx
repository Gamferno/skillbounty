'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/context/WalletContext'
import { buildPostBounty, submitSignedTransaction } from '@/lib/contract'
import { xlmToStroops, CONTRACT_ADDRESS } from '@/lib/constants'
import { TxState } from '@/types/bounty'
import { TransactionToast } from './TransactionToast'
import { useXlmPrice } from '@/hooks/useXlmPrice'

const contractNotDeployed = !CONTRACT_ADDRESS

export function PostBountyForm() {
  const router = useRouter()
  const { address, signTransaction, refreshBalance } = useWallet()
const AVAILABLE_TAGS = ['Design', 'Frontend', 'Backend', 'Writing', 'Research', 'Video', 'Marketing', 'Other']

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reward, setReward] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [deadlineHours, setDeadlineHours] = useState(72)
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const xlmPrice = useXlmPrice()
  const estimatedUsd = reward && xlmPrice ? (parseFloat(reward) * xlmPrice).toFixed(2) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    setTx({ status: 'pending' })
    try {
      const rewardStroops = xlmToStroops(parseFloat(reward))
      const xdr = await buildPostBounty(
        address,
        title,
        description,
        rewardStroops,
        BigInt(deadlineHours),
        tags,
      )
      const signedXdr = await signTransaction(xdr)
      const hash = await submitSignedTransaction(signedXdr)
      setTx({ status: 'confirmed', hash })
      await refreshBalance()
      setTimeout(() => router.push('/'), 2000)
    } catch (err: unknown) {
      const e = err as Error
      setTx({ status: 'failed', error: e.message })
    }
  }

  const isLoading = tx.status === 'pending'

  return (
    <>
      {contractNotDeployed && (
        <div className="mb-6 rounded parchment p-4 text-sm">
          <p className="font-rye font-bold text-blood mb-2 text-lg">⚠ Contract not deployed yet</p>
          <p className="text-ink-light text-xs leading-relaxed font-special">
            <code className="bg-wood-800/10 px-1 py-0.5 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> is empty in{' '}
            <code className="bg-wood-800/10 px-1 py-0.5 rounded">.env.local</code>.
            {' '}Deploy the Soroban contract first, then paste the address:
          </p>
          <pre className="mt-3 text-xs bg-wood-900 border border-wood-700 rounded p-3 overflow-x-auto text-cream leading-relaxed font-special shadow-inner">{`cd contract
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy \\
  --wasm target/wasm32-unknown-unknown/release/skillbounty.wasm \\
  --network testnet --source YOUR_KEY_NAME`}</pre>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-base font-rye tracking-wider text-cream/90 mb-2">
            Bounty Title <span className="text-blood">*</span>
          </label>
          <input
            id="bounty-title"
            type="text"
            required
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build a landing page in Next.js"
            className="font-special w-full px-4 py-3 rounded bg-wood-800 border-2 border-wood-700/50 shadow-inner focus:border-wanted focus:ring-1 focus:ring-wanted text-cream placeholder:text-cream/30 outline-none transition text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-base font-rye tracking-wider text-cream/90 mb-2">
            Description <span className="text-blood">*</span>
          </label>
          <textarea
            id="bounty-description"
            required
            rows={5}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work required, deliverables, acceptance criteria…"
            className="font-special w-full px-4 py-3 rounded bg-wood-800 border-2 border-wood-700/50 shadow-inner focus:border-wanted focus:ring-1 focus:ring-wanted text-cream placeholder:text-cream/30 outline-none transition text-sm resize-none scrollbar-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-base font-rye tracking-wider text-cream/90 mb-2">
            Skill Tags (Select up to 3)
          </label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = tags.includes(tag)
              const isDisabled = !isSelected && tags.length >= 3
              
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isSelected) setTags(tags.filter((t) => t !== tag))
                    else if (!isDisabled) setTags([...tags, tag])
                  }}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 rounded text-sm font-rye tracking-wider transition-all duration-200 border-2 shadow-sm uppercase ${
                    isSelected
                      ? 'bg-wanted/20 border-wanted text-wanted rotate-1 scale-105'
                      : 'bg-wood-800 border-wood-700/50 text-cream/70 hover:border-wood-600 disabled:opacity-40 disabled:hover:border-wood-700/50'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Reward */}
        <div>
          <label className="block text-base font-rye tracking-wider text-cream/90 mb-2">
            Reward (XLM) <span className="text-blood">*</span>
          </label>
          <div className="relative">
            <input
              id="bounty-reward"
              type="number"
              required
              min="1"
              step="0.01"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="10"
              className="font-special w-full px-4 py-3 pr-20 rounded bg-wood-800 border-2 border-wood-700/50 shadow-inner focus:border-wanted focus:ring-1 focus:ring-wanted text-cream placeholder:text-cream/30 outline-none transition text-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-wanted font-rye tracking-widest">
              XLM
            </span>
          </div>
          {estimatedUsd && (
            <p className="mt-1.5 text-xs text-wanted font-special">≈ ${estimatedUsd} USD</p>
          )}
          <p className="mt-1.5 text-xs text-cream/50 font-special">Funds are locked in the smart contract until work is approved.</p>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-base font-rye tracking-wider text-cream/90 mb-2">
            Review window (hours)
          </label>
          <input
            id="bounty-deadline"
            type="number"
            min="1"
            max="720"
            value={deadlineHours}
            onChange={(e) => setDeadlineHours(Number(e.target.value))}
            className="font-special w-full px-4 py-3 rounded bg-wood-800 border-2 border-wood-700/50 shadow-inner focus:border-wanted focus:ring-1 focus:ring-wanted text-cream outline-none transition text-sm"
          />
          <p className="mt-1.5 text-xs text-cream/50 font-special">
            You have this many hours to approve or dispute after work is delivered. Default: 72h.
          </p>
        </div>

        {/* Submit */}
        <button
          id="post-bounty-submit"
          type="submit"
          disabled={isLoading || !address}
          className="wood-sign w-full py-4 rounded hover:brightness-110 disabled:opacity-60 text-cream text-lg transition-all duration-200 flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
              <span className="font-rye tracking-wider">Sending wire...</span>
            </>
          ) : (
            <>
              <span className="text-xl">📌</span>
              <span className="font-rye tracking-wider">Post {reward ? `${reward} XLM` : 'a'} Bounty</span>
            </>
          )}
        </button>
      </form>

      <TransactionToast tx={tx} onDismiss={() => setTx({ status: 'idle' })} />
    </>
  )
}
