'use client'

import { useEffect, useState } from 'react'

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
      <span className="text-red-400 text-sm font-medium">⚠ Deadline passed — auto-release eligible</span>
    )
  }

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  const isUrgent = hours < 24
  const textColor = isUrgent ? 'text-orange-400' : 'text-slate-300'

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-xs ${textColor} font-medium`}>
        {isUrgent && '⚡ '}Time remaining:
      </span>
      <span className={`font-mono font-bold text-sm ${textColor}`}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  )
}
