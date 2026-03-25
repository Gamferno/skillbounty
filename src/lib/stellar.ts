import { Horizon } from '@stellar/stellar-sdk'
import { HORIZON_URL } from './constants'

let _server: Horizon.Server | null = null

function getServer(): Horizon.Server {
  if (!_server) {
    _server = new Horizon.Server(HORIZON_URL)
  }
  return _server
}

/**
 * Fetch the native XLM balance for a Stellar address.
 */
export async function getXlmBalance(address: string): Promise<string> {
  try {
    const server = getServer()
    const account = await server.loadAccount(address)
    const native = account.balances.find((b) => b.asset_type === 'native')
    return native?.balance ?? '0'
  } catch {
    return '0'
  }
}

/**
 * Check if an account exists on the network.
 */
export async function accountExists(address: string): Promise<boolean> {
  try {
    const server = getServer()
    await server.loadAccount(address)
    return true
  } catch {
    return false
  }
}
