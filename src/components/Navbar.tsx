'use client'

import Link from 'next/link'
import { WalletButton } from './WalletButton'
import { useWallet } from '@/context/WalletContext'
import { contractExplorerUrl, CONTRACT_ADDRESS } from '@/lib/constants'

export function Navbar() {
  const { address } = useWallet()

  return (
    <nav className="sticky top-0 z-40 w-full border-b-[3px] border-wood-900 wood-panel shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl drop-shadow-md">📌</span>
            <span className="font-rye text-2xl tracking-widest text-cream group-hover:text-wanted transition-colors drop-shadow-lg">
              Skill<span className="text-wanted">Bounty</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-8 font-rye tracking-wider">
            <Link
              href="/"
              className="text-base text-cream/80 hover:text-wanted transition-colors"
            >
              The Board
            </Link>
            {address && (
              <>
                <Link
                  href="/post"
                  className="text-base text-cream/80 hover:text-wanted transition-colors"
                >
                  Post a Bounty
                </Link>
                <Link
                  href={`/profile/${address}`}
                  className="text-base text-cream/80 hover:text-wanted transition-colors"
                >
                  My Profile
                </Link>
              </>
            )}
            {CONTRACT_ADDRESS && (
              <a
                href={contractExplorerUrl(CONTRACT_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-special text-cream/50 hover:text-wanted transition-colors"
              >
                Contract ↗
              </a>
            )}
          </div>

          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
