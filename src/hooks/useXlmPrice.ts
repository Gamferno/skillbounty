import { useState, useEffect } from 'react'

let cachedPrice: number | null = null
let lastFetchTime = 0
const CACHE_DURATION = 60000 // 60 seconds

export function useXlmPrice() {
  const [price, setPrice] = useState<number | null>(cachedPrice)

  useEffect(() => {
    const fetchPrice = async () => {
      const now = Date.now()
      if (cachedPrice && now - lastFetchTime < CACHE_DURATION) {
        setPrice(cachedPrice)
        return
      }

      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const newPrice = data?.stellar?.usd
        if (typeof newPrice === 'number') {
          cachedPrice = newPrice
          lastFetchTime = now
          setPrice(newPrice)
        }
      } catch (err) {
        console.error('Error fetching XLM price:', err)
      }
    }

    fetchPrice()
  }, [])

  return price
}
