import { Switch, Route } from 'wouter'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Roster from '@/pages/Roster'
import Schedule from '@/pages/Schedule'
import News from '@/pages/News'
import NewsArticle from '@/pages/NewsArticle'
import About from '@/pages/About'
import Coaches from '@/pages/Coaches'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'

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
    <Switch>
      {/* Admin routes — own layout, no public ticker/nav */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      {/* Public site — wrapped in Layout (ticker + nav) */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/roster" component={Roster} />
            <Route path="/schedule" component={Schedule} />
            <Route path="/news" component={News} />
            <Route path="/news/:id" component={NewsArticle} />
            <Route path="/about" component={About} />
            <Route path="/coaches" component={Coaches} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  )
}
