import type { Metadata } from 'next'
import { Rye, Special_Elite } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/context/WalletContext'
import { Navbar } from '@/components/Navbar'

const rye = Rye({ subsets: ['latin'], weight: '400', variable: '--font-rye' })
const specialElite = Special_Elite({ subsets: ['latin'], weight: '400', variable: '--font-special-elite' })

export const metadata: Metadata = {
  title: 'SkillBounty — Frontier Bounty Board',
  description:
    'Post work, lock XLM, pay on delivery. A trustless bounty board built on the Stellar blockchain using Soroban smart contracts.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${specialElite.variable} ${rye.variable} font-special bg-wood-900 bg-wallpaper text-cream min-h-screen antialiased`}>
        <WalletProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  )
}
