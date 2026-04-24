import { Switch, Route } from 'wouter'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Roster from '@/pages/Roster'
import Schedule from '@/pages/Schedule'
import News from '@/pages/News'
import About from '@/pages/About'

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <p className="text-white/50 text-sm">Page not found.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/roster" component={Roster} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/news" component={News} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
}
