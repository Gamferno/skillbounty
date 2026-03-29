/**
 * SkillBounty Unit Tests
 *
 * Tests cover:
 *   1. stroopsToXlm  — correct XLM conversion
 *   2. xlmToStroops  — correct stroops conversion + round-trip
 *   3. truncateAddress — address display formatting
 *   4. BountyStatus enum integrity
 *   5. stroopsToXlm precision edge cases
 *   6. xlmToStroops rounding (no fractional stroops)
 *   7. truncateAddress empty / short inputs
 *   8. stroopsToXlm/xlmToStroops round-trip identity
 */

import { stroopsToXlm, xlmToStroops, truncateAddress, STROOPS_PER_XLM } from '@/lib/constants'
import { BountyStatus } from '@/types/bounty'

// ─── stroopsToXlm ─────────────────────────────────────────────────────────────

describe('stroopsToXlm', () => {
  test('converts 10_000_000 stroops to "1.00" XLM', () => {
    expect(stroopsToXlm(10_000_000n)).toBe('1.00')
  })

  test('converts 0 stroops to "0.00"', () => {
    expect(stroopsToXlm(0n)).toBe('0.00')
  })

  test('converts 50_000_000 stroops to "5.00"', () => {
    expect(stroopsToXlm(50_000_000n)).toBe('5.00')
  })

  test('converts 1 stroops to "0.00" (below 2 decimal precision)', () => {
    expect(stroopsToXlm(1n)).toBe('0.00')
  })

  test('converts 100_000 stroops to "0.01" XLM', () => {
    expect(stroopsToXlm(100_000n)).toBe('0.01')
  })

  test('converts 1_500_000_000 stroops to "150.00" XLM', () => {
    expect(stroopsToXlm(1_500_000_000n)).toBe('150.00')
  })
})

// ─── xlmToStroops ─────────────────────────────────────────────────────────────

describe('xlmToStroops', () => {
  test('converts 1 XLM to 10_000_000 stroops', () => {
    expect(xlmToStroops(1)).toBe(10_000_000n)
  })

  test('converts 0 XLM to 0 stroops', () => {
    expect(xlmToStroops(0)).toBe(0n)
  })

  test('converts 5.5 XLM to 55_000_000 stroops', () => {
    expect(xlmToStroops(5.5)).toBe(55_000_000n)
  })

  test('result is always a bigint', () => {
    expect(typeof xlmToStroops(10)).toBe('bigint')
  })

  test('round-trip: stroopsToXlm(xlmToStroops(x)) === x for whole numbers', () => {
    const xlm = 42
    const stroops = xlmToStroops(xlm)
    const backToXlm = stroopsToXlm(stroops)
    expect(backToXlm).toBe('42.00')
  })
})

// ─── truncateAddress ───────────────────────────────────────────────────────────

describe('truncateAddress', () => {
  const addr = 'GDEBVTOA3BOWI7PNO3SBTJDRB2W3SV4AEFRHXTHWZP7R76I2WAZRHO2X'

  test('default truncation keeps 6 start + 4 end chars with ellipsis', () => {
    const result = truncateAddress(addr)
    expect(result).toBe('GDEBVT...HO2X')
  })

  test('custom chars=12 keeps 12 start + 4 end', () => {
    const result = truncateAddress(addr, 12)
    expect(result).toBe('GDEBVTOA3BOW...HO2X')
  })

  test('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('')
  })

  test('always contains "..." separator', () => {
    const result = truncateAddress(addr)
    expect(result).toContain('...')
  })
})

// ─── STROOPS_PER_XLM constant ─────────────────────────────────────────────────

describe('STROOPS_PER_XLM', () => {
  test('is exactly 10_000_000n', () => {
    expect(STROOPS_PER_XLM).toBe(10_000_000n)
  })

  test('is a BigInt', () => {
    expect(typeof STROOPS_PER_XLM).toBe('bigint')
  })
})

// ─── BountyStatus enum ────────────────────────────────────────────────────────

describe('BountyStatus enum values', () => {
  test('Open status is defined', () => {
    expect(BountyStatus.Open).toBeDefined()
  })

  test('InProgress status is defined', () => {
    expect(BountyStatus.InProgress).toBeDefined()
  })

  test('Submitted status is defined', () => {
    expect(BountyStatus.Submitted).toBeDefined()
  })

  test('Completed status is defined', () => {
    expect(BountyStatus.Completed).toBeDefined()
  })

  test('Disputed status is defined', () => {
    expect(BountyStatus.Disputed).toBeDefined()
  })

  test('Refunded status is defined', () => {
    expect(BountyStatus.Refunded).toBeDefined()
  })

  test('all statuses are distinct values', () => {
    const values = [
      BountyStatus.Open,
      BountyStatus.InProgress,
      BountyStatus.Submitted,
      BountyStatus.Completed,
      BountyStatus.Disputed,
      BountyStatus.Refunded,
    ]
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })
})
