// Network and contract configuration

export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org'

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

export const ARBITRATOR_ADDRESS = process.env.NEXT_PUBLIC_ARBITRATOR_ADDRESS || ''

export const STROOPS_PER_XLM = 10_000_000n

export function stroopsToXlm(stroops: bigint): string {
  const xlm = Number(stroops) / Number(STROOPS_PER_XLM)
  return xlm.toFixed(2)
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * Number(STROOPS_PER_XLM)))
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

export const STELLAR_EXPERT_BASE = 'https://stellar.expert/explorer/testnet'

export function txExplorerUrl(hash: string): string {
  return `${STELLAR_EXPERT_BASE}/tx/${hash}`
}

export function contractExplorerUrl(address: string): string {
  return `${STELLAR_EXPERT_BASE}/contract/${address}`
}
