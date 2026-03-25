'use client'

import { useWallet } from '@/context/WalletContext'
import { truncateAddress } from '@/lib/constants'
import { useState } from 'react'
import { Wallet, LogOut, Copy } from 'lucide-react'

export function WalletButton() {
  const { address, balance, connecting, connect, disconnect } = useWallet()
  const [showMenu, setShowMenu] = useState(false)

  if (!address) {
    return (
      <button
        id="connect-wallet-btn"
        onClick={connect}
        disabled={connecting}
        className="wood-sign inline-flex items-center gap-2 px-5 py-2.5 rounded hover:brightness-110 disabled:opacity-60 text-cream text-sm transition-all duration-200"
      >
        {connecting ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-cream border-t-transparent rounded-full animate-spin" />
            Riding in...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 text-wanted" />
            <span className="font-rye tracking-wider mt-0.5">Draw Wallet</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        id="wallet-menu-btn"
        onClick={() => setShowMenu((v) => !v)}
        className="wood-sign inline-flex items-center gap-2 px-4 py-2 rounded hover:brightness-110 text-cream text-sm transition-all duration-200"
      >
        <span className="w-2 h-2 rounded-full bg-frontier animate-pulse" />
        <span className="font-special">{truncateAddress(address)}</span>
        {balance && (
          <span className="text-cream/70 text-xs font-special">{parseFloat(balance).toFixed(2)} XLM</span>
        )}
        <span className="text-wanted text-xs">▼</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-52 rounded bg-wood-900 border-2 border-wood-700 shadow-2xl py-1 z-50">
          <div className="px-4 py-2 border-b border-wood-700">
            <p className="text-xs text-cream/60">Connected saddlebag</p>
            <p className="text-xs font-special text-wanted mt-0.5 break-all leading-relaxed">{address}</p>
          </div>
          <button
            id="copy-address-btn"
            onClick={() => { navigator.clipboard.writeText(address); setShowMenu(false) }}
            className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-cream hover:bg-wood-800 transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy address
          </button>
          <button
            id="disconnect-wallet-btn"
            onClick={() => { disconnect(); setShowMenu(false) }}
            className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-blood hover:bg-wood-800 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Holster Up
          </button>
        </div>
      )}
    </div>
  )
}
