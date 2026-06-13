'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { authenticate, saveSession } from '@/lib/auth'
import { getSession } from '@/lib/auth'
import { BrandLockup } from '@/components/Brand'

const DEMO_ACCOUNTS = [
  { role: 'Administrator', email: 'admin@healthintel.org', password: 'admin123', color: 'bg-blue-500' },
  { role: 'Regional Manager', email: 'regional@healthintel.org', password: 'regional123', color: 'bg-purple-500' },
  { role: 'Facility Manager', email: 'facility@healthintel.org', password: 'facility123', color: 'bg-teal-500' },
  { role: 'Public Viewer', email: 'viewer@healthintel.org', password: 'viewer123', color: 'bg-slate-500' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session) router.replace('/dashboard')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const session = authenticate(email, password)
    if (!session) {
      setError('Invalid email or password. Try one of the accounts below.')
      setLoading(false)
      return
    }
    saveSession(session)
    router.push('/dashboard')
  }

  function fillDemo(account: typeof DEMO_ACCOUNTS[0]) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #06b6d4 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
              <BrandLockup className="h-11 w-auto" />
            </div>
          </div>
          <div>
            <h1 className="mb-4 text-4xl font-bold text-white leading-tight">
              Health Intelligence<br />for Decision Makers
            </h1>
            <p className="mb-8 text-lg text-slate-300 leading-relaxed">
              Enterprise-grade PAC surveillance, geographic analysis, and population health monitoring for Ministries of Health, WHO, UNFPA, and global health partners.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'PAC Cases Monitored', value: '5,200+' },
                { label: 'Districts Covered', value: '4' },
                { label: 'Facilities Reporting', value: '14' },
                { label: 'Data Points Analyzed', value: '50K+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Powered by real-time data analytics · Built for global health professionals
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandLockup className="h-9 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Access the PAC Surveillance Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@organization.org"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick access — click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className="flex items-center gap-2 rounded-lg border bg-card p-2.5 text-left text-xs transition hover:bg-accent/50 hover:border-accent"
                >
                  <div className={`h-6 w-6 shrink-0 rounded-full ${account.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                    {account.role[0]}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{account.role}</div>
                    <div className="text-muted-foreground truncate">{account.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secure access for authorised health partners
          </p>
        </div>
      </div>
    </div>
  )
}
