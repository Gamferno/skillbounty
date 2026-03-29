// TypeScript types mirroring the Soroban contract structs

export enum BountyStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Submitted = 'Submitted',
  Completed = 'Completed',
  Disputed = 'Disputed',
  Refunded = 'Refunded',
}

export interface Bounty {
  id: bigint
  poster: string
  hunter: string | null
  title: string
  description: string
  reward: bigint // stroops (1 XLM = 10_000_000 stroops)
  work_url: string | null
  status: BountyStatus
  tags: string[]
  created_at: bigint
  submitted_at: bigint | null
  deadline_hours: bigint
}

export interface Reputation {
  wallet: string
  completed: number
}

export type TransactionStatus = 'idle' | 'pending' | 'confirmed' | 'failed'

export interface TxState {
  status: TransactionStatus
  hash?: string
  error?: string
}
