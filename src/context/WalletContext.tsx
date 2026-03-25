'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from 'react'
import { getXlmBalance } from '@/lib/stellar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalletContextType {
  address: string | null
  balance: string | null
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
  signTransaction: (xdr: string) => Promise<string>
}

// ─── Context ─────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

/**
 * We dynamically import the StellarWalletsKit ONLY on the client side.
 * The library calls localStorage.getItem at module-load time, which crashes
 * Next.js static generation. Lazy importing prevents that.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let KitModule: any = null

async function loadKit() {
  if (KitModule) return KitModule
  const mod = await import('@creit.tech/stellar-wallets-kit')
  const freighter = await import('@creit.tech/stellar-wallets-kit/modules/freighter')
  mod.StellarWalletsKit.init({
    network: mod.Networks.TESTNET,
    modules: [new freighter.FreighterModule()],
    selectedWalletId: freighter.FREIGHTER_ID,
  })
  KitModule = mod
  return mod
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const kitLoaded = useRef(false)

  // Pre-load the kit after hydration
  useEffect(() => {
    if (!kitLoaded.current) {
      kitLoaded.current = true
      loadKit().catch(console.error)
    }
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!address) return
    const bal = await getXlmBalance(address)
    setBalance(bal)
  }, [address])

  useEffect(() => {
    if (address) {
      refreshBalance()
    }
  }, [address, refreshBalance])

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const { StellarWalletsKit } = await loadKit()
      const result = await StellarWalletsKit.authModal()
      setAddress(result.address)
    } catch (err: unknown) {
      const e = err as Error
      if (e.message?.includes('User declined') || e.message?.includes('rejected')) {
        console.error('USER_REJECTED')
      } else {
        console.error('WALLET_NOT_FOUND')
      }
      throw e
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    const { StellarWalletsKit } = await loadKit()
    await StellarWalletsKit.disconnect()
    setAddress(null)
    setBalance(null)
  }, [])

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      if (!address) throw new Error('Wallet not connected')
      const { StellarWalletsKit } = await loadKit()
      try {
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
          address,
          networkPassphrase: 'Test SDF Network ; September 2015',
        })
        return signedTxXdr
      } catch (err: unknown) {
        const e = err as Error
        if (e.message?.includes('underfunded') || e.message?.includes('op_underfunded')) {
          throw new Error('INSUFFICIENT_BALANCE')
        }
        if (e.message?.includes('declined') || e.message?.includes('rejected')) {
          throw new Error('USER_REJECTED')
        }
        throw e
      }
    },
    [address],
  )

  return (
    <WalletContext.Provider
      value={{ address, balance, connecting, connect, disconnect, refreshBalance, signTransaction }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
