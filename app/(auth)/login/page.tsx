'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { login } from '@/app/actions/auth'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Nexus CRM</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[var(--radius-md)] bg-[hsl(var(--color-error)/0.1)] border border-[hsl(var(--color-error))]">
                <p className="text-sm text-[hsl(var(--color-error))]">{error}</p>
              </div>
            )}
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="admin@example.com"
              required
            />
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              required
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
