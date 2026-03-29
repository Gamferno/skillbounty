'use client'

import { useEffect, useState } from 'react'
import { Scale, Flame, Clock } from 'lucide-react'

interface CountdownTimerProps {
  submittedAt: bigint // epoch seconds
  deadlineHours: bigint
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownTimer({ submittedAt, deadlineHours }: CountdownTimerProps) {
  const deadlineSecs = Number(submittedAt) + Number(deadlineHours) * 3600
  const [remaining, setRemaining] = useState(deadlineSecs - Math.floor(Date.now() / 1000))

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = deadlineSecs - Math.floor(Date.now() / 1000)
      setRemaining(secs)
    }, 1000)
    return () => clearInterval(interval)
  }, [deadlineSecs])

  if (remaining <= 0) {
    return (
      <span className="text-blood text-sm font-rye font-medium animate-pulse tracking-wider flex items-center gap-1.5">
        <Scale className="w-4 h-4 inline-block" /> Deadline passed — auto-release eligible
      </span>
    )
  }

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  const isUrgent = hours < 24
  const isCritical = hours < 6

  const textColor = isCritical
    ? 'text-blood animate-pulse font-bold scale-105'
    : isUrgent
      ? 'text-wanted font-bold text-shadow-sm'
      : 'text-ink-light'

  return (
    <div className="flex items-center gap-1.5 transition-all duration-300">
      <span className={`text-xs ${textColor} font-rye tracking-widest uppercase flex items-center gap-1`}>
        {isCritical && <Flame className="w-3.5 h-3.5" />}
        {isUrgent && !isCritical && <Clock className="w-3.5 h-3.5" />}
        Time remaining:
      </span>
      <span className={`font-special tracking-widest text-sm ${textColor}`}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  )
}
