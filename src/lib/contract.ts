import {
  Contract,
  Networks,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  Account,
  xdr,
  scValToNative,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk'
import { Bounty, BountyStatus } from '@/types/bounty'
import { CONTRACT_ADDRESS, SOROBAN_RPC_URL } from './constants'

const NETWORK_PASSPHRASE = Networks.TESTNET

function getRpc(): rpc.Server {
  return new rpc.Server(SOROBAN_RPC_URL, { allowHttp: false })
}

function getContract(): Contract {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      'Contract not deployed: NEXT_PUBLIC_CONTRACT_ADDRESS is not set in .env.local. Deploy the Soroban contract first, then add its address to .env.local.',
    )
  }
  return new Contract(CONTRACT_ADDRESS)
}

// ─── ScVal helpers ───────────────────────────────────────────────────────────

function parseBounty(raw: Record<string, unknown>): Bounty {
  return {
    id: BigInt(raw.id as number),
    poster: raw.poster as string,
    hunter: raw.hunter ? (raw.hunter as string) : null,
    title: raw.title as string,
    description: raw.description as string,
    reward: BigInt(raw.reward as number),
    work_url: raw.work_url ? (raw.work_url as string) : null,
    status: Array.isArray(raw.status) ? (raw.status[0] as BountyStatus) : (raw.status as BountyStatus),
    created_at: BigInt(raw.created_at as number),
    submitted_at: raw.submitted_at ? BigInt(raw.submitted_at as number) : null,
    deadline_hours: BigInt(raw.deadline_hours as number),
  }
}

// ─── Read-only calls (no signing) ────────────────────────────────────────────

async function simulateView(method: string, args: xdr.ScVal[] = []): Promise<xdr.ScVal> {
  const server = getRpc()
  const contract = getContract()
  // Use a dummy G-address for read-only simulation — no auth needed
  const account = new Account('GDEBVTOA3BOWI7PNO3SBTJDRB2W3SV4AEFRHXTHWZP7R76I2WAZRHO2X', '0')

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const result = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(result)) {
    throw new Error('Simulation failed: ' + JSON.stringify(result))
  }
  return (result as rpc.Api.SimulateTransactionSuccessResponse).result!.retval
}

export async function fetchAllBounties(): Promise<Bounty[]> {
  try {
    const val = await simulateView('get_all_bounties')
    const native = scValToNative(val) as unknown[]
    return (native as Record<string, unknown>[]).map(parseBounty)
  } catch {
    return []
  }
}

export async function fetchBounty(id: bigint): Promise<Bounty | null> {
  try {
    const val = await simulateView('get_bounty', [nativeToScVal(id, { type: 'u64' })])
    const native = scValToNative(val) as Record<string, unknown>
    return parseBounty(native)
  } catch {
    return null
  }
}

export async function fetchReputation(wallet: string): Promise<number> {
  try {
    const val = await simulateView('get_reputation', [
      new Address(wallet).toScVal(),
    ])
    return Number(scValToNative(val))
  } catch {
    return 0
  }
}

export async function fetchBountiesByPoster(poster: string): Promise<Bounty[]> {
  try {
    const val = await simulateView('get_bounties_by_poster', [
      new Address(poster).toScVal(),
    ])
    const native = scValToNative(val) as Record<string, unknown>[]
    return native.map(parseBounty)
  } catch {
    return []
  }
}

export async function fetchBountiesByHunter(hunter: string): Promise<Bounty[]> {
  try {
    const val = await simulateView('get_bounties_by_hunter', [
      new Address(hunter).toScVal(),
    ])
    const native = scValToNative(val) as Record<string, unknown>[]
    return native.map(parseBounty)
  } catch {
    return []
  }
}

// ─── Contract invocation helpers (return unsigned XDR for wallet to sign) ────

export async function buildPostBounty(
  poster: string,
  title: string,
  description: string,
  rewardStroops: bigint,
  deadlineHours: bigint,
): Promise<string> {
  const server = getRpc()
  const contract = getContract()
  const account = await server.getAccount(poster)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'post_bounty',
        new Address(poster).toScVal(),
        nativeToScVal(title, { type: 'string' }),
        nativeToScVal(description, { type: 'string' }),
        nativeToScVal(rewardStroops, { type: 'i128' }),
        nativeToScVal(deadlineHours, { type: 'u64' }),
      ),
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(simResult)) {
    throw new Error('Simulation error: ' + JSON.stringify(simResult))
  }

  const prepared = rpc.assembleTransaction(tx, simResult).build()
  return prepared.toXDR()
}

export async function buildClaimBounty(hunter: string, bountyId: bigint): Promise<string> {
  const server = getRpc()
  const contract = getContract()
  const account = await server.getAccount(hunter)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'claim_bounty',
        new Address(hunter).toScVal(),
        nativeToScVal(bountyId, { type: 'u64' }),
      ),
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(simResult)) throw new Error('Sim error')
  return rpc.assembleTransaction(tx, simResult).build().toXDR()
}

export async function buildSubmitWork(
  hunter: string,
  bountyId: bigint,
  workUrl: string,
): Promise<string> {
  const server = getRpc()
  const contract = getContract()
  const account = await server.getAccount(hunter)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'submit_work',
        new Address(hunter).toScVal(),
        nativeToScVal(bountyId, { type: 'u64' }),
        nativeToScVal(workUrl, { type: 'string' }),
      ),
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(simResult)) throw new Error('Sim error')
  return rpc.assembleTransaction(tx, simResult).build().toXDR()
}

export async function buildApproveWork(poster: string, bountyId: bigint): Promise<string> {
  const server = getRpc()
  const contract = getContract()
  const account = await server.getAccount(poster)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'approve_work',
        new Address(poster).toScVal(),
        nativeToScVal(bountyId, { type: 'u64' }),
      ),
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(simResult)) throw new Error('Sim error')
  return rpc.assembleTransaction(tx, simResult).build().toXDR()
}

export async function buildDisputeWork(poster: string, bountyId: bigint): Promise<string> {
  const server = getRpc()
  const contract = getContract()
  const account = await server.getAccount(poster)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'dispute_work',
        new Address(poster).toScVal(),
        nativeToScVal(bountyId, { type: 'u64' }),
      ),
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(simResult)) throw new Error('Sim error')
  return rpc.assembleTransaction(tx, simResult).build().toXDR()
}

export async function buildArbitrate(
  arbitrator: string,
  bountyId: bigint,
  releaseToHunter: boolean,
): Promise<string> {
  const server = getRpc()
  const contract = getContract()
  const account = await server.getAccount(arbitrator)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'arbitrate',
        new Address(arbitrator).toScVal(),
        nativeToScVal(bountyId, { type: 'u64' }),
        nativeToScVal(releaseToHunter, { type: 'bool' }),
      ),
    )
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (!rpc.Api.isSimulationSuccess(simResult)) throw new Error('Sim error')
  return rpc.assembleTransaction(tx, simResult).build().toXDR()
}

// ─── Submit a signed XDR and poll for confirmation ──────────────────────────

export async function submitSignedTransaction(signedXdr: string): Promise<string> {
  const server = getRpc()
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  const sendResult = await server.sendTransaction(tx)

  if (sendResult.status === 'ERROR') {
    throw new Error('Transaction error: ' + JSON.stringify(sendResult.errorResult))
  }

  // Poll for confirmation (up to ~60s)
  let attempts = 0
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000))
    const getResult = await server.getTransaction(sendResult.hash)

    if (getResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return sendResult.hash
    }
    if (getResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed on-chain')
    }
    // NOT_FOUND = still pending, keep polling
    attempts++
  }

  throw new Error('Transaction confirmation timed out')
}
