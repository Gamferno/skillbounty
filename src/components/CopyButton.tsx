'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      title="Copy to clipboard"
      className={`inline-flex items-center justify-center p-1 rounded-sm text-ink-light hover:text-ink hover:bg-wood-800/10 transition-colors ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-frontier" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}
