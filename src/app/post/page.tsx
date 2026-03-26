'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/context/WalletContext'
import { PostBountyForm } from '@/components/PostBountyForm'

export default function PostPage() {
  const { address } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!address) {
      router.push('/')
    }
  }, [address, router])

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Redirecting… please connect your wallet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a Bounty</h1>
        <p className="text-slate-400 text-sm">
          Describe the work, set a reward in XLM, and lock the funds in the smart contract.
          Funds only release when you approve the deliverable — or auto-release after the deadline.
        </p>
      </div>
      <div className="rounded-2xl bg-surface-800/60 border border-white/10 p-6">
        <PostBountyForm />
      </div>
    </div>
  )
}
