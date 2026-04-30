import { type ReactNode } from 'react'
import TickerBar from './TickerBar'
import NavBar from './NavBar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden flex flex-col">
      <TickerBar />
      <NavBar />
      <main className="pt-8 pb-28 md:pb-8 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
