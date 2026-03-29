'use client'

import Link from 'next/link'
import { useState } from 'react'
import { WalletButton } from './WalletButton'
import { useWallet } from '@/context/WalletContext'
import { contractExplorerUrl, CONTRACT_ADDRESS } from '@/lib/constants'

function SheriffStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* 6-pointed sheriff star */}
      <path d="M12 2l1.8 4.5L18.5 5l-2.5 4 4.5 1.8-4.5 1.8 2.5 4-4.7-1.5L12 20l-1.8-4.9-4.7 1.5 2.5-4-4.5-1.8 4.5-1.8-2.5-4 4.7 1.5z" />
    </svg>
  )
}

export function Navbar() {
  const { address } = useWallet()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'The Board' },
    { href: '/leaderboard', label: 'Hall of Fame' },
    ...(address ? [
      { href: '/post', label: 'Post a Bounty' },
      { href: `/profile/${address}`, label: 'My Profile' },
    ] : []),
    ...(CONTRACT_ADDRESS ? [{ href: contractExplorerUrl(CONTRACT_ADDRESS), label: 'Contract ↗', external: true }] : []),
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b-[3px] border-wood-900 wood-panel shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <SheriffStar className="w-7 h-7 text-wanted drop-shadow-md group-hover:scale-110 transition-transform duration-200" />
            <span className="font-rye text-xl sm:text-2xl tracking-widest text-cream group-hover:text-wanted transition-colors drop-shadow-lg">
              Skill<span className="text-wanted">Bounty</span>
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden sm:flex items-center gap-6 lg:gap-8 font-rye tracking-wider">
            {links.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-special text-cream/50 hover:text-wanted transition-colors">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}
                  className="text-base text-cream/80 hover:text-wanted transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-wanted group-hover:w-full transition-all duration-300" />
                </Link>
              )
            )}
          </div>

          {/* Right side: wallet + hamburger */}
          <div className="flex items-center gap-3">
            <WalletButton />
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="sm:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded border border-wood-700/50 bg-wood-800/60 hover:bg-wood-700/60 transition-colors"
            >
              <span className={`block h-0.5 w-5 bg-cream transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-cream transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-cream transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-wood-700/50 wood-panel px-4 py-4 flex flex-col gap-4 font-rye tracking-wider">
          {links.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-special text-cream/50 hover:text-wanted transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base text-cream/80 hover:text-wanted transition-colors">
                {link.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}
